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
            new_price: 100_000u128.into(),
        },
        paiement.code_id()?,
    )?;

    Ok(())
}
