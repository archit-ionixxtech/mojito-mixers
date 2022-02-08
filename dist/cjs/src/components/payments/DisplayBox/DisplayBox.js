'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_es6 = require('../../../../node_modules/tslib/tslib.es6.js');
var material = require('@mui/material');
var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

var DISPLAY_BOX_PROPS = {
  p: 2,
  border: 1,
  borderRadius: "2px",
  backgroundColor: function backgroundColor(theme) {
    return theme.palette.grey["50"];
  },
  borderColor: function borderColor(theme) {
    return theme.palette.grey["100"];
  },
  color: function color(theme) {
    return theme.palette.grey["800"];
  },
  display: "flex",
  flexDirection: {
    xs: "column",
    sm: "row"
  }
};
var DisplayBox = function DisplayBox(_a) {
  var sx = _a.sx,
      props = tslib_es6.__rest(_a, ["sx"]);

  return /*#__PURE__*/React__default["default"].createElement(material.Box, tslib_es6.__assign({}, props, {
    sx: tslib_es6.__assign(tslib_es6.__assign({}, DISPLAY_BOX_PROPS), sx)
  }));
};
var DebugBox = function DebugBox(_a) {
  var sx = _a.sx,
      props = tslib_es6.__rest(_a, ["sx"]);

  return /*#__PURE__*/React__default["default"].createElement(DisplayBox, tslib_es6.__assign({}, props, {
    component: "pre",
    sx: tslib_es6.__assign(tslib_es6.__assign({}, sx), {
      overflow: "scroll"
    })
  }));
};

exports.DebugBox = DebugBox;
exports.DisplayBox = DisplayBox;
//# sourceMappingURL=DisplayBox.js.map
