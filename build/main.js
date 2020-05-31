"use strict";

var _elliptic = _interopRequireDefault(require("elliptic"));

var _blockchain = require("./blockchain");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var ec = new _elliptic["default"].ec("secp256k1"); //

var myKey = ec.keyFromPrivate("93d58853308619ef23cb4778cc766822457b992418da1770e7700b126784a136");
var myWalletAddress = myKey.getPublic("hex"); //

var my_coin = new _blockchain.Blockchain();
var tx1 = new _blockchain.Transaction(myWalletAddress, "pk", 10);
tx1.signTransaction(myKey);
my_coin.addTransaction(tx1);
console.log("Mining pending transactions...");
my_coin.minePendingTransactions(myWalletAddress);
console.log("Fred's balance is:", my_coin.getAddressBalance(myWalletAddress)); //Try to tamper.
// my_coin.chain[1].transactions[0].amount = 1;

console.log("Is chain valid?", my_coin.verifyIntegrity());