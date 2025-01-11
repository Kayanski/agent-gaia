use std::str::FromStr;

use cosmwasm_std::{coin, Decimal};
use cw_orch::{daemon::Daemon, prelude::*};
use networks::NEUTRON_1;
use paiement::{
    interface::Paiement,
    msg::{InstantiateMsg, TimeLimit},
};

pub const INITIAL_PRICE: u128 = 200_000;
pub const INITIAL_DENOM: &str =
    "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9"; // Atom on ntrn
pub const INITIAL_MULTIPLIER: Decimal = Decimal::percent(1);
pub const PRICE_LIMIT: Option<&str> = Some("3000000"); // 3 ATOM price limit
pub const MIN_MESSAGES: u32 = 400;
pub const SECONDS_LIMIT: u64 = 60 * 60; // One hour

pub const TREASURY_ADDR: &str = "neutron17kstwwyxnrpw6jttn4ky0dwrqxs8ykqc5j2gvt";
pub const TREASURY_SHARE: Decimal = Decimal::percent(70);

pub const COSMOS_GOV_ADDR: &str = "neutron1cz3qf94nkectenvan4erylqpx073md7lgsyt8n";
pub const COSMOS_GOV_SHARE: Decimal = Decimal::percent(10);

pub const KAYANSKI_ADDR: &str = "neutron1cz3qf94nkectenvan4erylqpx073md7lgsyt8n";
pub const KAYANSKI_SHARE: Decimal = Decimal::percent(10);

pub const MALEK_ADDR: &str = "neutron1hm988d2gre5stxc3cd99xs9vjg8cqdx94vmu4c";
pub const MALEK_SHARE: Decimal = Decimal::percent(10);

pub fn main() -> anyhow::Result<()> {
    dotenv::dotenv()?;
    env_logger::init();
    let chain = Daemon::builder(NEUTRON_1).build()?;

    let paiement = Paiement::new(chain.clone());

    paiement.upload()?;
    paiement.instantiate(
        &InstantiateMsg {
            initial_price: coin(INITIAL_PRICE, INITIAL_DENOM),
            multiplier: INITIAL_MULTIPLIER,
            shares: vec![
                (TREASURY_ADDR.to_string(), TREASURY_SHARE),
                (COSMOS_GOV_ADDR.to_string(), COSMOS_GOV_SHARE),
                (MALEK_ADDR.to_string(), MALEK_SHARE),
                (KAYANSKI_ADDR.to_string(), KAYANSKI_SHARE),
            ],
            price_limit: PRICE_LIMIT.map(Decimal::from_str).transpose()?,
            time_limit: TimeLimit {
                min_messages: MIN_MESSAGES,
                seconds_limit: SECONDS_LIMIT, // One hour
            },
        },
        Some(&chain.sender_addr()),
        &[],
    )?;

    Ok(())
}
