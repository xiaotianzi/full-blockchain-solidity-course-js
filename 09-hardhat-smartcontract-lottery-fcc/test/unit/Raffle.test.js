const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", function () {
        let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval
        const chainId = network.config.chainId

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["mocks", "raffle"])
            raffle = await ethers.getContract("Raffle", deployer)
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            raffleEntranceFee = await raffle.getEntranceFee()
            interval = await raffle.getInterval()
        })

        describe("constructor", function () {
            it("initialize the raffle correctly", async function () {
                const raffleState = await raffle.getRaffleState()
                assert.equal(raffleState.toString(), "0")
                assert.equal(interval.toString(), networkConfig[chainId]["interval"])
            })
        })

        describe("enterRaffle", function () {
            it("reverts when you don't pay enough", async function () {
                await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle__NotEnoughETHEntered")
            })
            it("records players when then enter", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                const playerFromContract = await raffle.getPlayer(0)
                assert.equal(playerFromContract, deployer)
            })
            it("emits event on enter", async function () {
                await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(raffle, "RaffleEnter")
            })
            it("doesn't allow entrance when raffle is calculating", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                await raffle.performUpkeep([])
                await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith("Raffle__NotOpen")
            })
        })

        describe("checkUpkeep", function () {
            it("returns false if people haven't sent any ETH", async function () {
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                assert(!upkeepNeeded)
            })
            it("returns false if raffle isn't open", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                await raffle.performUpkeep("0x")
                const raffleState = await raffle.getRaffleState()
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                assert.equal(raffleState.toString(), "1")
                assert.equal(upkeepNeeded, false)
            })
            it("returns false if enough time hasn't passed", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() - 3])
                await network.provider.send("evm_mine", [])
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                assert(!upkeepNeeded)
            })
            it("returns true if enough time has passed, has players, eth, and is open", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
                assert(upkeepNeeded)
            })
        })
        describe("performUpkeep", function () {
            it("it can only run if checkupkeep is true", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                const tx = await raffle.performUpkeep([])
                assert(tx)
            })
            it("reverts when checkupkeep is false", async function () {
                await expect(raffle.performUpkeep([])).to.be.revertedWith(
                    "Raffle__UpkeepNotNeeded"
                )
            })
            it("updates the raffle state and emits a requestId", async () => {
                // Too many asserts in this test!
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const txResponse = await raffle.performUpkeep("0x") // emits requestId
                const txReceipt = await txResponse.wait(1) // waits 1 block
                const raffleState = await raffle.getRaffleState() // updates state
                const requestId = txReceipt.events[1].args.requestId
                assert(requestId.toNumber() > 0)
                assert(raffleState == 1) // 0 = open, 1 = calculating
            })
        })
        describe("fullfilRandomWords", function () {
            beforeEach(async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
            })
            it("can only be called after performUpkeep", async function () {
                await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)).to.be.revertedWith("nonexistent request")
                await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)).to.be.revertedWith("nonexistent request")
            })
            it("picks a winner, resets the lottery, and sends money", async function () {
                const additionalEntrants = 3 // to test
                const startingIndex = 1
                const accounts = await ethers.getSigners()
                for (let i = startingIndex; i < startingIndex + additionalEntrants; i++) {
                    const accountConnectedRaffle = raffle.connect(accounts[i])
                    await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee })
                }
                const startingTimeStamp = await raffle.getLatestTimeStamp()
                let winnerStartingBalance
                await new Promise(async (resolve, reject) => {
                    raffle.once("WinnerPicked", async () => {
                        console.log("Found the event!")
                        try {
                            const recentWinner = await raffle.getRecentWinner()
                            // console.log(recentWinner)
                            // console.log(accounts[0].address)
                            // console.log(accounts[1].address)
                            // console.log(accounts[2].address)
                            // console.log(accounts[3].address)
                            const raffleState = await raffle.getRaffleState()
                            const endingTimeStamp = await raffle.getLatestTimeStamp()
                            const numPlayers = await raffle.getNumberOfPlayers()
                            const winnerEndingBalance = await accounts[1].getBalance()
                            assert.equal(numPlayers, 0)
                            assert.equal(raffleState, 0)
                            assert(endingTimeStamp > startingTimeStamp)
                            assert.equal(winnerEndingBalance.toString(), winnerStartingBalance.add(raffleEntranceFee.mul(additionalEntrants).add(raffleEntranceFee)).toString())
                        } catch (e) {
                            reject(e)
                        }
                        resolve()
                    })
                    try {
                        const tx = await raffle.performUpkeep("0x")
                        const txReceipt = await tx.wait(1)
                        winnerStartingBalance = await accounts[1].getBalance()
                        await vrfCoordinatorV2Mock.fulfillRandomWords(txReceipt.events[1].args.requestId, raffle.address)
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        })
    })