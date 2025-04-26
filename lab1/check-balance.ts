import * as dotenv from "dotenv";
dotenv.config();

import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import {
  airdropIfRequired,
  getKeypairFromEnvironment, } from "@solana-developers/helpers";
 
async function checkBalanceAndAirdrop() {
  try {
    const keypair = getKeypairFromEnvironment("SECRET_KEY");
    console.log("Public Key:", keypair.publicKey.toString());

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const pubKey = keypair.publicKey;

    const balanceInLamports = await connection.getBalance(pubKey);
    console.log(
      `Initial balance for ${pubKey.toString()} is ${balanceInLamports} lamports`
    );

    if (balanceInLamports < LAMPORTS_PER_SOL) {
      console.log("Balance is less than 1 SOL, requesting airdrop...");
      try {
        await airdropIfRequired(
          connection,
          pubKey,
          LAMPORTS_PER_SOL,
          LAMPORTS_PER_SOL
        );
        console.log("Airdrop successful!");
      } 
        catch (airdropError: any) {
        console.error("Airdrop failed:", airdropError);
        return;
      }
    } 
    else {
      console.log("Balance is sufficient, no airdrop needed.");
    }
    
    const newBalanceInLamports = await connection.getBalance(pubKey);
    console.log(`Updated balance for ${pubKey.toString()} is ${newBalanceInLamports} lamports`);
    const balanceInSol = newBalanceInLamports / LAMPORTS_PER_SOL;
    console.log(`Balance in SOL: ${balanceInSol} SOL`);
  } 
  catch (error) {
    console.error("Error:", error);
  }
}

console.log("Starting execution...");
checkBalanceAndAirdrop();