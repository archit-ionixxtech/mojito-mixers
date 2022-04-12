import { THREEDS_FLOW_INFO_KEY, THREEDS_FLOW_RECEIVED_REDIRECT_URI_KEY, THREEDS_FLOW_STATE_USED_KEY, THREEDS_FLOW_SEARCH_PARAM_SUCCESS, THREEDS_STORAGE_EXPIRATION_MIN } from "../../../config/config";
import { getUrlWithoutParams, isLocalhost, isLocalhostOrStaging, urlToPathnameWhenPossible } from "../../../domain/url/url.utils";
import { BillingInfo } from "../../../forms/BillingInfoForm";
import { continuePlaidOAuthFlow, INITIAL_PLAID_OAUTH_FLOW_STATE } from "../../../hooks/usePlaid";
import { cookieStorage } from "../../../utils/storageUtils";
import { CheckoutModalStep } from "./CheckoutOverlay.hooks";

const debug = isLocalhostOrStaging();

export interface CheckoutModalInfo {
  url?: string;
  invoiceID: string;
  invoiceCountdownStart: number;
  processorPaymentID: string;
  paymentID: string;
  billingInfo: string | BillingInfo;
  paymentInfo: string | null;
}

export interface CheckoutModalState3DS extends CheckoutModalInfo {
  receivedRedirectUri?: string;
  continue3DSFlow: boolean;
  purchaseSuccess: boolean;
  purchaseError: boolean;
  savedStateUsed: boolean;
}

const FALLBACK_MODAL_STATE: CheckoutModalState3DS = {
  url: "",
  invoiceID: "",
  invoiceCountdownStart: 0,
  processorPaymentID: "",
  paymentID: "",
  billingInfo: "",
  paymentInfo: "",
  continue3DSFlow: false,
  purchaseSuccess: false,
  purchaseError: false,
  savedStateUsed: false,
};

export function persistCheckoutModalInfo(info: CheckoutModalInfo) {
  if (!process.browser) return;

  try {
    cookieStorage.setItem(THREEDS_FLOW_INFO_KEY, {
      ...info,
      url: info.url || getUrlWithoutParams(),
    }, {
      // domain: "",
      // path: "",
      // secure: !isLocalhost(),
      // expires: { minutes: THREEDS_STORAGE_EXPIRATION_MIN },
      expirationDate: new Date(Date.now() + THREEDS_STORAGE_EXPIRATION_MIN * 60000)
    });
  } catch (err) {
    if (debug) console.log(err);
  }
}

export function persistReceivedRedirectUri3DS(receivedRedirectUri: string) {
  cookieStorage.setItem(THREEDS_FLOW_RECEIVED_REDIRECT_URI_KEY, receivedRedirectUri);
}

export function persistCheckoutModalInfoUsed(used = true) {
  cookieStorage.setItem(THREEDS_FLOW_STATE_USED_KEY, used);
}

export function clearPersistedInfo() {
  if (debug) console.log(`💾 Clearing state (3DS)...`);

  if (process.browser) {
    cookieStorage.removeItem(THREEDS_FLOW_INFO_KEY);
    cookieStorage.removeItem(THREEDS_FLOW_RECEIVED_REDIRECT_URI_KEY);
    cookieStorage.removeItem(THREEDS_FLOW_STATE_USED_KEY);
  }

  return FALLBACK_MODAL_STATE;
}

/*
export function persistedInfoCleanUp() {

}
*/

/*
function isExpired(timestamp?: number) {
  return timestamp !== undefined && Date.now() - timestamp > THREEDS_STORAGE_EXPIRATION_MS;
}
*/

export function isInitiallyOpen() {
  return continueFlows(true).checkoutStep !== "";
}

export function getCheckoutModalState(): CheckoutModalState3DS {
  if (!process.browser) return FALLBACK_MODAL_STATE;

  let savedPlaidInfo: Partial<CheckoutModalState3DS> = {};
  let savedReceivedRedirectUri = "";
  let savedStateUsed = false;

  try {
    savedPlaidInfo = cookieStorage.getItem(THREEDS_FLOW_INFO_KEY) || {};
    savedReceivedRedirectUri = cookieStorage.getItem(THREEDS_FLOW_RECEIVED_REDIRECT_URI_KEY) || "";
    savedStateUsed = cookieStorage.getItem(THREEDS_FLOW_STATE_USED_KEY) || false;
  } catch (err) {
    if (debug) console.log(err);
  }

  const {
    url = "",
    invoiceID = "",
    invoiceCountdownStart = -1,
    processorPaymentID = "",
    paymentID = "",
    billingInfo = "",
    paymentInfo = "",
  } = savedPlaidInfo || {};

  // Swap to test error flow:
  // const receivedRedirectUri = "localhost:3000/payments/error";
  const receivedRedirectUri = savedReceivedRedirectUri || (window.location.search.startsWith(THREEDS_FLOW_SEARCH_PARAM_SUCCESS) ? window.location.href : undefined);

  // In dev, this works fine even if there's nothing in cookieStorage, which helps with testing across some other domain and localhost:
  const hasLocalhostOrigin = process.env.NODE_ENV === "development" && !isLocalhost();
  const continue3DSFlow = hasLocalhostOrigin || !!(url && invoiceID && processorPaymentID && paymentID && billingInfo && (paymentInfo || paymentInfo === null) && receivedRedirectUri);

  if ((continue3DSFlow && savedStateUsed) || (!continue3DSFlow && cookieStorage.getItem(THREEDS_FLOW_INFO_KEY))) {
    return clearPersistedInfo();
  }

  return {
    // The URL of the page where we initially opened the modal:
    url: urlToPathnameWhenPossible(url || (hasLocalhostOrigin ? "http://localhost:3000" : "")),

    // The invoiceID we need to re-load the products and units:
    invoiceID,
    invoiceCountdownStart: invoiceCountdownStart === -1 ? Date.now() : invoiceCountdownStart,

    // The reference number of the payment:
    processorPaymentID,
    paymentID,

    // The billing & payment info selected / entered before starting the 3DS flow:
    billingInfo,
    paymentInfo,

    // The redirect URI with params:
    receivedRedirectUri,

    // Whether we need to resume the 3DS flow and show the confirmation or error screens:
    continue3DSFlow,
    purchaseSuccess: continue3DSFlow && !!receivedRedirectUri && (receivedRedirectUri.includes("success") || receivedRedirectUri.includes(THREEDS_FLOW_SEARCH_PARAM_SUCCESS)),
    purchaseError: continue3DSFlow && !!receivedRedirectUri && (receivedRedirectUri.includes("error") || receivedRedirectUri.includes("failure")),

    // Wether we already tried to resume the previous OAuth flow:
    savedStateUsed,
  };
}

export function continueCheckout(noClear = false): [boolean, CheckoutModalState3DS] {
  const savedCheckoutModalState = getCheckoutModalState();
  const { continue3DSFlow } = savedCheckoutModalState;

  if (continue3DSFlow) {
    if (debug) console.log("💾 Continue 3DS Flow...", savedCheckoutModalState);

    if (!noClear) clearPersistedInfo();
  }

  return [continue3DSFlow, savedCheckoutModalState];
}

export type FlowType = "" | "3DS" | "Plaid";

export interface ContinueFlowsReturn {
  flowType: FlowType;
  checkoutStep: CheckoutModalStep | "";
  invoiceID: string;
  invoiceCountdownStart: number;
  processorPaymentID: string;
  paymentID: string;
  billingInfo: string | BillingInfo;
  paymentInfo: string | null;
}

export function continueFlows(noClear = false) {
  const [continue3DSFlow, savedCheckoutModalState] = continueCheckout(noClear);
  const continueOAuthFlow = continuePlaidOAuthFlow();
  const continueFlowsReturn: ContinueFlowsReturn = {
    flowType: "",
    checkoutStep: "",
    invoiceID: "",
    invoiceCountdownStart: -1,
    processorPaymentID: "",
    paymentID: "",
    billingInfo: "",
    paymentInfo: "",
  };

  // Uncomment to test error flow:
  // savedCheckoutModalState.purchaseSuccess = false;
  // savedCheckoutModalState.purchaseError = true;

  if (continue3DSFlow) {
    if (savedCheckoutModalState.purchaseSuccess && !savedCheckoutModalState.purchaseError) {
      continueFlowsReturn.checkoutStep = "confirmation";
    } else {
      // By the time we come back from 3DS' error page to the Payment UI, we have already seen the error, so we go
      // straight to the PaymentView to review the payment information:
      continueFlowsReturn.checkoutStep = "payment";
    }

    continueFlowsReturn.flowType = "3DS";
    continueFlowsReturn.invoiceID = savedCheckoutModalState.invoiceID;
    continueFlowsReturn.invoiceCountdownStart = savedCheckoutModalState.invoiceCountdownStart === -1 ? Date.now() : savedCheckoutModalState.invoiceCountdownStart;
    continueFlowsReturn.processorPaymentID = savedCheckoutModalState.processorPaymentID;
    continueFlowsReturn.paymentID = savedCheckoutModalState.paymentID;
    continueFlowsReturn.billingInfo = savedCheckoutModalState.billingInfo;
    continueFlowsReturn.paymentInfo = savedCheckoutModalState.paymentInfo;
  } else if (continueOAuthFlow) {
    if (debug) console.log("💾 Continue Plaid OAuth Flow...", INITIAL_PLAID_OAUTH_FLOW_STATE);

    continueFlowsReturn.flowType = "Plaid";
    continueFlowsReturn.checkoutStep = "purchasing";
    continueFlowsReturn.billingInfo = INITIAL_PLAID_OAUTH_FLOW_STATE.selectedBillingInfo;
    // continueFlowsReturn.paymentInfo = INITIAL_PLAID_OAUTH_FLOW_STATE.paymentInfo;
  }

  return continueFlowsReturn;
}
