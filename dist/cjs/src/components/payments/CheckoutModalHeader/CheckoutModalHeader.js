'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_es6 = require('../../../../node_modules/tslib/tslib.es6.js');
var material = require('@mui/material');
var PrimaryButton = require('../../shared/PrimaryButton/PrimaryButton.js');
var OutlinedSecondaryButton = require('../../shared/OutlinedSecondaryButton/OutlinedSecondaryButton.js');
var ChevronLeft = require('../../../../node_modules/@mui/icons-material/ChevronLeft.js');
var formatUtils = require('../../../utils/formatUtils.js');
var CheckoutModalHeader_utils = require('./CheckoutModalHeader.utils.js');
var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

var CHECKOUT_MODAL_TITLE = {
    anonymous: "Checkout",
    guest: "Checkout",
    loggedIn: "Checkout",
    logoOnly: "",
    purchasing: "Purchasing",
    error: "Error",
};
var CHECKOUT_MODAL_CONTROLS = {
    anonymous: true,
    guest: true,
    loggedIn: true,
    logoOnly: false,
    purchasing: false,
    error: false,
};
var CheckoutModalHeader = function (_a) {
    var variant = _a.variant, customTitle = _a.title, logoSrc = _a.logoSrc, logoSx = _a.logoSx, user = _a.user, userFormat = _a.userFormat, onLoginClicked = _a.onLoginClicked, onPrevClicked = _a.onPrevClicked;
    var title = customTitle || CHECKOUT_MODAL_TITLE[variant] || formatUtils.NBSP;
    var displayUsername = CheckoutModalHeader_utils.getFormattedUser(variant, user, userFormat);
    var showControls = CHECKOUT_MODAL_CONTROLS[variant] || false;
    return (React__default["default"].createElement(material.Box, null,
        React__default["default"].createElement(material.Stack, { spacing: 2, direction: "row", sx: { justifyContent: "space-between", alignItems: "center", py: 2 } },
            React__default["default"].createElement(material.Typography, { variant: "h5", id: "checkout-modal-header-title" }, title),
            React__default["default"].createElement(material.Box, { component: "img", src: logoSrc, sx: tslib_es6.__assign({ maxHeight: "32px", maxWidth: { xs: "180px", sm: "240px" } }, logoSx) })),
        React__default["default"].createElement(material.Divider, null),
        showControls ? (React__default["default"].createElement(React__default["default"].Fragment, null,
            React__default["default"].createElement(material.Stack, { spacing: 2, direction: "row", sx: { justifyContent: "space-between", alignItems: "center", py: 2 } }, variant === "anonymous" ? (React__default["default"].createElement(React__default["default"].Fragment, null,
                React__default["default"].createElement(material.Typography, { sx: { fontWeight: "500" } }, "Already have an account?"),
                React__default["default"].createElement(PrimaryButton.PrimaryButton, { onClick: onLoginClicked }, "Log in"))) : (React__default["default"].createElement(React__default["default"].Fragment, null,
                React__default["default"].createElement(OutlinedSecondaryButton.OutlinedSecondaryButton, { onClick: onPrevClicked },
                    React__default["default"].createElement(ChevronLeft["default"], null)),
                React__default["default"].createElement(material.Typography, { sx: { fontWeight: "500", minHeight: 40, display: "flex", alignItems: "center" } }, displayUsername)))),
            React__default["default"].createElement(material.Divider, null))) : null));
};

exports.CheckoutModalHeader = CheckoutModalHeader;
//# sourceMappingURL=CheckoutModalHeader.js.map
