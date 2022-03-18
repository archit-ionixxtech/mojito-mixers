import { __awaiter } from '../../../../node_modules/tslib/tslib.es6.js';
import { Backdrop, CircularProgress } from '@mui/material';
import React__default, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { transformRawSavedPaymentMethods, getSavedPaymentMethodAddressIdFromBillingInfo, savedPaymentMethodToBillingInfo } from '../../../domain/circle/circle.utils.js';
import { useMeQuery, useGetPaymentMethodListQuery, useGetInvoiceDetailsQuery, useDeletePaymentMethodMutation, useReleaseReservationBuyNowLotMutation } from '../../../queries/graphqlGenerated.js';
import { AuthenticationView } from '../../../views/Authentication/AuthenticationView.js';
import { BillingView } from '../../../views/Billing/BillingView.js';
import { ConfirmationView } from '../../../views/Confirmation/ConfirmationView.js';
import { PaymentView } from '../../../views/Payment/PaymentView.js';
import { CheckoutModalHeader } from '../../payments/CheckoutModalHeader/CheckoutModalHeader.js';
import { PurchasingView } from '../../../views/Purchasing/PurchasingView.js';
import { ErrorView } from '../../../views/Error/ErrorView.js';
import { continuePlaidOAuthFlow, PlaidFlow } from '../../../hooks/usePlaid.js';
import { useCheckoutModalState, CheckoutModalStepIndex } from './CheckoutOverlay.hooks.js';
import { ERROR_LOADING_USER, ERROR_LOADING_PAYMENT_METHODS, ERROR_LOADING_INVOICE, DEFAULT_ERROR_AT } from '../../../domain/errors/errors.constants.js';
import { FullScreenOverlay } from '../../shared/FullScreenOverlay/FullScreenOverlay.js';
import { withProviders } from '../../shared/ProvidersInjector/ProvidersInjector.js';
import { transformCheckoutItemsFromInvoice } from '../../../domain/product/product.utils.js';
import { useCreateInvoiceAndReservation } from '../../../hooks/useCreateInvoiceAndReservation.js';
import { useCheckoutItemsCostTotal } from '../../../hooks/useCheckoutItemCostTotal.js';
import { DictionaryProvider } from '../../../providers/DictionaryProvider.js';
import { THREEDS_REDIRECT_DELAY_MS } from '../../../config/config.js';
import { NEW_WALLET_OPTION } from '../../../domain/wallet/wallet.constants.js';
import { StatusIcon } from '../../shared/StatusIcon/StatusIcon.js';

const PUICheckoutOverlay = ({ 
// Modal:
open, onClose, onGoToCollection, 
// Flow:
guestCheckoutEnabled, productConfirmationEnabled, 
// Personalization:
logoSrc, logoSx, loaderImageSrc, purchasingImageSrc, purchasingMessages, errorImageSrc, userFormat, acceptedPaymentTypes, paymentLimits, // Not implemented yet. Used to show payment limits for some payment types.
dictionary, network, 
// Legal:
consentType, 
// Data:
orgID, invoiceID: initialInvoiceID, checkoutItems: parentCheckoutItems, 
// Authentication:
onLogin, isAuthenticated, isAuthenticatedLoading, 
// Other Events:
debug: initialDebug, onEvent, onError, onMarketingOptInChange, // Not implemented yet. Used to let user subscribe / unsubscribe to marketing updates.
 }) => {
    var _a, _b, _c;
    const [debug, setDebug] = useState(!!initialDebug);
    // First, get user data and saved payment methods:
    const { data: meData, loading: meLoading, error: meError, refetch: meRefetch, } = useMeQuery({ skip: !isAuthenticated });
    const wallets = useMemo(() => {
        var _a;
        if (meLoading || !meData)
            return undefined;
        const userWallets = ((_a = meData.me) === null || _a === void 0 ? void 0 : _a.wallets) || [];
        return network
            ? userWallets.filter(wallet => { var _a; return ((_a = wallet === null || wallet === void 0 ? void 0 : wallet.network) === null || _a === void 0 ? void 0 : _a.id) === network.id; })
            : userWallets;
    }, [meLoading, meData, network]);
    const { data: paymentMethodsData, loading: paymentMethodsLoading, error: paymentMethodsError, refetch: refetchPaymentMethods, } = useGetPaymentMethodListQuery({
        skip: !isAuthenticated,
        variables: { orgID },
    });
    // Get everything related to Payment UI routing, error and state handling, including resuming Plaid / 3DS flows:
    const { 
    // CheckoutModalState:
    startAt, checkoutStep, checkoutError, isDialogBlocked, setIsDialogBlocked, initModalState, goBack, goNext, goTo, setError, 
    // SelectedPaymentMethod:
    selectedPaymentMethod, setSelectedPaymentMethod, 
    // PurchaseState:
    invoiceID, setInvoiceID, taxes, setTaxes, wallet, setWalletAddress, paymentID, circlePaymentID, setPayments, } = useCheckoutModalState({
        invoiceID: initialInvoiceID,
        productConfirmationEnabled,
        isAuthenticated,
        onError,
    });
    // Once we have an invoiceID, load the invoice:
    const { data: invoiceDetailsData, loading: invoiceDetailsLoading, error: invoiceDetailsError, refetch: refetchInvoiceDetails, } = useGetInvoiceDetailsQuery({
        skip: !invoiceID,
        variables: { orgID, invoiceID },
    });
    // Modal loading state:
    const isDialogLoading = isAuthenticatedLoading || meLoading || paymentMethodsLoading;
    const isDialogInitializing = isDialogLoading || invoiceDetailsLoading || !invoiceID;
    const isPlaidFlowLoading = continuePlaidOAuthFlow();
    // Payment methods and checkout items / invoice items transforms:
    const rawSavedPaymentMethods = paymentMethodsData === null || paymentMethodsData === void 0 ? void 0 : paymentMethodsData.getPaymentMethodList;
    const savedPaymentMethods = useMemo(() => transformRawSavedPaymentMethods(rawSavedPaymentMethods), [rawSavedPaymentMethods]);
    // TODO: These should probably be combined.
    const invoiceItems = invoiceDetailsData === null || invoiceDetailsData === void 0 ? void 0 : invoiceDetailsData.getInvoiceDetails.items;
    const checkoutItems = useMemo(() => transformCheckoutItemsFromInvoice(parentCheckoutItems, invoiceItems), [parentCheckoutItems, invoiceItems]);
    const { total: subtotal, fees, taxAmount } = useCheckoutItemsCostTotal(checkoutItems);
    const destinationAddress = ((_b = (_a = (invoiceItems || [])) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.destinationAddress) || NEW_WALLET_OPTION.value;
    useEffect(() => {
        if (!destinationAddress)
            return;
        const wallet = (wallets || []).find(({ address }) => address === destinationAddress);
        setWalletAddress(wallet || destinationAddress);
    }, [wallets, destinationAddress, setWalletAddress]);
    // Invoice creation & buy now lot reservation:
    const createInvoiceAndReservationCalledRef = useRef(false);
    const { invoiceAndReservationState, createInvoiceAndReservation, countdownElementRef, } = useCreateInvoiceAndReservation({ orgID, checkoutItems, stop: checkoutStep === "confirmation", debug });
    useEffect(() => {
        if (isDialogLoading || invoiceID === null || invoiceID || createInvoiceAndReservationCalledRef.current)
            return;
        createInvoiceAndReservationCalledRef.current = true;
        createInvoiceAndReservation();
    }, [isDialogLoading, invoiceID, createInvoiceAndReservation]);
    useEffect(() => {
        if (invoiceAndReservationState.error) {
            // TODO: It would be great if we can keep track of the reservation expiration without changing the displayed error
            // if there's already once, so when clicking the action button for that one, on top of calling its respective error
            // handling code, we re-create the reservation:
            setError(invoiceAndReservationState.error);
            return;
        }
        if (invoiceAndReservationState.invoiceID)
            setInvoiceID(invoiceAndReservationState.invoiceID);
    }, [invoiceAndReservationState, setError, setInvoiceID]);
    // Init modal state once everything has been loaded:
    useEffect(() => {
        if (!isDialogLoading && open)
            initModalState();
    }, [isDialogLoading, open, initModalState]);
    // Data loading error handling:
    useEffect(() => {
        if (meError)
            setError(ERROR_LOADING_USER(meError));
        if (paymentMethodsError)
            setError(ERROR_LOADING_PAYMENT_METHODS(paymentMethodsError));
        if (invoiceDetailsError)
            setError(ERROR_LOADING_INVOICE(invoiceDetailsError));
    }, [meError, paymentMethodsError, invoiceDetailsError, setError]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const triggerAnalyticsEventRef = useRef((eventType) => { });
    triggerAnalyticsEventRef.current = (eventType) => {
        if (!onEvent || !open)
            return;
        const paymentInfo = selectedPaymentMethod.paymentInfo;
        let paymentType = undefined;
        if (typeof paymentInfo === "string") {
            const payment = savedPaymentMethods.find(({ id }) => id === paymentInfo);
            paymentType = payment === null || payment === void 0 ? void 0 : payment.type;
        }
        else {
            paymentType = paymentInfo.type;
        }
        onEvent(eventType, {
            // Location:
            step: CheckoutModalStepIndex[checkoutStep],
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
            circlePaymentID,
            paymentID,
        });
    };
    useEffect(() => {
        if (!isDialogInitializing)
            setTimeout(() => triggerAnalyticsEventRef.current(`navigate:${checkoutStep}`));
    }, [isDialogInitializing, checkoutStep]);
    // Saved payment method creation-reload-sync:
    useEffect(() => {
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
                const addressId = getSavedPaymentMethodAddressIdFromBillingInfo(billingInfo);
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
    const handleBillingInfoSelected = useCallback((billingInfo) => {
        // If we go back to the billing info step to fix some validation errors or change some data, we preserve the data
        // in the payment info step (form) as long as it was not a saved payment method. In that case, the saved payment
        // method doesn't belong to the now updated billing info anymore, so we do reset it:
        setSelectedPaymentMethod(({ paymentInfo }) => ({ billingInfo, paymentInfo: typeof paymentInfo === "object" ? paymentInfo : "", cvv: "" }));
    }, [setSelectedPaymentMethod]);
    const handlePaymentInfoSelected = useCallback((paymentInfo) => {
        setSelectedPaymentMethod(({ billingInfo }) => ({ billingInfo, paymentInfo, cvv: "" }));
    }, [setSelectedPaymentMethod]);
    const handleCvvSelected = useCallback((cvv) => {
        setSelectedPaymentMethod(({ billingInfo, paymentInfo }) => ({ billingInfo, paymentInfo, cvv }));
    }, [setSelectedPaymentMethod]);
    // Delete payment methods:
    const [deletePaymentMethod] = useDeletePaymentMethodMutation();
    const handleSavedPaymentMethodDeleted = useCallback((addressIdOrPaymentMethodId) => __awaiter(void 0, void 0, void 0, function* () {
        const idsToDelete = checkoutStep === "billing"
            ? savedPaymentMethods.filter(({ addressId }) => addressId === addressIdOrPaymentMethodId).map(({ id }) => id)
            : [addressIdOrPaymentMethodId];
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
                    billingInfo: savedPaymentMethodToBillingInfo(addressToDelete),
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
        yield refetchPaymentMethods({ orgID });
    }), [checkoutStep, deletePaymentMethod, orgID, refetchPaymentMethods, savedPaymentMethods, setSelectedPaymentMethod]);
    // Purchase:
    const handlePurchaseSuccess = useCallback((nextCirclePaymentID, nextPaymentID, redirectURL) => __awaiter(void 0, void 0, void 0, function* () {
        setPayments(nextCirclePaymentID, nextPaymentID);
        setTimeout(() => triggerAnalyticsEventRef.current("event:paymentSuccess"));
        if (redirectURL) {
            setTimeout(() => {
                if (debug)
                    console.log(`Redirecting to 3DS = ${redirectURL}`);
                location.href = redirectURL;
            }, THREEDS_REDIRECT_DELAY_MS);
            return;
        }
        // After a successful purchase, a new payment method might have been created, so we reload them:
        yield refetchPaymentMethods();
        goNext();
    }), [setPayments, debug, refetchPaymentMethods, goNext]);
    const handlePurchaseError = useCallback((error) => __awaiter(void 0, void 0, void 0, function* () {
        setTimeout(() => triggerAnalyticsEventRef.current("event:paymentError"));
        // After a failed purchase, a new payment method might have been created anyway, so we reload them (createPaymentMethod
        // works but createPayment fails):
        yield refetchPaymentMethods();
        setError(error);
    }), [refetchPaymentMethods, setError]);
    // Release reservation:
    const lastReleasedReservationID = useRef("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleBeforeUnloadRef = useRef((e) => { });
    const [releaseReservationBuyNowLot] = useReleaseReservationBuyNowLotMutation({
        variables: {
            orgID,
            invoiceID,
        },
    });
    const handleBeforeUnload = handleBeforeUnloadRef.current = useCallback((e) => {
        if (paymentID || circlePaymentID)
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
    }, [paymentID, circlePaymentID, orgID, invoiceID, debug, releaseReservationBuyNowLot]);
    useEffect(() => {
        if ((checkoutError === null || checkoutError === void 0 ? void 0 : checkoutError.at) === "reset")
            handleBeforeUnloadRef.current();
    }, [checkoutError]);
    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [handleBeforeUnload]);
    const handleClose = useCallback(() => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        handleBeforeUnload();
        createInvoiceAndReservationCalledRef.current = false;
        setInvoiceID(null);
        onClose();
    }, [handleBeforeUnload, setInvoiceID, onClose]);
    // Error handling:
    const handleFixError = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        const at = checkoutError === null || checkoutError === void 0 ? void 0 : checkoutError.at;
        if (at === "reset") {
            yield Promise.allSettled([
                meRefetch(),
                refetchPaymentMethods(),
                createInvoiceAndReservation(),
            ]);
            goTo();
        }
        else {
            // After an error, all data is reloaded in case the issue was caused by stale/cached data or in case a new payment
            // method has been created despite the error:
            yield Promise.allSettled([
                meRefetch(),
                refetchPaymentMethods(),
                refetchInvoiceDetails(),
            ]);
            if (at !== "purchasing") {
                // If we are redirecting users to the PurchasingView again, we keep the CVV to be able to re-try the purchase:
                setSelectedPaymentMethod((prevSelectedPaymentMethod) => (Object.assign(Object.assign({}, prevSelectedPaymentMethod), { cvv: "" })));
            }
            goTo(at || DEFAULT_ERROR_AT, checkoutError);
        }
        // This function is used as a CheckoutModalFooter's onSubmitClicked, so we want that to show a loader on the submit
        // button when clicked but do not remove it once the Promise is resolved, as we are moving to another view and
        // CheckoutModalFooter will unmount (so doing this prevents a memory leak issue):
        return false;
    }), [checkoutError, goTo, createInvoiceAndReservation, meRefetch, refetchPaymentMethods, refetchInvoiceDetails, setSelectedPaymentMethod]);
    // Plaid integration (resume Plaid flow):
    const handlePlaidFlowCompleted = useCallback((paymentInfo) => {
        if (!paymentInfo) {
            initModalState();
            return;
        }
        handlePaymentInfoSelected(paymentInfo);
        goTo("purchasing");
    }, [initModalState, handlePaymentInfoSelected, goTo]);
    // Loading UI:
    if ((isDialogInitializing || isPlaidFlowLoading) && (checkoutStep !== "error")) {
        return (React__default.createElement(React__default.Fragment, null,
            isPlaidFlowLoading && React__default.createElement(PlaidFlow, { onSubmit: handlePlaidFlowCompleted }),
            React__default.createElement(Backdrop, { open: open, onClick: handleClose }, loaderImageSrc ? (React__default.createElement(StatusIcon, { variant: "loading", imgSrc: loaderImageSrc, sx: { mt: 5 } })) : (React__default.createElement(CircularProgress, { color: "primary" })))));
    }
    // Normal UI (steps / views):
    let headerVariant = isAuthenticated ? 'loggedIn' : 'guest';
    let checkoutStepElement = null;
    if (checkoutStep === "error" && checkoutError) {
        headerVariant = "error";
        checkoutStepElement = (React__default.createElement(ErrorView, { checkoutError: checkoutError, errorImageSrc: errorImageSrc, onFixError: handleFixError, onClose: handleClose, debug: debug }));
    }
    else if (checkoutStep === "authentication") {
        if (!isAuthenticated)
            headerVariant = 'anonymous';
        checkoutStepElement = (React__default.createElement(AuthenticationView, { checkoutItems: checkoutItems, taxes: taxes, isAuthenticated: isAuthenticated, guestCheckoutEnabled: guestCheckoutEnabled, onGuestClicked: goNext, onCloseClicked: handleClose }));
    }
    else if (checkoutStep === "billing") {
        checkoutStepElement = (React__default.createElement(BillingView, { checkoutItems: checkoutItems, savedPaymentMethods: savedPaymentMethods, selectedBillingInfo: selectedPaymentMethod.billingInfo, wallet: wallet, wallets: wallets, checkoutError: checkoutError, onBillingInfoSelected: handleBillingInfoSelected, onTaxesChange: setTaxes, onSavedPaymentMethodDeleted: handleSavedPaymentMethodDeleted, onWalletChange: setWalletAddress, onNext: goNext, onClose: handleClose, consentType: consentType, debug: debug }));
    }
    else if (checkoutStep === "payment") {
        checkoutStepElement = (React__default.createElement(PaymentView, { checkoutItems: checkoutItems, taxes: taxes, savedPaymentMethods: savedPaymentMethods, selectedPaymentMethod: selectedPaymentMethod, wallet: wallet, wallets: wallets, checkoutError: checkoutError, onPaymentInfoSelected: handlePaymentInfoSelected, onCvvSelected: handleCvvSelected, onSavedPaymentMethodDeleted: handleSavedPaymentMethodDeleted, onWalletChange: setWalletAddress, onNext: goNext, onPrev: goBack, onClose: handleClose, acceptedPaymentTypes: acceptedPaymentTypes, consentType: consentType, debug: debug }));
    }
    else if (checkoutStep === "purchasing" && invoiceID) {
        headerVariant = "purchasing";
        checkoutStepElement = (React__default.createElement(PurchasingView, { purchasingImageSrc: purchasingImageSrc, purchasingMessages: purchasingMessages, orgID: orgID, invoiceID: invoiceID, savedPaymentMethods: savedPaymentMethods, selectedPaymentMethod: selectedPaymentMethod, wallet: wallet, onPurchaseSuccess: handlePurchaseSuccess, onPurchaseError: handlePurchaseError, onDialogBlocked: setIsDialogBlocked, debug: debug }));
    }
    else if (checkoutStep === "confirmation") {
        headerVariant = "logoOnly";
        checkoutStepElement = (React__default.createElement(ConfirmationView, { checkoutItems: checkoutItems, savedPaymentMethods: savedPaymentMethods, selectedPaymentMethod: selectedPaymentMethod, circlePaymentID: circlePaymentID, wallet: wallet, onGoToCollection: onGoToCollection, onNext: handleClose }));
    }
    else {
        // !checkoutStep or
        // checkoutStep === "error" && !checkoutError or
        // checkoutStep === "purchasing" && !invoiceID or
        // some other kind of indeterminate / incorrect state:
        return null;
    }
    const headerElement = (React__default.createElement(CheckoutModalHeader, { variant: headerVariant, countdownElementRef: countdownElementRef, logoSrc: logoSrc, logoSx: logoSx, user: (_c = meData === null || meData === void 0 ? void 0 : meData.me) === null || _c === void 0 ? void 0 : _c.user, userFormat: userFormat, onLogin: onLogin, onClose: checkoutStep === startAt ? handleClose : undefined, onPrev: checkoutStep === startAt ? undefined : goBack, setDebug: setDebug }));
    return (React__default.createElement(DictionaryProvider, { dictionary: dictionary },
        React__default.createElement(FullScreenOverlay, { centered: checkoutStep === "purchasing" || checkoutStep === "error", open: open, onClose: handleClose, isDialogBlocked: isDialogBlocked, contentKey: checkoutStep, header: headerElement, children: checkoutStepElement })));
};
const PUICheckout = withProviders(PUICheckoutOverlay);

export { PUICheckout, PUICheckoutOverlay };
//# sourceMappingURL=CheckoutOverlay.js.map
