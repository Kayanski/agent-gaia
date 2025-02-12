use cosmwasm_std::{coin, Decimal};
use cw_orch::{
    daemon::{networks::NEUTRON_1, Daemon},
    prelude::*,
};
use paiement::{
    interface::Paiement,
    msg::{InstantiateMsg, TimeLimit},
};
use std::str::FromStr;

pub const INITIAL_PRICE: u128 = 20;
// ATOM
pub const INITIAL_DENOM: &str =
    "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9";
pub const INITIAL_MULTIPLIER: Decimal = Decimal::bps(10);

pub const TREASURY_ADDR: &str =
    "neutron1dvlx4249q56z4wrgdn577393vvr5w6vhrkm8eet7ywkeefh3m0dq7ujj2u";
pub const TREASURY_SHARE: Decimal = Decimal::percent(70);

pub const KAYANSKI_ADDR: &str = "neutron18u5paxcwcjeatqmeeqm2342nfhe607y82txwzh";
pub const KAYANSKI_SHARE: Decimal = Decimal::percent(15);

pub const MALEK_ADDR: &str = "neutron1la0mxx0cp7se7uvvrjuuhdfulv4mgst5r96x0c";
pub const MALEK_SHARE: Decimal = Decimal::percent(15);

pub const CHAR_LIMIT: u128 = 2_000;
pub fn main() -> anyhow::Result<()> {
    dotenv::dotenv()?;
    env_logger::init();
    let chain = Daemon::builder(NEUTRON_1).build()?;

    let paiement = Paiement::new(chain.clone());

    paiement.instantiate(
        &InstantiateMsg {
            initial_price: coin(INITIAL_PRICE, INITIAL_DENOM),
            multiplier: INITIAL_MULTIPLIER,
            shares: vec![
                (TREASURY_ADDR.to_string(), TREASURY_SHARE),
                (MALEK_ADDR.to_string(), MALEK_SHARE),
                (KAYANSKI_ADDR.to_string(), KAYANSKI_SHARE),
            ],
            price_limit: Some(Decimal::from_str("3000000")?),
            time_limit: TimeLimit {
                min_messages: 100,
                seconds_limit: 60 * 60, // One hour
            },
            char_limit: CHAR_LIMIT.into(),
        },
        Some(&chain.sender_addr()),
        &[],
    )?;

    Ok(())
}
