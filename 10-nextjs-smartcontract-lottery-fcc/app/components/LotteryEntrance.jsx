import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    // const [chainId, setChainId] = useState(0)
    // setChainId(parseInt(chainIdHex))
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const { runContractFunction: enterRaffle, isLoading, isFetching } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {}
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {}
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {}
    })

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
        console.log(numPlayersFromCall)
        console.log(recentWinnerFromCall)
        console.log("updateUIFinished")
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        if (chainId == 31337) {
            const HARDHAT_RPC_URL = "http://127.0.0.1:8545/";
            const provider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC_URL);
            const contractRaffle = new ethers.Contract(raffleAddress, abi, provider);
            contractRaffle.on("WinnerPicked", async () => {
                await provider.send("evm_mine")
                console.log("WinnerPicked!")
                const numPlayersFromCall = (await getNumberOfPlayers()).toString()
                const recentWinnerFromCall = await getRecentWinner()
                setNumPlayers(numPlayersFromCall)
                setRecentWinner(recentWinnerFromCall)
            });
        }
    }, [chainId]); // 仅在 chainId 变化时注册事件监听器    

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR"
        })
    }

    return (
        <div className="p-5">
            LotteryEntrance
            {raffleAddress
                ? (
                    <div>
                        <button className="bg-blue-500  hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto" onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => { console.log(error) }
                            })
                        }} disabled={isLoading || isFetching}>
                            {
                                isLoading || isFetching
                                    ? (<div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>)
                                    : (<div>Enter Raffle</div>)
                            }
                        </button>
                        <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee)} ETH</div>
                        <div>Number of Players: {numPlayers}</div>
                        <div>Recent Winner: {recentWinner}</div>
                    </div>
                )
                : (<div>No Raffle Address Detected</div>)}

        </div>
    )
}

export default LotteryEntrance