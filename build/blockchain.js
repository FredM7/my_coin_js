"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var sha256 = require("crypto-js/sha256");

var moment = require("moment");

var EC = require("elliptic").ec;

var ec = new EC("secp256k1");

var Transaction = /*#__PURE__*/function () {
  function Transaction(from, to, amount) {
    _classCallCheck(this, Transaction);

    this.from = from;
    this.to = to;
    this.amount = amount;
  }

  _createClass(Transaction, [{
    key: "calculateHash",
    value: function calculateHash() {
      return sha256("".concat(this.from).concat(this.to).concat(this.amount)).toString();
    }
  }, {
    key: "signTransaction",
    value: function signTransaction(signingKey) {
      if (signingKey.getPublic("hex") !== this.from) {
        throw new Error("You cannot sign transactions for other wallets!");
      }

      var txHash = this.calculateHash();
      var sig = signingKey.sign(txHash, "base64");
      this.signature = sig.toDER("hex");
    }
  }, {
    key: "isValid",
    value: function isValid() {
      //Becasue we reward miners with a "from" of "null";
      if (this.from === null) {
        return true;
      }

      if (!this.signature || this.signature.length === 0) {
        throw new Error("No signature in this transaction!");
      }

      var publicKey = ec.keyFromPublic(this.from, "hex");
      return publicKey.verify(this.calculateHash(), this.signature);
    }
  }]);

  return Transaction;
}();

var Block = /*#__PURE__*/function () {
  function Block(timestamp, transactions) {
    var previousHash = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

    _classCallCheck(this, Block);

    this.nonce = 0; //This number does not have anything to do with the block, but can be anything random.

    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  _createClass(Block, [{
    key: "calculateHash",
    value: function calculateHash() {
      return sha256("".concat(this.nonce).concat(this.previousHash).concat(this.timestamp).concat(JSON.stringify(this.transactions))).toString();
    }
  }, {
    key: "mineBlock",
    value: function mineBlock(difficulty) {
      //Proof of work: must start with certain amount of 7's.
      while (this.hash.substring(0, difficulty) !== "7".repeat(difficulty)) {
        this.nonce++; //Maybe this can be a much better random.

        this.hash = this.calculateHash();
      }
    }
  }, {
    key: "isTransactionsValid",
    value: function isTransactionsValid() {
      var _iterator = _createForOfIteratorHelper(this.transactions),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var tx = _step.value;

          //console.log("tx", tx);
          if (!tx.isValid()) {
            return false;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return true;
    }
  }]);

  return Block;
}();

var Blockchain = /*#__PURE__*/function () {
  function Blockchain() {
    _classCallCheck(this, Blockchain);

    this.difficulty = 2;
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  _createClass(Blockchain, [{
    key: "createGenesisBlock",
    value: function createGenesisBlock() {
      return new Block(moment().format("YYYY-MM-DD::HH::mm:ss"), [], "0");
    }
  }, {
    key: "getLatestBlock",
    value: function getLatestBlock() {
      return this.chain[this.chain.length - 1];
    } // addBlock(newBlock) {
    //     newBlock.previousHash = this.getLatestBlock().hash;
    //     // newBlock.hash = newBlock.calculateHash();
    //     newBlock.mineBlock(this.difficulty);
    //     //Normally in reality you cant add a block so easily.
    //     //Because there should be numerous checks in place.
    //     this.chain.push(newBlock);
    // }

  }, {
    key: "minePendingTransactions",
    value: function minePendingTransactions(minerAddress) {
      var tx = new Transaction(null, minerAddress, this.miningReward);
      this.pendingTransactions.push(tx); //In real world cryptocurrencies, adding all pending transactions to a block
      //is impossible because there are way too many transactions.
      //The block size should also probably not surpass +- 1MB...
      //So, miners really get to choose which transactions they include and which they dont.

      var block = new Block(moment().format("YYYY-MM-DD::HH::mm:ss"), this.pendingTransactions, this.getLatestBlock().hash);
      block.mineBlock(this.difficulty);
      console.log("Block successfully mined!");
      this.chain.push(block);
      this.pendingTransactions = [//From = null.
        //new Transaction(null, minerAddress, this.miningReward)
      ]; //Now, we can really change the code adn givce ourselves more coins,
      //but cryprocurrencies are powered by a peer-peer network,
      //and other nodes won't accept the change and ignore you.
    }
  }, {
    key: "addTransaction",
    value: function addTransaction(transaction) {
      if (!transaction.from || !transaction.to) {
        throw new Error("Transaction must have 'from' & 'to' address!");
      }

      if (!transaction.isValid()) {
        throw new Error("Cannot add invalid transaction to the chain!");
      }

      this.pendingTransactions.push(transaction);
    }
  }, {
    key: "getAddressBalance",
    value: function getAddressBalance(address) {
      var balance = 0;

      var _iterator2 = _createForOfIteratorHelper(this.chain),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var block = _step2.value;

          var _iterator3 = _createForOfIteratorHelper(block.transactions),
              _step3;

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var trans = _step3.value;

              if (trans.from === address) {
                balance -= trans.amount;
              }

              if (trans.to === address) {
                balance += trans.amount;
              }
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return balance;
    }
  }, {
    key: "verifyIntegrity",
    value: function verifyIntegrity() {
      for (var i = 0; i < this.chain.length; i++) {
        var currentBlock = this.chain[i];
        var previousBlock = this.chain[i - 1]; //console.log("currentBlock", currentBlock);

        if (!currentBlock.isTransactionsValid()) {
          //console.log("1");
          return false;
        } // console.log("a", currentBlock.hash);
        // console.log("b", currentBlock.calculateHash());


        if (currentBlock.hash !== currentBlock.calculateHash()) {
          //console.log("2");
          return false;
        } //console.log("previousBlock", previousBlock);


        if (previousBlock != null && currentBlock.previousHash !== previousBlock.hash) {
          //console.log("3");
          return false;
        }
      }

      return true;
    }
  }]);

  return Blockchain;
}();

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;