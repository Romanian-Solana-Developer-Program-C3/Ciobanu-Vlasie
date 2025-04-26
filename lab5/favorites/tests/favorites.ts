import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Favorites } from "../target/types/favorites";
import { assert } from "chai";
const web3 = anchor.web3;

describe("favorites", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const user = (provider.wallet as anchor.Wallet).payer;

  const program = anchor.workspace.Favorites as Program<Favorites>;

  before(async () => {
    const balance = await provider.connection.getBalance(user.publicKey);
    const balanceInSol = balance / web3.LAMPORTS_PER_SOL;
    const formattedBalance = new Intl.NumberFormat().format(balanceInSol);
    console.log(`Balance: ${formattedBalance} SOL`);
  });

  it("Saves a user's favorites to the blockchain", async () => {
    const favoriteNumber = new anchor.BN(42);
    const favoriteColor = "green";
    const favoriteHobbies = ["reading", "gaming", "hiking"];

    await program.methods
      .setFavorites(favoriteColor ,favoriteNumber, favoriteHobbies)
      .signers([user])
      .rpc();

      const favoritePdaAndBump = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("favorites"), user.publicKey.toBuffer()],
        program.programId
      );

      const favoritePda = favoritePdaAndBump[0];
      const dataFromPda = await program.account.favorites.fetch(favoritePda);
      assert.equal(dataFromPda.color, favoriteColor);
      assert.equal(dataFromPda.number.toString(), favoriteNumber.toString());
      assert.deepEqual(dataFromPda.hobbies, favoriteHobbies);
  });

  it("Doesn't let people write to favorites for other users", async () => {
    const randomG = anchor.web3.Keypair.generate();
    try {
      await program.methods
        .setFavorites("blue", new anchor.BN(99), ["sports"])
        .signers([randomG])
        .rpc();
    } catch (err) {
      const errMsg = (err as Error).message;
      assert.isTrue(errMsg.includes("unknown signer"));
    }
  }
  );


});