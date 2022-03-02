import React, { useMemo } from "react";
import { Stack } from "@mui/material";

import { CheckoutModalFooter } from "../../components/payments/CheckoutModalFooter/CheckoutModalFooter";
import { PurchaseConfirmationBillingDetails } from "../../components/payments/PurchaseConfirmationBillingDetails/PurchaseConfirmationBillingDetails";
import { PurchaseConfirmationItemDetails } from "../../components/payments/PurchaseConfirmationItemDetails/PurchaseConfirmationItemDetails";
import { SavedPaymentMethod } from "../../domain/circle/circle.interfaces";
import { billingInfoToSavedPaymentMethodBillingInfo } from "../../domain/circle/circle.utils";
import { CheckoutItem } from "../../domain/product/product.interfaces";
import { SelectedPaymentMethod } from "../../components/public/CheckoutOverlay/CheckoutOverlay.hooks";
import { PUIDictionary } from "../../domain/dictionary/dictionary.interfaces";

export interface ConfirmationViewProps {
  checkoutItems: CheckoutItem[];
  savedPaymentMethods: SavedPaymentMethod[];
  selectedPaymentMethod: SelectedPaymentMethod;
  paymentReferenceNumber: string;
  onNext: () => void;
  dictionary: PUIDictionary;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  checkoutItems,
  savedPaymentMethods,
  selectedPaymentMethod,
  paymentReferenceNumber,
  onNext,
  dictionary,
}) => {
  const {
    billingInfo: selectedBillingInfo,
    paymentInfo: selectedPaymentInfo,
  } = selectedPaymentMethod;

  const {
    selectedPaymentMethodBillingInfo,
    selectedPaymentMethodPaymentInfo,
  } = useMemo(() => {
    if (typeof selectedPaymentInfo === "string") {
      const paymentMethod = savedPaymentMethods.find(({ id }) => id === selectedPaymentInfo);

      return {
        selectedPaymentMethodBillingInfo: paymentMethod,
        selectedPaymentMethodPaymentInfo: paymentMethod,
      }
    }

    return {
      selectedPaymentMethodBillingInfo: typeof selectedBillingInfo === "string"
        ? savedPaymentMethods.find(({ addressId }) => addressId === selectedBillingInfo)
        : billingInfoToSavedPaymentMethodBillingInfo(selectedBillingInfo) as SavedPaymentMethod,
      selectedPaymentMethodPaymentInfo: selectedPaymentInfo,
    };
  }, [savedPaymentMethods, selectedBillingInfo, selectedPaymentInfo]);

  if (!selectedPaymentMethodBillingInfo || !selectedPaymentMethodPaymentInfo) return null;

  return (
    <Stack
      direction={{
        xs: "column",
        sm: "column",
        md: "row",
      }}
      spacing={8.75}
      sx={{ display: "flex" }}>

      <PurchaseConfirmationBillingDetails
        checkoutItems={ checkoutItems }
        paymentReferenceNumber={ paymentReferenceNumber }
        selectedPaymentMethodBillingInfo={ selectedPaymentMethodBillingInfo }
        selectedPaymentMethodPaymentInfo={ selectedPaymentMethodPaymentInfo }
        dictionary={ dictionary } />

      <Stack sx={{ display: "flex", flex: 1 }}>
        <PurchaseConfirmationItemDetails
          checkoutItems={ checkoutItems }
          dictionary={ dictionary } />

        <CheckoutModalFooter
          variant="toMarketplace"
          onSubmitClicked={ onNext } />
      </Stack>

    </Stack>
  );
};
