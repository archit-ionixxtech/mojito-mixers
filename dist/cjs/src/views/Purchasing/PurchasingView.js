'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var useFullPayment = require('../../hooks/useFullPayment.js');
var material = require('@mui/material');
var corre = require('@swyg/corre');
var errors_constants = require('../../domain/errors/errors.constants.js');
var themeConstants = require('../../config/theme/themeConstants.js');
var StatusIcon = require('../../components/shared/StatusIcon/StatusIcon.js');
var graphqlGenerated = require('../../queries/graphqlGenerated.js');
var CheckoutOverlay_utils = require('../../components/public/CheckoutOverlay/CheckoutOverlay.utils.js');
var config = require('../../config/config.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const PurchasingView = ({ threeDSEnabled, purchasingImageSrc, purchasingMessages: customPurchasingMessages, orgID, invoiceID, invoiceCountdownStart, checkoutItems, savedPaymentMethods, selectedPaymentMethod, wallet, onPurchaseSuccess, onPurchaseError, onDialogBlocked, debug, }) => {
    var _a, _b, _c;
    const { billingInfo, paymentInfo, cvv } = selectedPaymentMethod;
    const isCreditCardPayment = cvv || (paymentInfo !== null && typeof paymentInfo === "object" && paymentInfo.type === "CreditCard");
    // Minimum wait time:
    const [hasWaited, setHasWaited] = React.useState(false);
    corre.useTimeout(() => {
        setHasWaited(true);
    }, config.PURCHASING_MIN_WAIT_MS);
    // Actual payment mutation & state:
    const [fullPaymentState, fullPayment] = useFullPayment.useFullPayment({
        orgID,
        invoiceID,
        savedPaymentMethods,
        selectedPaymentMethod,
        wallet,
        debug,
    });
    // Load 3DS redirect URL when needed:
    const [redirectURL, setRedirectURL] = React.useState(threeDSEnabled && isCreditCardPayment ? "" : null);
    const skipPaymentNotificationRedirect = !threeDSEnabled ||
        !isCreditCardPayment ||
        !!redirectURL ||
        fullPaymentState.paymentStatus !== "processed";
    const paymentNotificationResult = graphqlGenerated.useGetPaymentNotificationQuery({
        skip: skipPaymentNotificationRedirect,
        pollInterval: config.PAYMENT_NOTIFICATION_INTERVAL_MS,
    });
    const nextRedirectURL = ((_c = (_b = (_a = paymentNotificationResult.data) === null || _a === void 0 ? void 0 : _a.getPaymentNotification) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.redirectURL) || "";
    React.useEffect(() => {
        if (skipPaymentNotificationRedirect)
            return;
        setRedirectURL((prevRedirectURL) => {
            const redirectURL = prevRedirectURL || nextRedirectURL;
            if (debug)
                console.log(`  👀 getPaymentNotificationQuery`, { redirectURL });
            return redirectURL;
        });
    }, [skipPaymentNotificationRedirect, nextRedirectURL, debug]);
    // Triggers for payment mutation and onPurchaseSuccess/onPurchaseError callbacks:
    const fullPaymentCalledRef = React.useRef(false);
    const purchaseSuccessHandledRef = React.useRef(false);
    corre.useTimeout(() => {
        if (purchaseSuccessHandledRef.current)
            return;
        purchaseSuccessHandledRef.current = true;
        onPurchaseError(errors_constants.ERROR_PURCHASE_TIMEOUT());
    }, redirectURL === null ? null : config.PAYMENT_CREATION_TIMEOUT_MS, [onPurchaseError]);
    React.useEffect(() => {
        if (fullPaymentCalledRef.current)
            return;
        fullPaymentCalledRef.current = true;
        fullPayment();
    }, [fullPayment]);
    React.useEffect(() => {
        const { paymentStatus, processorPaymentID, paymentID, paymentError } = fullPaymentState;
        if (paymentStatus === "processing") {
            onDialogBlocked(true);
            return;
        }
        if (paymentStatus === "error" || paymentError) {
            onPurchaseError(paymentError);
            return;
        }
        if (!hasWaited || redirectURL === "" || purchaseSuccessHandledRef.current)
            return;
        purchaseSuccessHandledRef.current = true;
        const skipRedirect = config.DEV_SKIP_3DS_IN_LOCALHOST ;
        if (redirectURL && !skipRedirect) {
            CheckoutOverlay_utils.persistCheckoutModalInfo({
                invoiceID,
                invoiceCountdownStart,
                processorPaymentID,
                paymentID,
                billingInfo,
                paymentInfo: typeof paymentInfo === "string" ? paymentInfo : null,
                checkoutItems,
            });
        }
        onPurchaseSuccess(processorPaymentID, paymentID, (redirectURL || ""));
    }, [
        fullPaymentState,
        hasWaited,
        isCreditCardPayment,
        redirectURL,
        billingInfo,
        paymentInfo,
        onPurchaseError,
        onDialogBlocked,
        onPurchaseSuccess,
        invoiceID,
        invoiceCountdownStart,
        checkoutItems,
        debug,
    ]);
    // Purchasing Messages:
    const [purchasingMessageIndex, setPurchasingMessageIndex] = React.useState(0);
    corre.useInterval(() => {
        setPurchasingMessageIndex(prevWaitMessageIndex => Math.min(prevWaitMessageIndex + 1, config.PURCHASING_MESSAGES_DEFAULT.length - 1));
    }, config.PURCHASING_MESSAGES_INTERVAL_MS);
    let purchasingMessages = customPurchasingMessages;
    if (purchasingMessages === false) {
        purchasingMessages = [];
    }
    else if (purchasingMessages === undefined || purchasingMessages.length === 0) {
        purchasingMessages = config.PURCHASING_MESSAGES_DEFAULT;
    }
    const purchasingMessage = purchasingMessages[purchasingMessageIndex];
    return (React__default["default"].createElement(material.Box, null,
        React__default["default"].createElement(StatusIcon.StatusIcon, { variant: "loading", imgSrc: purchasingImageSrc, sx: { mt: 5 } }),
        purchasingMessage ? React__default["default"].createElement(material.Typography, { variant: "body2", sx: { textAlign: "center", mt: 1.5 } }, purchasingMessage) : null,
        React__default["default"].createElement(material.Box, { sx: { maxWidth: themeConstants.XS_MOBILE_MAX_WIDTH, mx: "auto", my: 5 } },
            React__default["default"].createElement(material.Typography, { variant: "body2", sx: { textAlign: "center", mb: 1.5 } }, "Hang tight! We are currently processing your payment."),
            React__default["default"].createElement(material.Typography, { variant: "body2", sx: { textAlign: "center" } }, "Please, don't close or reload the page..."))));
};

exports.PurchasingView = PurchasingView;
//# sourceMappingURL=PurchasingView.js.map
