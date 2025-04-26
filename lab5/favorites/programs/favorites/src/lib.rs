#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

declare_id!("8u4S6a4jRam2kAJjQmdGn2fLVxUZfKdm7VqkxHgV6emf");

#[program]
pub mod favorites {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn set_favorites(
        ctx: Context<SetFavorites>, 
        color: String, 
        number: u64, 
        hobbies: Vec<String>
    ) -> Result<()> {
        msg!("Setting favorites for: {:?}", ctx.accounts.user.key());
        
        ctx.accounts.favorites.set_inner(Favorites {
            color,
            number,
            hobbies,
        });

        msg!("Favorites set successfully!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct SetFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        seeds = [b"favorites", user.key().as_ref()],
        space = 8 + Favorites::INIT_SPACE,
        bump
    )]
    pub favorites: Account<'info, Favorites>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Favorites {
    #[max_len(50)]
    pub color: String,
    pub number: u64,
    #[max_len(5, 50)]
    pub hobbies: Vec<String>,
}