import Elliptic from "elliptic";
import { Blockchain, Transaction } from "./blockchain";

const ec = new Elliptic.ec("secp256k1");

//
const myKey = ec.keyFromPrivate("93d58853308619ef23cb4778cc766822457b992418da1770e7700b126784a136");
const myWalletAddress = myKey.getPublic("hex");

//
let my_coin = new Blockchain();

for (let i = 1; i < 7; i++) {
    const tx1 = new Transaction(myWalletAddress, "pk", i);
    tx1.signTransaction(myKey);
    my_coin.addTransaction(tx1);
}

console.log("Mining pending transactions...");
my_coin.minePendingTransactions(myWalletAddress);
console.log("Fred's balance is:", my_coin.getAddressBalance(myWalletAddress));

//Try to tamper.
// my_coin.chain[1].transactions[0].amount = 1;

console.log("Is chain valid?", my_coin.verifyIntegrity());
console.log("Chain:", JSON.stringify(my_coin.chain, null, 4));
