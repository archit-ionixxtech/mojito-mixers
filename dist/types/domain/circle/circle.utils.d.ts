import { BillingInfo } from "../../forms/BillingInfoForm";
import { CircleFieldError, RawSavedPaymentMethod, SavedPaymentMethod, SavedPaymentMethodBillingInfo } from "./circle.interfaces";
import { ApolloError } from "@apollo/client";
export declare function formatPhoneAsE123(phoneNumber: string, countryCode: string): string;
export declare function transformRawSavedPaymentMethods(rawSavedPaymentMethods?: RawSavedPaymentMethod[]): SavedPaymentMethod[];
export declare function getSavedPaymentMethodAddressId({ billingDetails, metadata }: SavedPaymentMethodBillingInfo): string;
export declare function billingInfoToSavedPaymentMethodBillingInfo(billingInfo: BillingInfo): SavedPaymentMethodBillingInfo;
export declare function getSavedPaymentMethodAddressIdFromBillingInfo(billingInfo: BillingInfo): string;
export declare function savedPaymentMethodToBillingInfo(savedPaymentMethod: SavedPaymentMethod): BillingInfo;
export declare function isCircleFieldError(obj: any): obj is CircleFieldError;
export declare function isCircleFieldErrorArray(obj: any): obj is CircleFieldError[];
export declare function parseCircleError(error: ApolloError | Error): string | Record<string, string>;
