const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")

    const args = []

    const box = await deploy("Box", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    log(`Box at ${box.address}`)

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(box.address, args)
    }

    const boxContract = await ethers.getContractAt("Box", box.address)
    const timeLock = await ethers.getContract("TimeLock")
    const transferTx = await boxContract.transferOwnership(timeLock.target)
    await transferTx.wait(1)
}

module.exports.tags = ["all", "box"]
