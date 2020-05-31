const sha256 = require("crypto-js/sha256");
const moment = require("moment");

class Transaction {
    constructor(from, to, amount) {
        this.from = from;
        this.to = to;
        this.amount = amount;
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = "") {
        this.nonce = 0; //This number does not have anything to do with the block, but can be anything random.
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return sha256(`${this.nonce}${this.previousHash}${this.timestamp}${JSON.stringify(this.data)}`).toString();
    }

    mineBlock(difficulty) {
        //Proof of work: must start with certain amount of 7's.
        while (this.hash.substring(0, difficulty) !== "7".repeat(difficulty)) {
            this.hash = this.calculateHash();
            this.nonce++; //Maybe this can be a much better random.
        }
    }
}

class Blockchain {
    constructor() {
        this.difficulty = 2;
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 1;
    }

    createGenesisBlock() {
        return new Block(moment().format("YYYY-MM-DD::HH::mm:ss"), "Genesis block", "0");
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
        //In real world cryptocurrencies, adding all pending transactions to a block
        //is impossible because there are way too many transactions.
        //The block size should also probably not surpass +- 1MB...
        //So, miners really get to choose which transactions they include and which they dont.
        let block = new Block(moment().format("YYYY-MM-DD::HH::mm:ss"), this.pendingTransactions);
        block.mineBlock(this.difficulty);
        console.log("Block successfully mined!");
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, minerAddress, this.miningReward)
        ];

        //Now, we can really change the code adn givce ourselves more coins,
        //but cryprocurrencies are powered by a peer-peer network,
        //and other nodes won't accept the change and ignore you.
    }

    createTransaction(transaction) {
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

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            //console.log("previousBlock", previousBlock);
            if (previousBlock != null && currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

let my_coin = new Blockchain();
my_coin.createTransaction(new Transaction("1", "2", 10));
my_coin.createTransaction(new Transaction("2", "1", 3));

console.log("Starting the mining process...");
my_coin.minePendingTransactions("3");
console.log("3's balance is:", my_coin.getAddressBalance("3"));

console.log("Starting the mining process...");
my_coin.minePendingTransactions("3");
console.log("3's balance is:", my_coin.getAddressBalance("3"));
console.log("2's balance is:", my_coin.getAddressBalance("2"));
console.log("1's balance is:", my_coin.getAddressBalance("1"));