const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS, ADDRESS_ZERO } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const timeLock = await ethers.getContract("TimeLock", deployer)
    const governor = await ethers.getContract("GovernorContract", deployer)

    log("----------------------------------------------------")
    log("Setting up contracts for roles...")
    const proposerRole = await timeLock.PROPOSER_ROLE()
    const executorRole = await timeLock.EXECUTOR_ROLE()
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()

    const proposerTx = await timeLock.grantRole(proposerRole, governor.target)
    await proposerTx.wait(1)
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO)
    await executorTx.wait(1)
    const revokeTx = await timeLock.revokeRole(adminRole, deployer)
    await revokeTx.wait(1)
}

module.exports.tags = ["all", "setupGovernance"]