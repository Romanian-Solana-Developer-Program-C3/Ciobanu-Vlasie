import * as dotenv from "dotenv";
dotenv.config();
 
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  clusterApiUrl,} from "@solana/web3.js";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
 
async function sendSol(
  connection: Connection,
  fromKeypair: any,
  toPubKey: PublicKey,
  amountInLamports: number) {

  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPubKey,
        lamports: amountInLamports,
      })
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [fromKeypair],
      { commitment: "confirmed" }
    );
    console.log(`Transaction successful! Signature: ${signature}`);
    return true;
  } catch (error) {
    console.error("Error sending SOL:", error);
    return false;
  }
}

async function main() {
  try {
    const args = process.argv;
    const recipientPubKeyString = args.find(
      (arg, index) => index > 1 && arg && !arg.startsWith("--")
    );
    if (!recipientPubKeyString) {
      console.log("Error: Please provide a recipient public key.");
      console.log("Usage: npx tsx send.ts -- <recipient-public-key>");
      return;
    }
    let recipientPubKey: PublicKey;
    try {
      recipientPubKey = new PublicKey(recipientPubKeyString);
    } catch (error) {
      console.error(
        "Error: Invalid recipient public key provided:",
        recipientPubKeyString
      );
      return;
    }

    const keypair = getKeypairFromEnvironment("SECRET_KEY");
    console.log("Sender Public Key:", keypair.publicKey.toString());
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const amountToSend = LAMPORTS_PER_SOL * 0.5;
    const senderBalance = await connection.getBalance(keypair.publicKey);

    console.log(
      `Sender balance: ${senderBalance} lamports (${
        senderBalance / LAMPORTS_PER_SOL
      } SOL)`
    );
    if (senderBalance < amountToSend + 5000) {
      console.log(
        "Insufficient funds to send SOL (including transaction fee)."
      );
      return;
    }

    const success = await sendSol(
      connection,
      keypair,
      recipientPubKey,
      amountToSend
    );
    if (!success) {
      return;
    }

    const senderFinalBalance = await connection.getBalance(keypair.publicKey);
    const recipientFinalBalance = await connection.getBalance(recipientPubKey);

    console.log(
      `Sender final balance: ${senderFinalBalance} lamports (${
        senderFinalBalance / LAMPORTS_PER_SOL
      } SOL)`
    );
    
    console.log(
      `Recipient final balance: ${recipientFinalBalance} lamports (${
        recipientFinalBalance / LAMPORTS_PER_SOL
      } SOL)`
    );
  } catch (error) {
    console.error("Error in main:", error);
  }
}
 
console.log("Starting send operation...");
main();