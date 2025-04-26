import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers"
import { createMint, mintTo } from "@solana/spl-token"
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js"
import "dotenv/config"
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const MINT = new PublicKey("6FkqamdNnS91Av21u9HxM5GGRtDfpYGrKs9go6ucDwJG")

async function mintToken(amount: number, mint: PublicKey) {
    console.log(`Minting token ${mint.toBase58()}...`);

    const connection = new Connection(clusterApiUrl("devnet"));
    const kp=getKeypairFromEnvironment("SECRET_KEY");
    
    const ata = await getOrCreateAssociatedTokenAccount(connection, kp, mint, kp.publicKey);

    const sig = await mintTo(connection, kp, mint, ata.address, kp, amount);
    const link = getExplorerLink("tx", sig, "devnet");

    console.log(`Done with link: ${link}`);
}

mintToken(10 * 10**9, MINT);