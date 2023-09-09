"use client"
import { useQuery, gql } from "@apollo/client"
import Header from "../components/Header"

const GET_ACTIVE_ITEMS = gql`
    {
        activeItems(first: 5, where: { buyer: "0x0000000000000000000000000000000000000000" }) {
            id
            buyer
            seller
            nftAddress
            tokenId
            price
        }
    }
`

export default function GraphExample() {
    const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS)
    console.log(data)
    return (
        <div>
            <Header />
            Hi, this is GraphExample
        </div>
    )
}
