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

const keypair = getKeypairFromEnvironment("SECRET_KEY");
const umi = createUmi(clusterApiUrl("devnet"), "confirmed");

const umiKeypair = umi.eddsa.createKeypairFromSecretKey(keypair.secretKey);
const signer = createSignerFromKeypair(umi, umiKeypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

const IMAGE_URI =
  "https://devnet.irys.xyz/CnUuaadF5zVQw374mv6RWSjqcvnWWPBb53jSJzPURjf5";

const METADATA_URI =
  "https://devnet.irys.xyz/HwS1wX9iQFNgWgBUNYUMNuhLyQg7B1efj8EP5TbGtxZ4";

  export async function uploadMetadata() {
    try {
      console.log("Uploading metadata...");
      const metadata = {
        name: "Pepe meme",
        symbol: "PEPE",
        description: "Pepe on the floor crying",
        image: IMAGE_URI,
        attributes: [
          {
            trait_type: "Color",
            value: "Green",
          },
          {
            trait_type: "Race",
            value: "Frog",
          },
          {
            trait_type: "Size",
            value: "Small",
          },
        ],
        properties: {
          files: [
            {
              type: "image/png",
              uri: IMAGE_URI,
            },
          ],
        },
      };
  
      const metadataUri = await umi.uploader.uploadJson(metadata);
      console.log(`Metadata uploaded to ${metadataUri}`);
    } catch (error) {
      console.log(error);
    }
  }
  
  uploadMetadata();