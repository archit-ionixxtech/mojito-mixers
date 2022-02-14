
import { ApolloError } from "@apollo/client";
import { Dispatch, SetStateAction, useState, useCallback } from "react";
import { PaymentMethod } from "../../../domain/payment/payment.interfaces";
import { BillingInfo } from "../../../forms/BillingInfoForm";
import { INITIAL_PLAID_OAUTH_FLOW_STATE } from "../../../hooks/usePlaid";
import { resetStepperProgress } from "../CheckoutStepper/CheckoutStepper";

export type CheckoutModalErrorAt = "loading" | "billing" | "payment" | "purchasing";

export interface CheckoutModalError {
  error?: ApolloError | Error;
  errorMessage: string;
  at?: CheckoutModalErrorAt;
}

export type CheckoutModalStep = "authentication" | "billing" | "payment" | "purchasing" | "confirmation";

export interface CheckoutModalStateOptions {
  productConfirmationEnabled?: boolean;
  isAuthenticated?: boolean;
}

export interface CheckoutModalState {
  checkoutStep: CheckoutModalStep;
  checkoutError?: CheckoutModalError;
}

export interface SelectedPaymentMethod {
  billingInfo: string | BillingInfo;
  paymentInfo: string | PaymentMethod;
  cvv: string;
}

export interface CheckoutModalStateReturn extends CheckoutModalState {
  // CheckoutModalState (+ inherited stuff):
  setCheckoutModalState: Dispatch<SetStateAction<CheckoutModalState>>;
  resetModalState: () => void;
  goBack: () => void;
  goNext: () => void;
  goTo: (nextCheckoutStep: CheckoutModalStep) => void;
  setError: (nextErrorMessage: string) => void;

  // SelectedPaymentMethod:
  selectedPaymentMethod: SelectedPaymentMethod;
  setSelectedPaymentMethod: Dispatch<SetStateAction<SelectedPaymentMethod>>;
}

export const CHECKOUT_STEPS: CheckoutModalStep[] = ["authentication", "billing", "payment", "purchasing", "confirmation"];

export function useCheckoutModalState({
  productConfirmationEnabled,
  isAuthenticated,
}: CheckoutModalStateOptions): CheckoutModalStateReturn {
  const startAt: CheckoutModalStep = !isAuthenticated || productConfirmationEnabled ? "authentication" : "billing";

  const [{
    checkoutStep,
    checkoutError,
  }, setCheckoutModalState] = useState<CheckoutModalState>({
    checkoutStep: startAt,
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SelectedPaymentMethod>({
    billingInfo: "",
    paymentInfo: "",
    cvv: "",
  });

  const resetModalState = useCallback(() => {
    // Make sure the progress tracker in BillingView and PaymentView is properly animated:
    resetStepperProgress();

    // Once authentication has loaded, we know if we need to skip the product confirmation step or not. Also, when the
    // modal is re-opened, we need to reset its state, taking into account if we need to resume a Plaid OAuth flow:s
    const { selectedBillingInfo, continueOAuthFlow, savedStateUsed } = INITIAL_PLAID_OAUTH_FLOW_STATE;

    setCheckoutModalState({ checkoutStep: continueOAuthFlow && !savedStateUsed ? "purchasing" : startAt });

    setSelectedPaymentMethod({
      billingInfo: selectedBillingInfo || "",
      paymentInfo: "",
      cvv: "",
    });
  }, [startAt]);

  const goBack = useCallback(() => {
    setCheckoutModalState(({ checkoutStep, checkoutError }) => ({
      checkoutError,
      checkoutStep: CHECKOUT_STEPS[Math.max(CHECKOUT_STEPS.indexOf(checkoutStep) - 1, 0)],
    }));
  }, []);

  const goNext = useCallback(() => {
    setCheckoutModalState(({ checkoutStep, checkoutError }) => ({
      checkoutError,
      checkoutStep: CHECKOUT_STEPS[Math.min(CHECKOUT_STEPS.indexOf(checkoutStep) + 1, CHECKOUT_STEPS.length - 1)],
    }));
  }, []);

  const goTo = useCallback((nextCheckoutStep: CheckoutModalStep) => {
    console.log("goTo", nextCheckoutStep);

    setCheckoutModalState((prevState) => ({ ...prevState, checkoutStep: nextCheckoutStep }));
  }, []);

  const setError = useCallback((nextErrorMessage: string) => {
    setCheckoutModalState((prevState) => ({ ...prevState, checkoutError: { errorMessage: nextErrorMessage } }));
  }, []);

  console.log("checkoutStep =", checkoutStep);

  return {
    // CheckoutModalState:
    checkoutStep,
    checkoutError,
    setCheckoutModalState,
    resetModalState,
    goBack,
    goNext,
    goTo,
    setError,

    // SelectedPaymentMethod:
    selectedPaymentMethod,
    setSelectedPaymentMethod,
  };
}
