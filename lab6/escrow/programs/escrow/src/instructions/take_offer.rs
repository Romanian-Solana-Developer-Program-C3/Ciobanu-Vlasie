use anchor_lang:: prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{TransferChecked, transfer_checked}, token_interface::{Mint, TokenAccount, TokenInterface}};

use crate::Offer;

pub fn handler(ctx: Context<TakeOffer>, id: u64) -> Result<()> {

    transfer_tokens_to_maker(&ctx)?;

    withdraw_from_vault(ctx)?;

    Ok(())
}

pub fn transfer_tokens_to_maker(ctx: &Context<TakeOffer>) -> Result<()> {
    let offer = &ctx.accounts.offer;

    let transfer_accounts: TransferChecked<'_> = TransferChecked {
        from: ctx.accounts.taker_token_account_b.to_account_info(),
        to: ctx.accounts.maker_token_account_b.to_account_info(),
        mint: ctx.accounts.token_mint_b.to_account_info(),
        authority: ctx.accounts.taker.to_account_info(),
    };

    let cpi_context = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
    );

    transfer_checked(
        cpi_context, 
        offer.token_b_wanted_amount, 
        ctx.accounts.token_mint_b.decimals
    )
}

pub fn withdraw_from_vault(ctx: Context<TakeOffer>) -> Result<()> {
    let signer_seeds: [&[&[u8]]; 1] = [&[
        b"offer".as_ref(),
        &ctx.accounts.maker.key().to_bytes(),
        &ctx.accounts.offer.id.to_le_bytes(),
        &[ctx.accounts.offer.bump],
    ]];

    let accounts = TransferChecked{
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.taker_token_account_a.to_account_info(),
        mint: ctx.accounts.token_mint_a.to_account_info(),
        authority: ctx.accounts.offer.to_account_info(),
    };

    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(), 
        accounts, 
        &signer_seeds,
    );

    transfer_checked(
        cpi_context,
        ctx.accounts.offer.token_a_amount,
        ctx.accounts.token_mint_a.decimals,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct TakeOffer<'info> {

    #[account(mut)]
    pub taker: Signer<'info>,

    /// CHECK: maker is only used for address comparison, no data is read
    pub maker: AccountInfo<'info>,

    #[account(mint::token_program = token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    #[account(mint::token_program = token_program)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_a,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_b: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = maker,
        associated_token::token_program = token_program,
    )]
    pub maker_token_account_b: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        has_one = maker,
        has_one = token_mint_a,
        has_one = token_mint_b,
        seeds = [b"offer".as_ref(), maker.key().as_ref(), offer.id.to_le_bytes().as_ref()],
        bump = offer.bump,
    )]
    pub offer: Account<'info, Offer>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}