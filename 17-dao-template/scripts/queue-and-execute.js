const { ethers, network } = require("hardhat")
const { FUNC, NEW_STORE_VALUE, PROPOSAL_DESCRIPTION, MIN_DELAY, developmentChains, } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")
const { moveTime } = require("../utils/move-time")

async function queueAndExecute() {
    const args = [NEW_STORE_VALUE]
    const functionToCall = FUNC
    const box = await ethers.getContract("Box")
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(PROPOSAL_DESCRIPTION))

    const governor = await ethers.getContract("GovernorContract")
    console.log("Queueing...")
    const queueTx = await governor.queue([box.target], [0], [encodedFunctionCall], descriptionHash)
    await queueTx.wait(1)

    if (developmentChains.includes(network.name)) {
        await moveTime(MIN_DELAY + 1)
        await moveBlocks(1)
    }

    console.log("Executing...")
    const executeTx = await governor.execute(
        [box.target],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )
    await executeTx.wait(1)
    console.log(`Box value: ${await box.retrieve()}`)
}

queueAndExecute()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })