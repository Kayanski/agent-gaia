use cosmwasm_std::{coin, Decimal};
use cw_orch::{
    daemon::{networks::PION_1, Daemon},
    prelude::*,
};
use paiement::{interface::Paiement, msg::InstantiateMsg};

pub const INITIAL_PRICE: u128 = 20;
pub const INITIAL_DENOM: &str = "untrn";
pub const INITIAL_MULTIPLIER: Decimal = Decimal::bps(10);

pub const TREASURY_ADDR: &str = "neutron17kstwwyxnrpw6jttn4ky0dwrqxs8ykqc5j2gvt";
pub const TREASURY_SHARE: Decimal = Decimal::percent(70);

pub const KAYANSKI_ADDR: &str = "neutron1cz3qf94nkectenvan4erylqpx073md7lgsyt8n";
pub const KAYANSKI_SHARE: Decimal = Decimal::percent(15);

pub const MALEK_ADDR: &str = "neutron1hm988d2gre5stxc3cd99xs9vjg8cqdx94vmu4c";
pub const MALEK_SHARE: Decimal = Decimal::percent(15);

pub fn main() -> anyhow::Result<()> {
    dotenv::dotenv()?;
    env_logger::init();
    let chain = Daemon::builder(PION_1).build()?;

    let paiement = Paiement::new(chain.clone());

    paiement.upload()?;
    paiement.instantiate(
        &InstantiateMsg {
            initial_price: coin(INITIAL_PRICE, INITIAL_DENOM),
            multiplier: INITIAL_MULTIPLIER,
            shares: vec![
                (TREASURY_ADDR.to_string(), TREASURY_SHARE),
                (MALEK_ADDR.to_string(), MALEK_SHARE),
                (KAYANSKI_ADDR.to_string(), KAYANSKI_SHARE),
            ],
        },
        Some(&chain.sender_addr()),
        &[],
    )?;

    Ok(())
}
