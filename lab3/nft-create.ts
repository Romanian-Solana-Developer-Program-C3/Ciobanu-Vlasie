import { createSignerFromKeypair, generateSigner, percentAmount, signerIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { clusterApiUrl } from "@solana/web3.js";
import "dotenv/config";
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { base58 } from "@metaplex-foundation/umi/serializers";

const keypair = getKeypairFromEnvironment("SECRET_KEY");
const umi = createUmi(clusterApiUrl("devnet"), "confirmed");

const umiKeypair = umi.eddsa.createKeypairFromSecretKey(keypair.secretKey);
const signer = createSignerFromKeypair(umi, umiKeypair);

umi.use(mplTokenMetadata());
umi.use(signerIdentity(signer));

const METADATA_URI =
  "https://devnet.irys.xyz/HwS1wX9iQFNgWgBUNYUMNuhLyQg7B1efj8EP5TbGtxZ4";

const SOLSCAN_LINK =  
"https://solscan.io/tx/3H4WPi87frcj9tvbPqJsg5uBbk6GmRRK823SWG7iJ73aJSAiAMFzcSnvenBekMbVnbMXzqu8JZenJR5ATv6VE8kb?cluster=devnet"

async function createMyNft() {
  try {
      const mint = generateSigner(umi)
      let tx = createNft(umi, {
          name: "My NFT",
          mint,
          authority: signer,
          sellerFeeBasisPoints: percentAmount(100),
          isCollection: false,
          uri: METADATA_URI,
      })

    let result = await tx.sendAndConfirm(umi);
    const signature = base58.deserialize(result.signature);

    console.log(
      `NFT created: https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
    } catch (error) {
    console.error("[createMyNft] Failed with the error: ", error)
  }
}

createMyNft ()