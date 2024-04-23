import * as crypto from "crypto";

class Validator {
  stake: number;
  privateKey: string;
  publicKey: string;

  constructor(stake: number) {
    this.stake = stake;
    const keypair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem"
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
      }
    });

    this.privateKey = keypair.privateKey;
    this.publicKey = keypair.publicKey;
  }

  sign(data: string): string {
    return crypto
      .createSign("SHA256")
      .update(data)
      .sign(this.privateKey, "hex");
  }

  verify(data: string, signature: string): boolean {
    return crypto
      .createVerify("SHA256")
      .update(data)
      .verify(this.publicKey, signature, "hex");
  }
}

class Blockchain {
  chain: Block[];
  validators: Validator[];

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.validators = [
      new Validator(100),
      new Validator(200),
      new Validator(300)
    ];
  }

  createGenesisValidator(): Validator {
    return new Validator(0);
  }

  createGenesisBlock(): Block {
    return new Block("Genesis block", "", new Validator(0));
  }

  getLastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  chooseValidator(): Validator {
    const totalStake = this.validators.reduce(
      (sum, validator) => sum + validator.stake,
      0
    );

    let random = Math.random() * totalStake;

    for (const validator of this.validators) {
      if (random < validator.stake) {
        return validator;
      }

      random -= validator.stake;
    }

    return this.validators[this.validators.length - 1];
  }

  addBlock(data: string): void {
    const prevBlock = this.getLastBlock();
    const block = new Block(data, prevBlock.hash, this.chooseValidator());
    this.chain.push(block);
  }

  checkChainValidity(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const prevBlock = this.chain[i - 1];

      if (currentBlock.hash !== Block.calculateHash(currentBlock)) {
        return false;
      }

      if (currentBlock.previousHash !== prevBlock.hash) {
        return false;
      }

      if (
        !currentBlock.validator.verify(
          currentBlock.hash,
          currentBlock.signature
        )
      ) {
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
  validator: Validator;
  signature: string;

  constructor(data: string, previousHash: string, validator: Validator) {
    this.data = data;
    this.hash = validator.sign(Block.calculateHash(this));
    this.previousHash = previousHash;
    this.timestamp = Date.now();
    this.validator = validator;
    this.signature = validator.sign(this.hash);
  }

  static calculateHash(block: Block): string {
    return crypto
      .createHash("sha256")
      .update(block.timestamp + block.data)
      .digest("hex");
  }
}

const blockchain = new Blockchain();
blockchain.addBlock("First block");
blockchain.addBlock("Second block");
blockchain.addBlock("Third block");
