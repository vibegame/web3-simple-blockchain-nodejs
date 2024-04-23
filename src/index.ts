import * as crypto from "crypto";

class Blockchain {
  chain: Block[];

  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock(): Block {
    return new Block("Genesis block", "", Date.now(), 0);
  }

  getLastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  mineBlock(block: Block, difficulty: number): void {
    while (
      block.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      block.nonce++;
      block.hash = Block.calculateHash(block);
      console.log(`Mining... Try ${block.nonce}`, block.hash);
    }
    console.log("Block mined: " + block.hash);
  }

  addBlock(data: string): void {
    const previousBlock = this.chain[this.chain.length - 1];
    const previousHash = previousBlock ? previousBlock.hash : "";
    const block = new Block(data, previousHash, Date.now(), this.chain.length);
    this.mineBlock(block, 5);
    this.chain.push(block);
  }

  checkValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== Block.calculateHash(currentBlock)) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}

class Block {
  data: string;
  hash: string;
  previousHash: string;
  timestamp: number;
  nonce: number = 0;
  index: number;

  constructor(
    data: string,
    previousHash: string,
    timestamp: number,
    index: number
  ) {
    this.data = data;
    this.hash = Block.calculateHash(this);
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.index = index;
  }

  static calculateHash(block: Block): string {
    return crypto
      .createHash("sha256")
      .update(block.index + block.timestamp + block.data + block.nonce)
      .digest("hex");
  }
}

const blockchain = new Blockchain();
blockchain.addBlock("First block");
blockchain.addBlock("Second block");
blockchain.addBlock("Third block");

console.log(blockchain.checkValid());
