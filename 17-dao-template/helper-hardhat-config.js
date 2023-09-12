const networkConfig = {
  default: {
    name: "hardhat",
  },
  31337: {
    name: "localhost",
  },
  11155111: {
    name: "sepolia",
  },
  1: {
    name: "mainnet",
  },
};

const developmentChains = ["hardhat", "localhost"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
const MIN_DELAY = 3600
const QUORUM_PERCENTAGE = 4
const VOTING_PERIOD = 5 // blocks
const VOTING_DELAY = 1
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"
const NEW_STORE_VALUE = 77
const FUNC = "store"
const PROPOSAL_DESCRIPTION = "Proposal #1 77 in the Box!"
const proposalsFile = "proposals.json"

module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  MIN_DELAY,
  QUORUM_PERCENTAGE,
  VOTING_PERIOD,
  VOTING_DELAY,
  ADDRESS_ZERO,
  NEW_STORE_VALUE,
  FUNC,
  PROPOSAL_DESCRIPTION,
  proposalsFile
};
