
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckoutItemCostBreakdown } from "../../components/payments/CheckoutItemCost/Breakdown/CheckoutItemCostBreakdown";
import { CheckoutStepper } from "../../components/payments/CheckoutStepper/CheckoutStepper";
import { CheckoutItem } from "../../domain/product/product.interfaces";
import React from "react";
import { PaymentMethodForm } from "../../forms/PaymentMethodForm";
import { PaymentMethod, PaymentType } from "../../domain/payment/payment.interfaces";
import { SavedPaymentDetailsSelector } from "../../components/shared/SavedPaymentDetailsSelector/SavedPaymentDetailsSelector";
import { BillingInfoItem } from "../../components/payments/BillingInfo/Item/BillingInfoItem";
import { SavedPaymentMethod } from "../../domain/circle/circle.interfaces";
import { billingInfoToSavedPaymentMethodBillingInfo } from "../../domain/circle/circle.utils";
import { SelectedPaymentMethod } from "../../components/payments/CheckoutModal/CheckoutModal";
import { BoxProps } from "@mui/material";
import { usePlaid } from "../../hooks/usePlaid";

const billingInfoItemBoxProps: BoxProps = { sx: { mt: 2.5 } };

export interface PaymentViewProps {
  checkoutItem: CheckoutItem;
  savedPaymentMethods: SavedPaymentMethod[];
  selectedPaymentMethod: SelectedPaymentMethod;
  onPaymentInfoSelected: (data: string | PaymentMethod) => void;
  onSavedPaymentMethodDeleted: (savedPaymentMethodId: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  acceptedPaymentTypes: PaymentType[];
  privacyHref: string;
  termsOfUseHref: string;
}

export const PaymentView: React.FC<PaymentViewProps> = ({
  checkoutItem,
  savedPaymentMethods: rawSavedPaymentMethods,
  selectedPaymentMethod,
  onPaymentInfoSelected,
  onSavedPaymentMethodDeleted,
  onNext,
  onPrev,
  onClose,
  acceptedPaymentTypes,
  privacyHref,
  termsOfUseHref,
}) => {
  const {
    billingInfo: selectedBillingInfo,
    paymentInfo: selectedPaymentInfo,
  } = selectedPaymentMethod;

  const savedPaymentMethods = useMemo(() => {
    if (typeof selectedBillingInfo !== "string") return [];

    return rawSavedPaymentMethods.filter(({ addressId, type }) => addressId === selectedBillingInfo && acceptedPaymentTypes.includes(type));
  }, [acceptedPaymentTypes, rawSavedPaymentMethods, selectedBillingInfo]);

  const selectedPaymentMethodBillingInfo = useMemo(() => {
    return typeof selectedBillingInfo === "string"
      ? rawSavedPaymentMethods.find(({ addressId }) => addressId === selectedBillingInfo)
      : billingInfoToSavedPaymentMethodBillingInfo(selectedBillingInfo) as SavedPaymentMethod;
  }, [rawSavedPaymentMethods, selectedBillingInfo]);

  const [{ isDeleting, showSaved }, setViewState] = useState({
    isDeleting: false,
    showSaved: savedPaymentMethods.length > 0 && typeof selectedBillingInfo === "string",
  });

  const handleShowForm = useCallback(() => {
    setViewState({ isDeleting: false, showSaved: false });
  }, []);

  const handleShowSaved = useCallback(() => {
    setViewState({ isDeleting: false, showSaved: true });
  }, []);

  const handleSubmit = useCallback((data: PaymentMethod) => {
    onPaymentInfoSelected(data);
    onNext();
  }, [onPaymentInfoSelected, onNext]);

  const handleSavedPaymentMethodDeleted = useCallback(async (savedPaymentMethodId: string) => {
    setViewState({ isDeleting: true, showSaved: true });

    await onSavedPaymentMethodDeleted(savedPaymentMethodId);

    const remainingPaymentMethods = savedPaymentMethods.length - 1;

    setViewState({ isDeleting: false, showSaved: remainingPaymentMethods > 0 });
  }, [onSavedPaymentMethodDeleted, savedPaymentMethods.length]);

  useEffect(() => {
    if (!selectedPaymentMethodBillingInfo) onPrev();
  }, [selectedPaymentMethodBillingInfo, onPrev]);

  useEffect(() => {
    const selectedPaymentInfoMatch = typeof selectedPaymentInfo === "string" && savedPaymentMethods.some(({ id }) => id === selectedPaymentInfo);

    if (showSaved && savedPaymentMethods.length > 0 && !selectedPaymentInfoMatch) {
      onPaymentInfoSelected(savedPaymentMethods[0].id);
    }
  }, [showSaved, onPaymentInfoSelected, savedPaymentMethods, selectedPaymentInfo]);

  // PLAIN LINKS:
  const onPlaidLinkClicked = usePlaid({
    selectedBillingInfo,
  });

  // TODO: Handle errors properly:
  if (!selectedPaymentMethodBillingInfo) return null;

  return (<>
    <CheckoutItemCostBreakdown checkoutItem={ checkoutItem } />

    <CheckoutStepper progress={ 100 } />

    <BillingInfoItem
      data={ selectedPaymentMethodBillingInfo }
      additionalProps={{ onEdit: onPrev, disabled: isDeleting, boxProps: billingInfoItemBoxProps }} />

    { showSaved ? (
      <SavedPaymentDetailsSelector
        showLoader={ isDeleting }
        savedPaymentMethods={ savedPaymentMethods }
        selectedPaymentMethodId={ typeof selectedPaymentInfo === "string" ? selectedPaymentInfo : undefined}
        onNew={ handleShowForm }
        onDelete={ handleSavedPaymentMethodDeleted }
        onPick={ onPaymentInfoSelected }
        onNext={ onNext }
        onClose={ onClose }
        privacyHref={ privacyHref }
        termsOfUseHref={ termsOfUseHref } />
    ) : (
      <PaymentMethodForm
        acceptedPaymentTypes={acceptedPaymentTypes}
        defaultValues={ typeof selectedPaymentInfo === "string" ? undefined : selectedPaymentInfo }
        onPlaidLinkClicked={ onPlaidLinkClicked }
        onSaved={ savedPaymentMethods.length > 0 ? handleShowSaved : undefined }
        onClose={ onClose }
        onSubmit={ handleSubmit }
        privacyHref={ privacyHref }
        termsOfUseHref={ termsOfUseHref } />
    ) }
  </>);
};
