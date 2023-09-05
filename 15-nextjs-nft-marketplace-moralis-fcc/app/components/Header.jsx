import { ConnectButton } from "web3uikit"
import Link from "next/link"

const Header = () => {
    return (
        <nav>
            <Link href="/">NFT Marketplace</Link>
            <Link href="/sell-nft">Sell NFT</Link>
            <ConnectButton />
        </nav>
    )
}

export default Header