'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_es6 = require('../../../../node_modules/tslib/tslib.es6.js');
var Edit = require('../../../../node_modules/@mui/icons-material/Edit.js');
var Delete = require('../../../../node_modules/@mui/icons-material/Delete.js');
var SecondaryButton = require('../../shared/SecondaryButton/SecondaryButton.js');
var material = require('@mui/material');
var React = require('react');
var Box = require('../../../../node_modules/@mui/material/Box/Box.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

var DEFAULT_SAVED_ITEM_LABELS = {
    active: "Active",
    edit: "Edit Info",
    delete: "Delete",
    select: "Use Info",
};
var SavedItem = function (_a) {
    var children = _a.children, id = _a.id, _b = _a.variant, variant = _b === void 0 ? "stacked" : _b, _c = _a.labels, customLabels = _c === void 0 ? {} : _c, disabled = _a.disabled, active = _a.active, status = _a.status, onEdit = _a.onEdit, onDelete = _a.onDelete, onPick = _a.onPick, boxProps = _a.boxProps;
    var labels = tslib_es6.__assign(tslib_es6.__assign({}, DEFAULT_SAVED_ITEM_LABELS), customLabels);
    var hasControls = active || onEdit || onDelete || onPick;
    var handleClick = React.useCallback(function (e) {
        var currentTarget = e.currentTarget;
        var action = currentTarget.dataset.action;
        if (!action)
            return;
        var callback = {
            edit: onEdit,
            delete: onDelete,
            pick: onPick,
        }[action];
        if (callback)
            callback(id, e);
    }, [id, onEdit, onDelete, onPick]);
    var disabledSelect = !!disabled;
    var disabledOther = disabled === true;
    var mainControlElement = null;
    if (status) {
        mainControlElement = (React__default["default"].createElement(material.Tooltip, { title: status.tooltip },
            React__default["default"].createElement(material.Chip, { size: "small", color: status.color, label: status.label, variant: "outlined" })));
    }
    else if (active) {
        mainControlElement = React__default["default"].createElement(material.Chip, { size: "small", color: "success", label: "Active", variant: "outlined" });
    }
    else if (onPick) {
        mainControlElement = (React__default["default"].createElement(SecondaryButton.SecondaryButton, { onClick: handleClick, disabled: disabledSelect, "data-action": "pick" }, labels.select));
    }
    return (React__default["default"].createElement(Box["default"], tslib_es6.__assign({}, boxProps, { sx: tslib_es6.__assign({ p: 2, border: 1, borderRadius: "2px", backgroundColor: function (theme) { return theme.palette.grey["50"]; }, borderColor: function (theme) { return theme.palette.grey["100"]; }, color: function (theme) { return theme.palette.grey["800"]; }, display: "flex", flexDirection: {
                xs: "column",
                sm: "row"
            } }, boxProps === null || boxProps === void 0 ? void 0 : boxProps.sx) }),
        variant === "stacked" ? (React__default["default"].createElement(Box["default"], { sx: { flex: 1, pb: 2 } }, children)) : (React__default["default"].createElement(material.Stack, { direction: "row", spacing: 2, sx: { flex: 1, pb: { xs: 2, sm: 0 }, alignItems: "center" } }, children)),
        hasControls && (React__default["default"].createElement(material.Stack, { direction: variant === "stacked" ? { xs: "row", sm: "column" } : "row", spacing: 1, sx: {
                // display: "flex",
                // flexDirection: {
                //   xs: "column",
                //   sm: "column"
                // },
                justifyContent: "space-between",
                alignItems: "flex-end",
                height: "auto",
            } },
            mainControlElement,
            React__default["default"].createElement(material.Stack, { direction: "row", spacing: 1, sx: { pt: variant === "stacked" ? { xs: 0, sm: 1 } : 0, mt: "auto" } },
                onEdit && (React__default["default"].createElement(SecondaryButton.SecondaryButton, { onClick: handleClick, disabled: disabledOther, startIcon: React__default["default"].createElement(Edit["default"], null), "data-action": "edit" }, labels.edit)),
                onDelete && (React__default["default"].createElement(material.Tooltip, { title: labels.delete },
                    React__default["default"].createElement(SecondaryButton.SecondaryButton, { onClick: handleClick, disabled: disabledOther, "data-action": "delete" },
                        React__default["default"].createElement(Delete["default"], null)))))))));
};

exports.SavedItem = SavedItem;
//# sourceMappingURL=SavedItem.js.map
