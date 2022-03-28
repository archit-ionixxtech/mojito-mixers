'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var CheckoutOverlay = require('./components/public/CheckoutOverlay/CheckoutOverlay.js');
var SuccessOverlay = require('./components/public/SuccessOverlay/SuccessOverlay.js');
var ErrorOverlay = require('./components/public/ErrorOverlay/ErrorOverlay.js');
var PlaidOverlay = require('./components/public/PlaidOverlay/PlaidOverlay.js');
var useOpenCloseCheckoutModal = require('./components/public/useOpenCloseCheckoutModal/useOpenCloseCheckoutModal.js');
var plaid_utils = require('./domain/plaid/plaid.utils.js');
var usePlaid = require('./hooks/usePlaid.js');
var CheckoutOverlay_utils = require('./components/public/CheckoutOverlay/CheckoutOverlay.utils.js');
var theme = require('./config/theme/theme.js');
var config = require('./config/config.js');

if (process.env.NODE_ENV === "development" && process.browser) {
    console.log("\n👨‍💻 PUI development mode.\n\n");
    // (window as any)._React = React;
    // (window as any)._ThemeProvider = ThemeProvider;
}

exports.PUICheckout = CheckoutOverlay.PUICheckout;
exports.PUISuccess = SuccessOverlay.PUISuccess;
exports.PUIError = ErrorOverlay.PUIError;
exports.PUIPlaid = PlaidOverlay.PUIPlaid;
exports.useOpenCloseCheckoutModal = useOpenCloseCheckoutModal.useOpenCloseCheckoutModal;
exports.getPlaidOAuthFlowState = plaid_utils.getPlaidOAuthFlowState;
exports.persistPlaidReceivedRedirectUri = plaid_utils.persistPlaidReceivedRedirectUri;
exports.continuePlaidOAuthFlow = usePlaid.continuePlaidOAuthFlow;
exports.continueCheckout = CheckoutOverlay_utils.continueCheckout;
exports.continueFlows = CheckoutOverlay_utils.continueFlows;
exports.getCheckoutModalState = CheckoutOverlay_utils.getCheckoutModalState;
exports.persistReceivedRedirectUri3DS = CheckoutOverlay_utils.persistReceivedRedirectUri3DS;
exports.MOJITO_DARK_THEME = theme.MOJITO_DARK_THEME;
exports.MOJITO_LIGHT_THEME = theme.MOJITO_LIGHT_THEME;
exports.extendDefaultTheme = theme.extendDefaultTheme;
exports.THREEDS_FLOW_SEARCH_PARAM_ERROR_KEY = config.THREEDS_FLOW_SEARCH_PARAM_ERROR_KEY;
exports.THREEDS_FLOW_SEARCH_PARAM_SUCCESS_KEY = config.THREEDS_FLOW_SEARCH_PARAM_SUCCESS_KEY;
//# sourceMappingURL=index.js.map
