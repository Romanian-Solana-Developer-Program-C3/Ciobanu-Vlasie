import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { clusterApiUrl } from "@solana/web3.js";
import "dotenv/config";
import { readFile } from "fs/promises";

const kp = getKeypairFromEnvironment("SECRET_KEY")
const umi = createUmi(clusterApiUrl("devnet"))

const keypair = umi.eddsa.createKeypairFromSecretKey(kp.secretKey)
const signer = createSignerFromKeypair(umi, keypair)

umi.use(irysUploader())
umi.use(signerIdentity(signer))

const IMAGE_FILE = "../pepe.png"

const IMAGE_URI =
  "https://devnet.irys.xyz/CnUuaadF5zVQw374mv6RWSjqcvnWWPBb53jSJzPURjf5";

export async function uploadImage() {

  try {
      console.log(`Uploading image ${IMAGE_FILE} ...`)
      const img = await readFile(IMAGE_FILE)
      const imgConverted = createGenericFile(new Uint8Array(img), "image/png")

      const [myUri] = await umi.uploader.upload([imgConverted])
      console.log(`Uploaded image with URI: ${myUri}`)
  }
  catch (error) {
      console.error("[uploadImage] Failed with the error: ", error)
  }

}

uploadImage()