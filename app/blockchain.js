import { SHA256 } from "crypto-js";
import moment from "moment";
import Elliptic from "elliptic";

const dateFormat = "YYYY-MM-DD::HH::mm:ss::SSS";

class Block {
    constructor(timestamp, transactions, previousHash = "") {
        this.nonce = 0; //This number does not have anything to do with the block, but can be anything random.
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256(`${this.nonce}${this.previousHash}${this.timestamp}${JSON.stringify(this.transactions)}`).toString();
    }

    mineBlock(difficulty) {
        //Proof of work: must start with certain amount of 7's.
        while (this.hash.substring(0, difficulty) !== "7".repeat(difficulty)) {
            this.nonce++; //Maybe this can be a much better random.
            this.hash = this.calculateHash();
        }
    }

    isTransactionsValid() {
        for (const tx of this.transactions) {
            //console.log("tx", tx);
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}

export class Transaction {
    constructor(from, to, amount) {
        this.from = from;
        this.to = to;
        this.amount = amount;
    }

    calculateHash() {
        return SHA256(`${this.from}${this.to}${this.amount}`).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic("hex") !== this.from) {
            throw new Error("You cannot sign transactions for other wallets!");
        }

        const txHash = this.calculateHash();
        const sig = signingKey.sign(txHash, "base64");
        this.signature = sig.toDER("hex");
    }

    isValid() {
        //Becasue we reward miners with a "from" of "null";
        if (this.from === null) {
            return true;
        }

        if (!this.signature || this.signature.length === 0) {
            throw new Error("No signature in this transaction!");
        }

        const publicKey = Elliptic.ec("secp256k1").keyFromPublic(this.from, "hex");
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

export class Blockchain {
    constructor() {
        this.difficulty = 3;
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(moment().format(dateFormat), [], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // addBlock(newBlock) {
    //     newBlock.previousHash = this.getLatestBlock().hash;
    //     // newBlock.hash = newBlock.calculateHash();
    //     newBlock.mineBlock(this.difficulty);
    //     //Normally in reality you cant add a block so easily.
    //     //Because there should be numerous checks in place.
    //     this.chain.push(newBlock);
    // }
    minePendingTransactions(minerAddress) {
        const tx = new Transaction(null, minerAddress, this.miningReward);
        this.pendingTransactions.push(tx);

        //In real world cryptocurrencies, adding all pending transactions to a block
        //is impossible because there are way too many transactions.
        //The block size should also probably not surpass +- 1MB...
        //So, miners really get to choose which transactions they include and which they dont.
        let block = new Block(moment().format(dateFormat), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        
        console.log("Block successfully mined!");
        this.chain.push(block);

        this.pendingTransactions = [
            //From = null.
            //new Transaction(null, minerAddress, this.miningReward)
        ];

        //Now, we can really change the code adn givce ourselves more coins,
        //but cryprocurrencies are powered by a peer-peer network,
        //and other nodes won't accept the change and ignore you.
    }

    addTransaction(transaction) {
        if (!transaction.from || !transaction.to) {
            throw new Error("Transaction must have 'from' & 'to' address!");
        }

        if (!transaction.isValid()) {
            throw new Error("Cannot add invalid transaction to the chain!");
        }

        this.pendingTransactions.push(transaction);
    }

    getAddressBalance(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.from === address) {
                    balance -= trans.amount;
                }

                if (trans.to === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    verifyIntegrity() {
        for (let i = 0; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            //console.log("currentBlock", currentBlock);

            if (!currentBlock.isTransactionsValid()) {
                //console.log("1");
                return false;
            }

            // console.log("a", currentBlock.hash);
            // console.log("b", currentBlock.calculateHash());
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                //console.log("2");
                return false;
            }

            //console.log("previousBlock", previousBlock);
            if (previousBlock != null && currentBlock.previousHash !== previousBlock.hash) {
                //console.log("3");
                return false;
            }
        }

        return true;
    }
}