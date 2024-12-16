use cosmwasm_std::{coin, Decimal};
use cw_orch::{
    daemon::{networks::PION_1, Daemon},
    prelude::*,
};
use paiement::{interface::Paiement, msg::InstantiateMsg};

pub const INITIAL_PRICE: u128 = 2000;
pub const INITIAL_DENOM: &str = "untrn";
pub const INITIAL_MULTIPLIER: Decimal = Decimal::bps(10);

pub const TREASURY_ADDR: &str = "";
pub const TREASURY_SHARE: Decimal = Decimal::percent(70);

pub const KAYANSKI_ADDR: &str = "";
pub const KAYANSKI_SHARE: Decimal = Decimal::percent(15);

pub const COFOUNDER_ADDR: &str = "";
pub const COFOUNDER_SHARE: Decimal = Decimal::percent(15);

pub fn main() -> anyhow::Result<()> {
    let chain = Daemon::builder(PION_1).build()?;

    let paiement = Paiement::new(chain.clone());

    paiement.upload()?;
    paiement.instantiate(
        &InstantiateMsg {
            initial_price: coin(INITIAL_PRICE, INITIAL_DENOM),
            multiplier: INITIAL_MULTIPLIER,
            shares: vec![
                (TREASURY_ADDR.to_string(), TREASURY_SHARE),
                (COFOUNDER_ADDR.to_string(), COFOUNDER_SHARE),
                (KAYANSKI_ADDR.to_string(), KAYANSKI_SHARE),
            ],
        },
        Some(&chain.sender_addr()),
        &[],
    )?;

    Ok(())
}
