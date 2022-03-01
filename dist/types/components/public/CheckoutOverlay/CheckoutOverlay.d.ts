import React from "react";
import { UserFormat } from "../../../domain/auth/authentication.interfaces";
import { PaymentType } from "../../../domain/payment/payment.interfaces";
import { CheckoutItemInfo } from "../../../domain/product/product.interfaces";
import { Theme, SxProps } from "@mui/material/styles";
import { ConsentType } from "../../shared/ConsentText/ConsentText";
import { CheckoutModalError } from "./CheckoutOverlay.hooks";
import { ProvidersInjectorProps } from "../../shared/ProvidersInjector/ProvidersInjector";
import { CustomTextsKeys } from "../../../domain/customTexts/customTexts.interfaces";
export interface PUICheckoutOverlayProps {
    open: boolean;
    onClose: () => void;
    guestCheckoutEnabled?: boolean;
    productConfirmationEnabled?: boolean;
    logoSrc: string;
    logoSx?: SxProps<Theme>;
    loaderImageSrc: string;
    purchasingImageSrc: string;
    purchasingMessages?: false | string[];
    errorImageSrc: string;
    userFormat: UserFormat;
    acceptedPaymentTypes: PaymentType[];
    paymentLimits?: Partial<Record<PaymentType, number>>;
    customTexts: Record<CustomTextsKeys, React.ReactFragment[]>;
    consentType?: ConsentType;
    privacyHref?: string;
    termsOfUseHref?: string;
    orgID: string;
    invoiceID?: string;
    checkoutItems: CheckoutItemInfo[];
    onLogin: () => void;
    isAuthenticated?: boolean;
    isAuthenticatedLoading?: boolean;
    debug?: boolean;
    onError?: (error: CheckoutModalError) => void;
    onMarketingOptInChange?: (marketingOptIn: boolean) => void;
}
export declare type PUICheckoutProps = PUICheckoutOverlayProps & ProvidersInjectorProps;
export declare const PUICheckoutOverlay: React.FC<PUICheckoutOverlayProps>;
export declare const PUICheckout: React.FC<PUICheckoutProps>;
