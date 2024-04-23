import * as ProofOfWork from "./proof-of-work";
import * as ProofOfStake from "./proof-of-stake";

function main() {
  ProofOfStake.initializeBlockchain();
  // ProofOfWork.initializeBlockchain();
}

main();
