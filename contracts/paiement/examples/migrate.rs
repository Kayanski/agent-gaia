use std::str::FromStr;

use cosmwasm_std::Decimal;
use cw_orch::{daemon::Daemon, prelude::*};
use networks::NEUTRON_1;
use paiement::{interface::Paiement, msg::MigrateMsg};

pub fn main() -> anyhow::Result<()> {
    dotenv::dotenv()?;
    env_logger::init();
    let chain = Daemon::builder(NEUTRON_1).build()?;

    let paiement = Paiement::new(chain.clone());

    paiement.upload()?;
    paiement.migrate(
        &MigrateMsg {
            new_multiplier: Decimal::from_str("0.01")?,
        },
        paiement.code_id()?,
    )?;

    Ok(())
}
