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

    const governanceToken = await deploy("GovernanceToken", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    log(`GovernanceToken at ${governanceToken.address}`)

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(governanceToken.address, [])
    }
    log(`Delegating to ${deployer}`)
    const delegate = async (governanceTokenAddress, delegatedAccount) => {
        const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress)
        const transactionResponse = await governanceToken.delegate(delegatedAccount)
        await transactionResponse.wait(1)
        console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`)
    }
    await delegate(governanceToken.address, deployer)
    log("Delegated!")
    log("----------------------------------------------------")
}

module.exports.tags = ["all", "governanceToken"]
