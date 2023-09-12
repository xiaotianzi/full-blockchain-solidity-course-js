const { developmentChains, proposalsFile, VOTING_PERIOD } = require("../helper-hardhat-config")
const { ethers, network } = require("hardhat")
const fs = require("fs")
const { moveBlocks } = require("../utils/move-blocks")

async function main() {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    const proposalId = proposals[network.config.chainId].at(-1);
    console.log(proposalId)
    // 0 = Against, 1 = For, 2 = Abstain for this example
    const voteWay = 1
    const governor = await ethers.getContract("GovernorContract")
    const reason = "I lika do da cha cha"
    const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
    await voteTx.wait(1)
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1)
    }
    console.log("Voted! Ready to go!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })