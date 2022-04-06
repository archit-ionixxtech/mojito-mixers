'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_es6 = require('../../../../node_modules/tslib/tslib.es6.js');
var material = require('@mui/material');
var React = require('react');
var circle_utils = require('../../../domain/circle/circle.utils.js');
var graphqlGenerated = require('../../../queries/graphqlGenerated.js');
var AuthenticationView = require('../../../views/Authentication/AuthenticationView.js');
var BillingView = require('../../../views/Billing/BillingView.js');
var ConfirmationView = require('../../../views/Confirmation/ConfirmationView.js');
var PaymentView = require('../../../views/Payment/PaymentView.js');
var CheckoutModalHeader = require('../../payments/CheckoutModalHeader/CheckoutModalHeader.js');
var PurchasingView = require('../../../views/Purchasing/PurchasingView.js');
var ErrorView = require('../../../views/Error/ErrorView.js');
var usePlaid = require('../../../hooks/usePlaid.js');
var CheckoutOverlay_hooks = require('./CheckoutOverlay.hooks.js');
var errors_constants = require('../../../domain/errors/errors.constants.js');
var FullScreenOverlay = require('../../shared/FullScreenOverlay/FullScreenOverlay.js');
var ProvidersInjector = require('../../shared/ProvidersInjector/ProvidersInjector.js');
var product_utils = require('../../../domain/product/product.utils.js');
var useCreateInvoiceAndReservation = require('../../../hooks/useCreateInvoiceAndReservation.js');
var useCheckoutItemCostTotal = require('../../../hooks/useCheckoutItemCostTotal.js');
var DictionaryProvider = require('../../../providers/DictionaryProvider.js');
var config = require('../../../config/config.js');
var wallet_constants = require('../../../domain/wallet/wallet.constants.js');
var StatusIcon = require('../../shared/StatusIcon/StatusIcon.js');
var StaticSuccessOverlay = require('../SuccessOverlay/StaticSuccessOverlay.js');
var StaticErrorOverlay = require('../ErrorOverlay/StaticErrorOverlay.js');
var useContdown = require('../../../hooks/useContdown.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const DEV_DEBUG_ENABLED = process.browser && localStorage.getItem(config.DEV_DEBUG_ENABLED_KEY) === "true";
const PUICheckoutOverlay = ({ 
// Modal:
open, onClose, onGoTo, 
// TODO: Move to dictionary:
goToHref, goToLabel, 
// Flow:
loaderMode: initialLoaderMode = "default", paymentErrorParam, onRemoveUrlParams, guestCheckoutEnabled, productConfirmationEnabled, vertexEnabled = true, threeDSEnabled = true, 
// Personalization:
logoSrc, logoSx, loaderImageSrc, purchasingImageSrc, purchasingMessages, successImageSrc, errorImageSrc, userFormat, acceptedPaymentTypes, acceptedCreditCardNetworks, network, paymentLimits, // Not implemented yet. Used to show payment limits for some payment types.
dictionary, 
// Legal:
consentType, 
// Data:
orgID, invoiceID: initialInvoiceID, checkoutItems: parentCheckoutItems, 
// Authentication:
onLogin, isAuthenticated, isAuthenticatedLoading, 
// Other Events:
debug: parentDebug, onEvent, onError, }) => {
    var _a, _b, _c;
    const [debug, setDebug] = React.useState(!!parentDebug);
    // Initialization, just to prevent issues with Next.js' SSR:
    React.useEffect(() => {
        setDebug((prevDebug) => {
            const nextDebug = prevDebug || DEV_DEBUG_ENABLED;
            if (nextDebug)
                console.log(`\n🐞 DEBUG MODE ENABLED!\n\n`);
            return nextDebug;
        });
    }, []);
    // Actual changes triggered by users:
    const toggleDebug = React.useCallback(() => {
        setDebug((prevDebug) => {
            const nextDebug = !prevDebug;
            console.log(`\n🐞 DEBUG MODE ${nextDebug ? "ENABLED" : "DISABLED"}!\n\n`);
            if (nextDebug) {
                localStorage.setItem(config.DEV_DEBUG_ENABLED_KEY, "true");
            }
            else {
                localStorage.removeItem(config.DEV_DEBUG_ENABLED_KEY);
            }
            return nextDebug;
        });
    }, []);
    // First, get user data and saved payment methods:
    const { data: meData, loading: meLoading, error: meError, refetch: meRefetch, } = graphqlGenerated.useMeQuery({ skip: !isAuthenticated });
    const wallets = React.useMemo(() => {
        var _a;
        if (meLoading || !meData)
            return undefined;
        const userWallets = ((_a = meData.me) === null || _a === void 0 ? void 0 : _a.wallets) || [];
        return network
            ? userWallets.filter(wallet => { var _a; return ((_a = wallet === null || wallet === void 0 ? void 0 : wallet.network) === null || _a === void 0 ? void 0 : _a.id) === network.id; })
            : userWallets;
    }, [meLoading, meData, network]);
    const { data: paymentMethodsData, loading: paymentMethodsLoading, error: paymentMethodsError, refetch: refetchPaymentMethods, } = graphqlGenerated.useGetPaymentMethodListQuery({
        skip: !isAuthenticated || !orgID || !open,
        variables: { orgID },
    });
    // Get everything related to Payment UI routing, error and state handling, including resuming Plaid / 3DS flows:
    const { 
    // CheckoutModalState:
    startAt, checkoutStep, checkoutError, isDialogBlocked, setIsDialogBlocked, initModalState, goBack, goNext, goTo, setError, 
    // SelectedPaymentMethod:
    selectedPaymentMethod, setSelectedPaymentMethod, 
    // PurchaseState:
    invoiceID, invoiceCountdownStart, setInvoiceID, taxes, setTaxes, wallet, setWalletAddress, paymentID, processorPaymentID, setPayments, } = CheckoutOverlay_hooks.useCheckoutModalState({
        invoiceID: initialInvoiceID,
        productConfirmationEnabled,
        vertexEnabled,
        isAuthenticated,
        onError,
        debug,
    });
    // Once we have an invoiceID, load the invoice:
    const { data: invoiceDetailsData, loading: invoiceDetailsLoading, error: invoiceDetailsError, refetch: refetchInvoiceDetails, } = graphqlGenerated.useGetInvoiceDetailsQuery({
        skip: !invoiceID,
        variables: { invoiceID },
    });
    // Modal loading state:
    const isDialogLoading = !orgID || parentCheckoutItems.length === 0 || isAuthenticatedLoading || meLoading || paymentMethodsLoading;
    const isDialogInitializing = isDialogLoading || invoiceDetailsLoading || !invoiceID || !invoiceCountdownStart;
    const isPlaidFlowLoading = usePlaid.continuePlaidOAuthFlow();
    const [loaderMode, setLoaderMode] = React.useState(initialLoaderMode);
    const isInvalidMode = loaderMode !== "default" && !open;
    const showEspecialLoaders = open && isDialogInitializing && loaderMode !== "default" && checkoutStep !== "error";
    React.useEffect(() => {
        if (!isDialogInitializing || isInvalidMode) {
            // Once we have finished loading data OR if `loaderMode` is not default but the modal is not opened (probably
            // because the data in `localStorage` expired), we reset the loader mode:
            setLoaderMode("default");
        }
    }, [isDialogInitializing, isInvalidMode]);
    React.useEffect(() => {
        if (showEspecialLoaders)
            return;
        const params = new URLSearchParams(location.search);
        params.delete(config.THREEDS_FLOW_SEARCH_PARAM_SUCCESS_KEY);
        params.delete(config.THREEDS_FLOW_SEARCH_PARAM_ERROR_KEY);
        const cleanParams = params.toString();
        const cleanURL = location.href.replace(location.search, cleanParams ? `?${cleanParams}` : "");
        if (cleanURL && cleanURL !== location.href)
            onRemoveUrlParams(cleanURL);
    }, [showEspecialLoaders, onRemoveUrlParams]);
    React.useEffect(() => {
        let emoji = "🔄";
        if (isInvalidMode) {
            emoji = "⚠️";
        }
        else if (loaderMode === "default") {
            emoji = open ? "📬" : "📭";
        }
        else {
            emoji = loaderMode === "success" ? "✔️" : "❌";
        }
        if (debug)
            console.log(`${emoji} loaderMode = ${loaderMode} / isOpen = ${open}`);
    }, [debug, isInvalidMode, loaderMode, open, onRemoveUrlParams]);
    // Payment methods and checkout items / invoice items transforms:
    const rawSavedPaymentMethods = paymentMethodsData === null || paymentMethodsData === void 0 ? void 0 : paymentMethodsData.getPaymentMethodList;
    const savedPaymentMethods = React.useMemo(() => circle_utils.transformRawSavedPaymentMethods(rawSavedPaymentMethods), [rawSavedPaymentMethods]);
    // TODO: These should probably be combined.
    const invoiceItems = invoiceDetailsData === null || invoiceDetailsData === void 0 ? void 0 : invoiceDetailsData.getInvoiceDetails.items;
    const checkoutItems = React.useMemo(() => product_utils.transformCheckoutItemsFromInvoice(parentCheckoutItems, invoiceItems), [parentCheckoutItems, invoiceItems]);
    const { total: subtotal, fees, taxAmount } = useCheckoutItemCostTotal.useCheckoutItemsCostTotal(checkoutItems);
    const destinationAddress = ((_b = (_a = (invoiceItems || [])) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.destinationAddress) || wallet_constants.NEW_WALLET_OPTION.value;
    React.useEffect(() => {
        if (!destinationAddress)
            return;
        const wallet = (wallets || []).find(({ address }) => address === destinationAddress);
        setWalletAddress(wallet || destinationAddress);
    }, [wallets, destinationAddress, setWalletAddress]);
    // Invoice creation & buy now lot reservation:
    const createInvoiceAndReservationCalledRef = React.useRef(false);
    const { 
    // TODO: Instead of returning state, just pass setError and setInvoiceID or return it from createInvoiceAndReservation.
    invoiceAndReservationState, createInvoiceAndReservation, } = useCreateInvoiceAndReservation.useCreateInvoiceAndReservation({ orgID, checkoutItems, debug });
    React.useEffect(() => {
        if (isDialogLoading || invoiceID === null || invoiceID || createInvoiceAndReservationCalledRef.current)
            return;
        createInvoiceAndReservationCalledRef.current = true;
        createInvoiceAndReservation();
    }, [isDialogLoading, invoiceID, createInvoiceAndReservation]);
    React.useEffect(() => {
        const { invoiceID, invoiceCountdownStart, error } = invoiceAndReservationState;
        if (error) {
            // TODO: It would be great if we can keep track of the reservation expiration without changing the displayed error
            // if there's already once, so when clicking the action button for that one, on top of calling its respective error
            // handling code, we re-create the reservation:
            setError(error);
            return;
        }
        if (invoiceID && invoiceCountdownStart)
            setInvoiceID(invoiceID, invoiceCountdownStart);
    }, [invoiceAndReservationState, setError, setInvoiceID]);
    // Reservation countdown:
    const { countdownElementRef } = useContdown.useCountdown({
        invoiceCountdownStart: checkoutStep === "confirmation" ? null : invoiceCountdownStart,
        setError,
    });
    // Init modal state once everything has been loaded:
    React.useEffect(() => {
        if (!isDialogLoading && open)
            initModalState();
    }, [isDialogLoading, open, initModalState]);
    // Data loading error handling:
    React.useEffect(() => {
        if (meError)
            setError(errors_constants.ERROR_LOADING_USER(meError));
        if (invoiceDetailsError)
            setError(errors_constants.ERROR_LOADING_INVOICE(invoiceDetailsError));
        if (paymentMethodsError) {
            {
                console.log("\n❌ (IGNORED) Error loading saved payment methods:\n\n", paymentMethodsError);
            }
        }
    }, [meError, paymentMethodsError, invoiceDetailsError, setError]);
    // Analytics:
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const triggerAnalyticsEventRef = React.useRef((eventType) => { });
    triggerAnalyticsEventRef.current = (eventType) => {
        if (!onEvent || !open)
            return;
        const paymentInfo = selectedPaymentMethod.paymentInfo;
        let paymentType = undefined;
        if (typeof paymentInfo === "string") {
            const payment = savedPaymentMethods.find(({ id }) => id === paymentInfo);
            paymentType = payment === null || payment === void 0 ? void 0 : payment.type;
        }
        else if (paymentInfo) {
            paymentType = paymentInfo.type;
        }
        if (!eventType.startsWith("event:") && !eventType.includes(checkoutStep)) {
            if (debug)
                console.log(`⚠️ eventType / checkoutStep mismatch: ${eventType} / ${checkoutStep}`);
            return;
        }
        onEvent(eventType, {
            // Location:
            step: CheckoutOverlay_hooks.CheckoutModalStepIndex[checkoutStep],
            stepName: checkoutStep,
            // Purchase:
            departmentCategory: "NFT",
            paymentType,
            shippingMethod: typeof wallet === "object" ? "multisig wallet" : "custom wallet",
            checkoutItems,
            // Payment:
            currency: "USD",
            revenue: subtotal + fees,
            fees,
            tax: taxAmount,
            total: subtotal + fees + taxAmount,
            // Order:
            processorPaymentID,
            paymentID,
        });
    };
    React.useEffect(() => {
        // Original code (might this be causing the mismatch eventName / checkoutStep issue?):
        if (!isDialogInitializing)
            setTimeout(() => triggerAnalyticsEventRef.current(`navigate:${checkoutStep}`));
        // Possible fix (might this cause some other issues such as missing data):
        // if (!isDialogInitializing) triggerAnalyticsEventRef.current(`navigate:${ checkoutStep }`);
    }, [isDialogInitializing, checkoutStep]);
    // Saved payment method creation-reload-sync:
    React.useEffect(() => {
        if (savedPaymentMethods.length === 0)
            return;
        // When reloading the saved payment methods after an error, we might have form data that matches a payment method
        // that has just been created, so we want to update it to reference the existing one:
        setSelectedPaymentMethod((prevSelectedPaymentMethod) => {
            const { billingInfo, paymentInfo } = prevSelectedPaymentMethod;
            if (typeof billingInfo === "string" && typeof paymentInfo === "string")
                return Object.assign(Object.assign({}, prevSelectedPaymentMethod), { cvv: "" });
            // To find the saved payment method(s) that was/were last created:
            const reversedSavedPaymentMethods = savedPaymentMethods.slice().reverse();
            // TODO: This logic can probably be simplified. Just get the last saved payment method...
            let matchingPaymentMethod = undefined;
            if (typeof billingInfo === "object") {
                const addressId = circle_utils.getSavedPaymentMethodAddressIdFromBillingInfo(billingInfo);
                matchingPaymentMethod = reversedSavedPaymentMethods.find(paymentMethod => paymentMethod.addressId === addressId);
            }
            return matchingPaymentMethod ? {
                // Both billingInfo and paymentInfo were objects (and we found a matching newly created payment method):
                billingInfo: matchingPaymentMethod.addressId,
                paymentInfo: matchingPaymentMethod.id,
                cvv: "",
            } : {
                // billingInfo was an addressID (or we could not find a match) and paymentInfo was an object:
                billingInfo,
                paymentInfo: typeof billingInfo === "string" ? reversedSavedPaymentMethods[0].id : paymentInfo,
                cvv: "",
            };
        });
    }, [savedPaymentMethods, setSelectedPaymentMethod]);
    // Form data / state:
    const handleBillingInfoSelected = React.useCallback((billingInfo) => {
        // If we go back to the billing info step to fix some validation errors or change some data, we preserve the data
        // in the payment info step (form) as long as it was not a saved payment method. In that case, the saved payment
        // method doesn't belong to the now updated billing info anymore, so we do reset it:
        setSelectedPaymentMethod(({ paymentInfo }) => ({ billingInfo, paymentInfo: typeof paymentInfo === "object" ? paymentInfo : "", cvv: "" }));
    }, [setSelectedPaymentMethod]);
    const handlePaymentInfoSelected = React.useCallback((paymentInfo) => {
        setSelectedPaymentMethod(({ billingInfo }) => ({ billingInfo, paymentInfo, cvv: "" }));
    }, [setSelectedPaymentMethod]);
    const handleCvvSelected = React.useCallback((cvv) => {
        setSelectedPaymentMethod(({ billingInfo, paymentInfo }) => ({ billingInfo, paymentInfo, cvv }));
    }, [setSelectedPaymentMethod]);
    // Delete payment methods:
    const [deletePaymentMethod] = graphqlGenerated.useDeletePaymentMethodMutation();
    const handleSavedPaymentMethodDeleted = React.useCallback((addressIdOrPaymentMethodId) => tslib_es6.__awaiter(void 0, void 0, void 0, function* () {
        const idsToDelete = (checkoutStep === "billing"
            ? savedPaymentMethods.filter(({ addressId }) => addressId === addressIdOrPaymentMethodId).map(({ id }) => id)
            : [addressIdOrPaymentMethodId]).filter(Boolean);
        if (idsToDelete.length === 0)
            return;
        // DELETE LOGIC:
        // We are in BILLING (logic handled in BillingView.tsx):
        // - Delete last payment method => Show form.
        // - Delete payment method, but there's more => Re-set selected address.
        // We are in PAYMENT (logic handled in PaymentView.tsx and below):
        // - Delete last payment method (or last payment method for the selected address) => Expand address and show form.
        // - Delete payment method, but there's more => Re-set selected payment.
        if (checkoutStep === "payment") {
            const addressToDelete = savedPaymentMethods.find(({ id }) => id === addressIdOrPaymentMethodId);
            const addressIdToDelete = addressToDelete === null || addressToDelete === void 0 ? void 0 : addressToDelete.addressId;
            const paymentMethodsWithSameAddress = savedPaymentMethods.filter(({ addressId }) => addressId === addressIdToDelete);
            if (addressToDelete && paymentMethodsWithSameAddress.length === 1) {
                setSelectedPaymentMethod({
                    // The payment method that had the selected address is being deleted, so we just copy its data as an object to
                    // re-create it with the new payment information:
                    billingInfo: circle_utils.savedPaymentMethodToBillingInfo(addressToDelete),
                    paymentInfo: "",
                    cvv: "",
                });
            }
        }
        const promises = idsToDelete.map((paymentMethodID) => {
            return deletePaymentMethod({
                variables: {
                    orgID,
                    paymentMethodID,
                },
            });
        });
        yield Promise.allSettled(promises);
        yield refetchPaymentMethods().catch(() => { });
    }), [checkoutStep, deletePaymentMethod, orgID, refetchPaymentMethods, savedPaymentMethods, setSelectedPaymentMethod]);
    // Purchase:
    const handlePurchaseSuccess = React.useCallback((nextCirclePaymentID, nextPaymentID, redirectURL) => tslib_es6.__awaiter(void 0, void 0, void 0, function* () {
        setPayments(nextCirclePaymentID, nextPaymentID);
        setTimeout(() => triggerAnalyticsEventRef.current("event:paymentSuccess"));
        if (redirectURL) {
            setTimeout(() => {
                if (debug)
                    console.log(`Redirecting to 3DS = ${redirectURL}`);
                location.href = redirectURL;
            }, config.THREEDS_REDIRECT_DELAY_MS);
            return;
        }
        // After a successful purchase, a new payment method might have been created, so we reload them:
        yield refetchPaymentMethods().catch(() => { });
        goNext();
    }), [setPayments, debug, refetchPaymentMethods, goNext]);
    const handlePurchaseError = React.useCallback((error) => tslib_es6.__awaiter(void 0, void 0, void 0, function* () {
        setTimeout(() => triggerAnalyticsEventRef.current("event:paymentError"));
        // After a failed purchase, a new payment method might have been created anyway, so we reload them (createPaymentMethod
        // works but createPayment fails):
        yield refetchPaymentMethods().catch(() => { });
        setError(error);
    }), [refetchPaymentMethods, setError]);
    const handleGoTo = React.useCallback(() => {
        if (onGoTo)
            onGoTo();
        onClose();
    }, [onGoTo, onClose]);
    // Release reservation:
    const lastReleasedReservationID = React.useRef("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleBeforeUnloadRef = React.useRef((e) => { });
    const [releaseReservationBuyNowLot] = graphqlGenerated.useReleaseReservationBuyNowLotMutation({
        variables: {
            orgID,
            invoiceID,
        },
    });
    const handleBeforeUnload = handleBeforeUnloadRef.current = React.useCallback((e) => {
        if (paymentID || processorPaymentID)
            return;
        if (orgID && invoiceID && invoiceID !== lastReleasedReservationID.current) {
            if (debug)
                console.log(`\n♻️ Releasing reservation invoice ${invoiceID} (orgID = ${orgID})...\n`);
            releaseReservationBuyNowLot().then((result) => {
                lastReleasedReservationID.current = invoiceID;
                if (debug)
                    console.log("  🟢 releaseReservationBuyNowLot result", result);
            }).catch((error) => {
                if (debug)
                    console.log("  🔴 releaseReservationBuyNowLot error", error);
            });
        }
        if (e) {
            // TODO: We might want to implement close tab confirmations at some point:
            // If you prevent default behavior in Mozilla Firefox prompt will always be shown:
            // e.preventDefault();
            // Chrome requires returnValue to be set:
            // e.returnValue = '';
            // The absence of a returnValue property on the event will guarantee the browser unload happens:
            delete e['returnValue'];
        }
    }, [paymentID, processorPaymentID, orgID, invoiceID, debug, releaseReservationBuyNowLot]);
    React.useEffect(() => {
        if ((checkoutError === null || checkoutError === void 0 ? void 0 : checkoutError.at) === "reset")
            handleBeforeUnloadRef.current();
    }, [checkoutError]);
    React.useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [handleBeforeUnload]);
    const handleClose = React.useCallback(() => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        handleBeforeUnload();
        createInvoiceAndReservationCalledRef.current = false;
        setInvoiceID(null, null);
        onClose();
    }, [handleBeforeUnload, setInvoiceID, onClose]);
    // Error handling:
    const handleFixError = React.useCallback(() => tslib_es6.__awaiter(void 0, void 0, void 0, function* () {
        const at = checkoutError === null || checkoutError === void 0 ? void 0 : checkoutError.at;
        if (at === "reset") {
            yield Promise.allSettled([
                meRefetch(),
                refetchPaymentMethods().catch(() => { }),
                createInvoiceAndReservation(),
            ]);
            // TODO: Cancel previous reservation?
            goTo();
        }
        else {
            // After an error, all data is reloaded in case the issue was caused by stale/cached data or in case a new payment
            // method has been created despite the error:
            yield Promise.allSettled([
                meRefetch(),
                refetchPaymentMethods().catch(() => { }),
                refetchInvoiceDetails(),
            ]);
            if (at !== "purchasing") {
                // If we are redirecting users to the PurchasingView again, we keep the CVV to be able to re-try the purchase:
                setSelectedPaymentMethod((prevSelectedPaymentMethod) => (Object.assign(Object.assign({}, prevSelectedPaymentMethod), { cvv: "" })));
            }
            goTo(at || errors_constants.DEFAULT_ERROR_AT, checkoutError);
        }
        // This function is used as a CheckoutModalFooter's onSubmitClicked, so we want that to show a loader on the submit
        // button when clicked but do not remove it once the Promise is resolved, as we are moving to another view and
        // CheckoutModalFooter will unmount (so doing this prevents a memory leak issue):
        return false;
    }), [checkoutError, goTo, createInvoiceAndReservation, meRefetch, refetchPaymentMethods, refetchInvoiceDetails, setSelectedPaymentMethod]);
    // Plaid integration (resume Plaid flow):
    const handlePlaidFlowCompleted = React.useCallback((paymentInfo) => {
        if (!paymentInfo) {
            initModalState();
            return;
        }
        handlePaymentInfoSelected(paymentInfo);
        goTo("purchasing");
    }, [initModalState, handlePaymentInfoSelected, goTo]);
    // Loading UI:
    if (open && isDialogInitializing && loaderMode === "success" && checkoutStep !== "error") {
        return (React__default["default"].createElement(StaticSuccessOverlay.PUIStaticSuccessOverlay
        // TODO: Add to dictionary:
        , { 
            // TODO: Add to dictionary:
            successImageSrc: successImageSrc, logoSrc: logoSrc, logoSx: logoSx }));
    }
    if (open && isDialogInitializing && loaderMode === "error" && checkoutStep !== "error") {
        return (React__default["default"].createElement(StaticErrorOverlay.PUIStaticErrorOverlay, { checkoutError: { errorMessage: paymentErrorParam || "" }, 
            // TODO: Add to dictionary:
            errorImageSrc: errorImageSrc, logoSrc: logoSrc, logoSx: logoSx }));
    }
    if ((isDialogInitializing || isPlaidFlowLoading) && (checkoutStep !== "error")) {
        return (React__default["default"].createElement(React__default["default"].Fragment, null,
            isPlaidFlowLoading && React__default["default"].createElement(usePlaid.PlaidFlow, { onSubmit: handlePlaidFlowCompleted }),
            React__default["default"].createElement(material.Backdrop, { open: open, onClick: handleClose }, loaderImageSrc ? (React__default["default"].createElement(StatusIcon.StatusIcon, { variant: "loading", imgSrc: loaderImageSrc, sx: { mt: 5 } })) : (React__default["default"].createElement(material.CircularProgress, { color: "primary" })))));
    }
    // Normal UI (steps / views):
    let headerVariant = isAuthenticated ? 'loggedIn' : 'guest';
    let checkoutStepElement = null;
    if (checkoutStep === "error" && checkoutError) {
        headerVariant = "error";
        checkoutStepElement = (React__default["default"].createElement(ErrorView.ErrorView, { checkoutError: checkoutError, errorImageSrc: errorImageSrc, onFixError: handleFixError, onClose: handleClose, debug: debug }));
    }
    else if (checkoutStep === "authentication") {
        if (!isAuthenticated)
            headerVariant = 'anonymous';
        checkoutStepElement = (React__default["default"].createElement(AuthenticationView.AuthenticationView, { checkoutItems: checkoutItems, taxes: taxes, isAuthenticated: isAuthenticated, guestCheckoutEnabled: guestCheckoutEnabled, onGuestClicked: goNext, onCloseClicked: handleClose }));
    }
    else if (checkoutStep === "billing") {
        checkoutStepElement = (React__default["default"].createElement(BillingView.BillingView, { vertexEnabled: vertexEnabled, checkoutItems: checkoutItems, savedPaymentMethods: savedPaymentMethods, selectedBillingInfo: selectedPaymentMethod.billingInfo, wallet: wallet, wallets: wallets, checkoutError: checkoutError, onBillingInfoSelected: handleBillingInfoSelected, onTaxesChange: setTaxes, onSavedPaymentMethodDeleted: handleSavedPaymentMethodDeleted, onWalletChange: setWalletAddress, onNext: goNext, onClose: handleClose, consentType: consentType, debug: debug }));
    }
    else if (checkoutStep === "payment") {
        checkoutStepElement = (React__default["default"].createElement(PaymentView.PaymentView, { orgID: orgID, checkoutItems: checkoutItems, taxes: taxes, savedPaymentMethods: savedPaymentMethods, selectedPaymentMethod: selectedPaymentMethod, wallet: wallet, wallets: wallets, checkoutError: checkoutError, onPaymentInfoSelected: handlePaymentInfoSelected, onCvvSelected: handleCvvSelected, onSavedPaymentMethodDeleted: handleSavedPaymentMethodDeleted, onWalletChange: setWalletAddress, onNext: goNext, onPrev: goBack, onClose: handleClose, acceptedPaymentTypes: acceptedPaymentTypes, acceptedCreditCardNetworks: acceptedCreditCardNetworks, consentType: consentType, debug: debug }));
    }
    else if (checkoutStep === "purchasing" && invoiceID && invoiceCountdownStart) {
        headerVariant = "purchasing";
        checkoutStepElement = (React__default["default"].createElement(PurchasingView.PurchasingView, { threeDSEnabled: threeDSEnabled, purchasingImageSrc: purchasingImageSrc, purchasingMessages: purchasingMessages, orgID: orgID, invoiceID: invoiceID, invoiceCountdownStart: invoiceCountdownStart, savedPaymentMethods: savedPaymentMethods, selectedPaymentMethod: selectedPaymentMethod, wallet: wallet, onPurchaseSuccess: handlePurchaseSuccess, onPurchaseError: handlePurchaseError, onDialogBlocked: setIsDialogBlocked, debug: debug }));
    }
    else if (checkoutStep === "confirmation") {
        headerVariant = "logoOnly";
        checkoutStepElement = (React__default["default"].createElement(ConfirmationView.ConfirmationView, { checkoutItems: checkoutItems, savedPaymentMethods: savedPaymentMethods, selectedPaymentMethod: selectedPaymentMethod, processorPaymentID: processorPaymentID, wallet: wallet, onNext: handleClose, goToHref: goToHref, goToLabel: goToLabel, onGoTo: handleGoTo }));
    }
    else {
        console.warn("Unknown checkoutStepElement!");
        // !checkoutStep or
        // checkoutStep === "error" && !checkoutError or
        // checkoutStep === "purchasing" && !invoiceID or
        // some other kind of indeterminate / incorrect state:
        return null;
    }
    const headerElement = (React__default["default"].createElement(CheckoutModalHeader.CheckoutModalHeader, { variant: headerVariant, countdownElementRef: countdownElementRef, logoSrc: logoSrc, logoSx: logoSx, user: (_c = meData === null || meData === void 0 ? void 0 : meData.me) === null || _c === void 0 ? void 0 : _c.user, userFormat: userFormat, onLogin: onLogin, onClose: checkoutStep === startAt ? handleClose : undefined, onPrev: checkoutStep === startAt ? undefined : goBack, toggleDebug: toggleDebug }));
    return (React__default["default"].createElement(DictionaryProvider.DictionaryProvider, { dictionary: dictionary },
        React__default["default"].createElement(FullScreenOverlay.FullScreenOverlay, { centered: checkoutStep === "purchasing" || checkoutStep === "error", open: open, onClose: handleClose, isDialogBlocked: isDialogBlocked, contentKey: checkoutStep, header: headerElement, children: checkoutStepElement })));
};
const PUICheckout = ProvidersInjector.withProviders(PUICheckoutOverlay);

exports.PUICheckout = PUICheckout;
exports.PUICheckoutOverlay = PUICheckoutOverlay;
//# sourceMappingURL=CheckoutOverlay.js.map
