const ethers = require("ethers");
const fs = require("fs-extra");
require('dotenv').config()

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    // const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf8");
    // let wallet = ethers.Wallet.fromEncryptedJsonSync(encryptedJson, process.env.PRIVATE_KEY_PASSWORD);
    // wallet = wallet.connect(provider);
    const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
    const binary = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.bin", "utf8");
    const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
    console.log("Deploying, please wait...");
    const contract = await contractFactory.deploy();
    await contract.deploymentTransaction().wait();
    console.log(`Contract Address: ${(await contract.getAddress()).toString()}`)
    // const contract = new ethers.Contract('0x1d4742654c38293e6d72740e92aea55c4f735601', abi, wallet);
    const currentFavoriteNumber = await contract.retrieve();
    console.log(`Current Favorite Number: ${currentFavoriteNumber}`);
    const transactionResponse = await contract.store("31874");
    const transactionReceipt = await transactionResponse.wait();
    const updatedFavoriteNumber = await contract.retrieve();
    console.log(`Updated Favorite Number: ${updatedFavoriteNumber}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
