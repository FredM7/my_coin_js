const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const { Blockchain, Transaction } = require("./blockchain");

const myKey = ec.keyFromPrivate("93d58853308619ef23cb4778cc766822457b992418da1770e7700b126784a136");
const myWalletAddress = myKey.getPublic("hex");





let my_coin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, "pk", 10);
tx1.signTransaction(myKey);
my_coin.addTransaction(tx1);

console.log("Starting the mining process...");
my_coin.minePendingTransactions(myWalletAddress);
console.log("Fred's balance is:", my_coin.getAddressBalance(myWalletAddress));

// my_coin.chain[1].transactions[0].amount = 1;

console.log("Is chain valid?", my_coin.verifyIntegrity());
