"use strict";

var _elliptic = _interopRequireDefault(require("elliptic"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var ec = new _elliptic["default"].ec("secp256k1"); //This is also the basis of bitcoin wallets...

var key = ec.genKeyPair();
var publicKey = key.getPublic("hex");
var privateKey = key.getPrivate("hex");
console.log("Private Key:", privateKey);
console.log("Public Key:", publicKey);