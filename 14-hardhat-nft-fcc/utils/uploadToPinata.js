const pinataSDK = require("@pinata/sdk")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    console.log(files)
}

module.exports = { storeImages }