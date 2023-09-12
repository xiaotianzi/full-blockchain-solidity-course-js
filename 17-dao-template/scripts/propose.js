const { developmentChains, proposalsFile, VOTING_DELAY, NEW_STORE_VALUE, FUNC, PROPOSAL_DESCRIPTION } = require("../helper-hardhat-config")
const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")
const fs = require("fs")

async function propose(args, functionToCall, proposalDescription) {
    const governor = await ethers.getContract("GovernorContract")
    const box = await ethers.getContract("Box")
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    const proposeTx = await governor.propose([box.target], [0], [encodedFunctionCall], proposalDescription)
    // If working on a development chain, we will push forward till we get to the voting period.
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1)
    }
    const proposeReceipt = await proposeTx.wait(1)
    const proposalId = proposeReceipt.logs[0].args[0]
    let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    proposals[network.config.chainId.toString()].push(proposalId.toString())
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals))
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })