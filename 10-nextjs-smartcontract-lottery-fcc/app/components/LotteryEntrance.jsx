import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../../constants"
import { useMoralis } from "react-moralis"

const LotteryEntrance = () => {
    const { chainId } = useMoralis()

    // const { runContractFunction: enterRaffle } = useWeb3Contract({
    //     abi: abi,
    //     contractAddress: contractAddresses[][0],
    //     functionName: "enterRaffle",
    //     params: {},
    //     msgValue:
    // })

    return (
        <div>LotteryEntrance</div>
    )
}

export default LotteryEntrance