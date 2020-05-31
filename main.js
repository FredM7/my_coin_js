const sha256 = require("crypto-js/sha256");
const moment = require("moment");

class Block {
    constructor(index, timestamp, data, previousHash = "") {
        this.index = index;
        this.nonce = 0; //This number does not have anything to do with the block, but can be anything random.
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return sha256(`${this.nonce}${this.index}${this.previousHash}${this.timestamp}${JSON.stringify(this.data)}`).toString();
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
        this.difficulty = 4;
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, "01/01/2020", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        // newBlock.hash = newBlock.calculateHash();
        newBlock.mineBlock(this.difficulty);
        //Normally in reality you cant add a block so easily.
        //Because there should be numerous checks in place.
        this.chain.push(newBlock);
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
// my_coin.addBlock(new Block(1, "01/02/2020", { amount: 4 }));
// my_coin.addBlock(new Block(2, "01/03/2020", { amount: 10 }));
for (let i = 0; i < 10; i++) {
    my_coin.addBlock(new Block(i, moment().format("YYYY-MM-DD::HH::mm:ss"), { amount: 4 }));
}

console.log(JSON.stringify(my_coin, null, 4));
// console.log("Is chain valid?", my_coin.verifyIntegrity());
// //my_coin.addBlock(new Block({ amount: 11 }));
// my_coin.chain[1].data = { amount: 100 };
// console.log("Is chain valid?", my_coin.verifyIntegrity());
