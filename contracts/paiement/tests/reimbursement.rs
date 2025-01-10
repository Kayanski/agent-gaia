use cosmwasm_std::{coin, Decimal, Uint128};
use cw_orch::mock::MockBech32;
use cw_orch::prelude::{CwOrchInstantiate, CwOrchUpload};
use paiement::interface::Paiement;
use paiement::msg::{ExecuteMsgFns, InstantiateMsg, QueryMsgFns, TimeLimit};

#[test]
fn reimbursement() -> anyhow::Result<()> {
    let chain = MockBech32::new("gaia");
    let contract = Paiement::new(chain.clone());
    let treasury = chain.addr_make("treasury");

    let initial_price = coin(100_000, "untrn");
    contract.upload()?;
    contract.instantiate(
        &InstantiateMsg {
            initial_price,
            multiplier: Decimal::percent(1),
            shares: vec![(treasury.to_string(), Decimal::one())],
            price_limit: None,
            time_limit: TimeLimit {
                min_messages: 400,
                seconds_limit: 60 * 60,
            },
        },
        None,
        &[],
    )?;

    // Deposit normal price
    let price = contract.current_price()?;
    chain.add_balance(&chain.sender, vec![price.price.clone()])?;
    contract.deposit("New message", None, &[price.price.clone()])?;
    assert_eq!(
        chain.query_balance(&chain.sender, &price.price.denom)?,
        Uint128::zero()
    );

    // Deposit higher price
    let price = contract.current_price()?;
    let mut paiement = price;

    let offset = 2736u128;

    paiement.price.amount += Uint128::from(offset);
    chain.add_balance(&chain.sender, vec![paiement.price.clone()])?;
    contract.deposit("New message", None, &[paiement.price.clone()])?;
    assert_eq!(
        chain.query_balance(&chain.sender, &paiement.price.denom)?,
        Uint128::from(offset)
    );

    Ok(())
}
