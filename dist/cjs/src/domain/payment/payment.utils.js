'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../../../node_modules/react-payment-inputs/es/images/index.js');

var DEFAULT_CARD_FORMAT = /(\d{1,4})/g;
var MONTH_REGEX = /(0[1-9]|1[0-2])/;
var CARD_TYPES = [
    {
        displayName: "Visa",
        type: "visa",
        format: DEFAULT_CARD_FORMAT,
        startPattern: /^4/,
        gaps: [4, 8, 12],
        lengths: [16, 18, 19],
        code: {
            name: "CVV",
            length: 3,
        },
    },
    {
        displayName: "Mastercard",
        type: "mastercard",
        format: DEFAULT_CARD_FORMAT,
        startPattern: /^(5[1-5]|677189)|^(222[1-9]|2[3-6]\d{2}|27[0-1]\d|2720)/,
        gaps: [4, 8, 12],
        lengths: [16],
        code: {
            name: "CVC",
            length: 3,
        },
    },
    {
        displayName: "American Express",
        type: "amex",
        format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
        startPattern: /^3[47]/,
        gaps: [4, 10],
        lengths: [15],
        code: {
            name: "CID",
            length: 4,
        },
    },
    {
        displayName: "Diners Club",
        type: "dinersclub",
        format: DEFAULT_CARD_FORMAT,
        startPattern: /^(36|38|30[0-5])/,
        gaps: [4, 10],
        lengths: [14, 16, 19],
        code: {
            name: "CVV",
            length: 3,
        },
    },
    {
        displayName: "Discover",
        type: "discover",
        format: DEFAULT_CARD_FORMAT,
        startPattern: /^(6011|65|64[4-9]|622)/,
        gaps: [4, 8, 12],
        lengths: [16, 19],
        code: {
            name: "CID",
            length: 3,
        },
    },
    {
        displayName: "JCB",
        type: "jcb",
        format: DEFAULT_CARD_FORMAT,
        startPattern: /^35/,
        gaps: [4, 8, 12],
        lengths: [16, 17, 18, 19],
        code: {
            name: "CVV",
            length: 3,
        },
    },
    {
        displayName: "UnionPay",
        type: "unionpay",
        format: DEFAULT_CARD_FORMAT,
        startPattern: /^62/,
        gaps: [4, 8, 12],
        lengths: [14, 15, 16, 17, 18, 19],
        code: {
            name: "CVN",
            length: 3,
        },
    },
    {
        displayName: "Maestro",
        type: "maestro",
        format: DEFAULT_CARD_FORMAT,
        startPattern: /^(5018|5020|5038|6304|6703|6708|6759|676[1-3])/,
        gaps: [4, 8, 12],
        lengths: [12, 13, 14, 15, 16, 17, 18, 19],
        code: {
            name: "CVC",
            length: 3,
        },
    },
    {
        displayName: "Elo",
        type: "elo",
        format: DEFAULT_CARD_FORMAT,
        startPattern: /^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67[0-7][0-9]|9000)|627780|63(6297|6368)|650(03([^4])|04([0-9])|05(0|1)|4(0[5-9]|3[0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8])|9([2-6][0-9]|7[0-8])|541|700|720|901)|651652|655000|655021)/,
        gaps: [4, 8, 12],
        lengths: [16],
        code: {
            name: "CVE",
            length: 3,
        },
    },
    {
        displayName: "Hipercard",
        type: "hipercard",
        format: DEFAULT_CARD_FORMAT,
        startPattern: /^(384100|384140|384160|606282|637095|637568|60(?!11))/,
        gaps: [4, 8, 12],
        lengths: [16],
        code: {
            name: "CVC",
            length: 3,
        },
    },
];
var imagesMap = index["default"];
function standaloneGetCardImageProps(network) {
    if (network === void 0) { network = "placeholder"; }
    var cardType = network.toLowerCase();
    // See https://github.com/medipass/react-payment-inputs/blob/master/src/usePaymentInputs.js#L452
    return {
        "aria-label": network || "Placeholder card",
        children: imagesMap[cardType] || imagesMap.placeholder,
        width: "1.5em",
        height: "1em",
        viewBox: "0 0 24 16",
    };
}
// TODO: Remove function and use the ones exported from react-payment-inputs when PR gets merged
// https://github.com/medipass/react-payment-inputs/pull/81
var getCardTypeByValue = function (value) {
    return CARD_TYPES.filter(function (cardType) { return cardType.startPattern.test(value); })[0];
};
var validateLuhn = function (cardNumber) {
    return (cardNumber
        .split("")
        .reverse()
        .map(function (digit) { return parseInt(digit, 10); })
        .map(function (digit, idx) { return (idx % 2 ? digit * 2 : digit); })
        .map(function (digit) { return (digit > 9 ? (digit % 10) + 1 : digit); })
        .reduce(function (accum, digit) { return (accum += digit); }) %
        10 ===
        0);
};
var getCardNumberIsValid = function (cardNumber) {
    if (!cardNumber)
        return false;
    var rawCardNumber = cardNumber.replace(/\s/g, "");
    var cardType = getCardTypeByValue(rawCardNumber);
    if (cardType && cardType.lengths) {
        var doesCardNumberMatchLength = cardType.lengths.includes(rawCardNumber.length);
        if (doesCardNumberMatchLength) {
            var isLuhnValid = validateLuhn(rawCardNumber);
            if (isLuhnValid)
                return true;
        }
    }
    return false;
};
var getExpiryDateIsvalid = function (expiryDate) {
    if (!expiryDate)
        return false;
    var rawExpiryDate = expiryDate.replace(" / ", "").replace("/", "");
    if (rawExpiryDate.length !== 4)
        return false;
    var month = rawExpiryDate.slice(0, 2);
    var year = "20".concat(rawExpiryDate.slice(2, 4));
    var monthIsOnValidRange = MONTH_REGEX.test(month);
    var yearIsOnValidRange = parseInt(year) >= new Date().getFullYear();
    var dateIsOnValidRange = parseInt(year) !== new Date().getFullYear() ||
        parseInt(month) >= new Date().getMonth() + 1;
    return monthIsOnValidRange && yearIsOnValidRange && dateIsOnValidRange;
};
var getCVCIsValid = function (cvc, cardNumber) {
    if (!cvc || cvc.length < 3)
        return false;
    var rawCardNumber = cardNumber.replace(/\s/g, "");
    var cardType = getCardTypeByValue(rawCardNumber);
    if (cardType && cvc.length !== cardType.code.length)
        return false;
    return true;
};

exports.CARD_TYPES = CARD_TYPES;
exports.DEFAULT_CARD_FORMAT = DEFAULT_CARD_FORMAT;
exports.getCVCIsValid = getCVCIsValid;
exports.getCardNumberIsValid = getCardNumberIsValid;
exports.getExpiryDateIsvalid = getExpiryDateIsvalid;
exports.standaloneGetCardImageProps = standaloneGetCardImageProps;
//# sourceMappingURL=payment.utils.js.map
