import { ApolloError } from "@apollo/client";
import { useState, useCallback } from "react";
import { CheckoutModalError, SelectedPaymentMethod } from "../components/public/CheckoutOverlay/CheckoutOverlay.hooks";
import { SavedPaymentMethod } from "../domain/circle/circle.interfaces";
import { billingInfoToBillingDetails, savedPaymentMethodToBillingInfo } from "../domain/circle/circle.utils";
import { ERROR_PURCHASE_CREATING_PAYMENT_METHOD, ERROR_PURCHASE_CVV, ERROR_PURCHASE_NO_ITEMS, ERROR_PURCHASE_PAYING, ERROR_PURCHASE_SELECTED_PAYMENT_METHOD } from "../domain/errors/errors.constants";
import { PaymentStatus, PaymentType } from "../domain/payment/payment.interfaces";
import { CheckoutItem } from "../domain/product/product.interfaces";
import { getUrlWithoutParams } from "../domain/url/url.utils";
import { Wallet } from "../domain/wallet/wallet.interfaces";
import { filterSpecialWalletAddressValues } from "../domain/wallet/wallet.utils";
import { BillingInfo } from "../forms/BillingInfoForm";
import { CreatePaymentMetadataInput, CryptoBillingDetails, CryptoPaymentDetails, useCreatePaymentMutation, WirePaymentDetails, WireInstructions } from "../queries/graphqlGenerated";
import { useCreatePaymentMethod } from "./useCreatePaymentMethod";
import { useEncryptCardData } from "./useEncryptCard";

let lastPaymentMethodID = "";

export function getLastPaymentMethodID() {
  return lastPaymentMethodID;
}

export interface UseFullPaymentOptions {
  orgID: string;
  invoiceID: string;
  checkoutItems: CheckoutItem[];
  savedPaymentMethods: SavedPaymentMethod[];
  selectedPaymentMethod: SelectedPaymentMethod;
  wallet: null | string | Wallet;
  coinbaseSuccessURL?: string;
  coinbaseErrorURL?: string;
  debug?: boolean;
}

export interface FullPaymentState {
  paymentStatus: PaymentStatus;
  paymentMethodID: string;
  processorPaymentID: string;
  paymentID: string;
  hostedURL: string;
  paymentError?: string | CheckoutModalError;
  wireInstructions?: WireInstructions
}

export function useFullPayment({
  orgID,
  invoiceID,
  checkoutItems,
  savedPaymentMethods,
  selectedPaymentMethod,
  wallet,
  coinbaseSuccessURL,
  coinbaseErrorURL,
  debug = false,
}: UseFullPaymentOptions): [FullPaymentState, (discountCodeID?: string) => Promise<void>] {
  const [paymentState, setPaymentState] = useState<FullPaymentState>({
    paymentStatus: "processing",
    paymentMethodID: "",
    processorPaymentID: "",
    paymentID: "",
    hostedURL: "",
  });

  const setError = useCallback((paymentError: string | CheckoutModalError) => {
    setPaymentState({
      paymentStatus: "error",
      paymentMethodID: "",
      processorPaymentID: "",
      paymentID: "",
      hostedURL: "",
      paymentError,
    });
  }, []);

  const [encryptCardData] = useEncryptCardData({ orgID });
  const [createPaymentMethod] = useCreatePaymentMethod({ orgID, debug });
  const [makePayment] = useCreatePaymentMutation();

  const fullPayment = useCallback(async (discountCodeID?: string) => {
    const {
      billingInfo: selectedBillingInfo,
      paymentInfo: selectedPaymentInfo,
    } = selectedPaymentMethod;

    if (selectedPaymentInfo === null) {
      setError(ERROR_PURCHASE_CREATING_PAYMENT_METHOD());

      return;
    }

    let paymentType: PaymentType | "";
    let cvv = "";

    if (typeof selectedPaymentInfo === "string") {
      paymentType = selectedPaymentMethod.paymentType;
      cvv = selectedPaymentMethod.cvv;
    } else {
      paymentType = selectedPaymentInfo.type;

      if (selectedPaymentInfo.type === "CreditCard") {
        cvv = selectedPaymentInfo.secureCode;
      }
    }

    if (debug) {
      console.log(
        invoiceID
          ? `\n💵 Making payment for invoice ${ invoiceID } (orgID = ${ orgID })...\n`
          : `\n💵 Aborting payment for unknown invoice (orgID = ${ orgID })...\n`,
      );
    }

    if (!invoiceID) {
      setError(ERROR_PURCHASE_NO_ITEMS());

      return;
    }

    setPaymentState({
      paymentStatus: "processing",
      paymentMethodID: "",
      processorPaymentID: "",
      paymentID: "",
      hostedURL: "",
    });

    let paymentMethodID = "";
    let selectedBillingInfoData: BillingInfo | undefined;
    let processorPaymentID = "";
    let paymentID = "";
    let hostedURL = "";
    let mutationError: ApolloError | Error | undefined;

    if (typeof selectedBillingInfo === "string") {
      // If selectedPaymentInfo is an object and selectedBillingInfo is an addressID, we need to find the matching
      // data in savedPaymentMethods:
      const matchingPaymentMethod = savedPaymentMethods.find(({ addressId }) => addressId === selectedBillingInfo);

      if (!matchingPaymentMethod) {
        setError(ERROR_PURCHASE_SELECTED_PAYMENT_METHOD());

        return;
      }

      selectedBillingInfoData = savedPaymentMethodToBillingInfo(matchingPaymentMethod);
    } else {
      // If both selectedPaymentInfo and selectedBillingInfo are objects, we just create a new payment method with them:
      selectedBillingInfoData = selectedBillingInfo;
    }

    if (typeof selectedPaymentInfo === "string") {
      // If selectedPaymentInfo is a payment method ID, that's all we need, no need to create a new payment method:
      paymentMethodID = selectedPaymentInfo;
    } else if (selectedBillingInfoData) {
      if (debug) {
        console.log("  💳 createPaymentMethod", {
          orgID,
          selectedBillingInfoData,
          selectedPaymentInfo,
        });
      }

      const createPaymentMethodResult = await createPaymentMethod(
        selectedBillingInfoData,
        selectedPaymentInfo,
      ).catch((error: ApolloError | Error) => {
        mutationError = error;

        if (debug) console.log("      🔴 createPaymentMethod error", error);
      });

      if (createPaymentMethodResult && !createPaymentMethodResult.errors) {
        if (debug) console.log("      🟢 createPaymentMethod result", createPaymentMethodResult);

        paymentMethodID = createPaymentMethodResult.data?.createPaymentMethod?.id || "";
      }
    }

    if (!paymentMethodID) {
      setError(ERROR_PURCHASE_CREATING_PAYMENT_METHOD(mutationError));

      return;
    }

    if (debug) {
      console.log("  💸 makePayment", {
        paymentMethodID,
        invoiceID,
      });
    }

    let destinationAddress = "";

    if (typeof wallet === "object") {
      destinationAddress = wallet?.address || "";
    } else {
      destinationAddress = filterSpecialWalletAddressValues(wallet);
    }

    const metadata: CreatePaymentMetadataInput = destinationAddress ? { destinationAddress } : { };

    if (discountCodeID) {
      metadata.discountCodeID = discountCodeID;
    }

    if (paymentType === "CreditCard" && cvv) {
      const encryptCardDataResult = await encryptCardData({
        cvv,
      }).catch((error: ApolloError | Error) => {
        mutationError = error;

        // TODO: Cancel invoice?

        if (debug) console.log("    🔴 encryptCardData error", error);
      });

      if (!encryptCardDataResult) {
        setError(ERROR_PURCHASE_CVV(mutationError));

        return;
      }

      const { keyID, encryptedCardData } = encryptCardDataResult;

      metadata.creditCardData = {
        keyID,
        encryptedData: encryptedCardData,
      };
    } else if (paymentType === "Crypto") {
      const currentURL = getUrlWithoutParams();
      const billingDetails = selectedBillingInfoData ? billingInfoToBillingDetails<CryptoBillingDetails>(selectedBillingInfoData, "Crypto") : undefined;

      metadata.cryptoData = {
        name: checkoutItems[0].name || "",
        description: checkoutItems[0].description || "",
        billingDetails,
        redirectURL: coinbaseSuccessURL || currentURL,
        cancelURL: coinbaseErrorURL || currentURL,
      };
    }

    const makePaymentResult = await makePayment({
      variables: {
        paymentMethodID,
        invoiceID,
        metadata,
      },
    }).catch((error: ApolloError | Error) => {
      mutationError = error;

      if (debug) console.log("    🔴 makePayment error", error);
    });

    if (makePaymentResult && !makePaymentResult.errors) {
      if (debug) console.log("    🟢 makePayment result", makePaymentResult);

      // Just so that we know what payment method has been used in CheckoutOverlay.tsx:
      lastPaymentMethodID = paymentMethodID;

      processorPaymentID = makePaymentResult.data?.createPayment?.processorPaymentID || "";
      paymentID = makePaymentResult.data?.createPayment?.id || "";
      hostedURL = (makePaymentResult.data?.createPayment?.details as CryptoPaymentDetails)?.hostedURL || "";
    }

    const wireInstructions = (makePaymentResult?.data?.createPayment?.details as WirePaymentDetails)?.WireInstructions;

    if (!processorPaymentID && (wireInstructions === null || wireInstructions === undefined)) {
      setError(ERROR_PURCHASE_PAYING(mutationError));
      return;
    }

    // TODO: Error handling and automatic retry:
    setPaymentState({
      paymentStatus: "processed",
      paymentMethodID,
      processorPaymentID,
      paymentID,
      hostedURL,
      wireInstructions,
    });
  }, [
    orgID,
    invoiceID,
    checkoutItems,
    savedPaymentMethods,
    selectedPaymentMethod,
    wallet,
    coinbaseSuccessURL,
    coinbaseErrorURL,
    debug,
    setError,
    encryptCardData,
    createPaymentMethod,
    makePayment,
  ]);

  return [paymentState, fullPayment];
}
