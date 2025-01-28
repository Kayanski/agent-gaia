use std::env;

use cosmwasm_schema::cw_serde;
use cosmwasm_std::Addr;
use cosmwasm_std_1::{Decimal, IbcTimeout, Uint128};
use cw_orch::daemon::RUNTIME;
use cw_orch::tokio::runtime::Runtime;
use dao_cw_orch::DaoPreProposeSingle;
use dao_pre_propose_base::msg::ExecuteMsgFns;
use dao_voting::voting::{SingleChoiceAutoVote, Vote};

use cw_orch_1::daemon::networks::NEUTRON_1;
use cw_orch_1::daemon::Daemon;
use cw_orch_1::prelude::QueryHandler;

pub const WINNER_SHARE: Decimal = Decimal::permille(875);

pub const COMMMUNITY_POOL: &str = "cosmos...";
pub const COMMMUNITY_POOL_SHARE: Decimal = Decimal::permille(125);
pub const CHANNEL_ID: &str = "channel-3";

pub const TREASURY_ADDR: &str =
    "neutron1dvlx4249q56z4wrgdn577393vvr5w6vhrkm8eet7ywkeefh3m0dq7ujj2u";

pub const TOKEN: &str = "untrn";

pub fn main() -> anyhow::Result<()> {
    dotenv::dotenv()?;
    env_logger::init();

    let winner = RUNTIME.block_on(query_winner())?;

    let chain = Daemon::builder(NEUTRON_1).build()?;
    let balance =
        chain.balance(&Addr::unchecked(TREASURY_ADDR), Some(TOKEN.to_string()))?[0].clone();

    // We create a proposal on the multisig
    let proposal_title = "Send all the funds to the winner";
    let proposal_description = "This sends all the funds to the protocol winner ! (test)";
    let winner_msg = cosmwasm_std_1::BankMsg::Send {
        to_address: winner,
        amount: vec![cosmwasm_std_1::Coin {
            denom: TOKEN.to_string(),
            amount: Uint128::from(balance.amount.u128()).mul_floor(WINNER_SHARE),
        }],
    };
    let current_block = chain.block_info()?;
    let community_pool_msg = cosmwasm_std_1::IbcMsg::Transfer {
        channel_id: CHANNEL_ID.to_string(),
        to_address: COMMMUNITY_POOL_SHARE.to_string(),
        amount: cosmwasm_std_1::Coin {
            denom: TOKEN.to_string(),
            amount: Uint128::from(balance.amount.u128()).mul_floor(COMMMUNITY_POOL_SHARE),
        },
        timeout: IbcTimeout::with_timestamp(current_block.time.plus_hours(1)),
    };

    let dao_proposal = DaoPreProposeSingle::new("gaia-dao-pre-proposal", chain.clone());
    dao_proposal.propose(dao_pre_propose_single::contract::ProposeMessage::Propose {
        title: proposal_title.to_string(),
        description: proposal_description.to_string(),
        msgs: vec![winner_msg.into(), community_pool_msg.into()],
        vote: Some(SingleChoiceAutoVote {
            vote: Vote::Yes,
            rationale: None,
        }),
    })?;

    Ok(())
}

#[derive(Debug)]
pub struct Winner {
    pub winner: Option<String>,
}

use sqlx::postgres::PgPoolOptions;

async fn query_winner() -> anyhow::Result<String> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&env::var("DATABASE_URL")?)
        .await?;

    let winner_assistant_memory = sqlx::query_as!(
        Winner,
        "SELECT content->>'userName' as winner FROM memories WHERE content->>'decision' = 'approveTransfer'::text",
    )
    .fetch_one(&pool)
    .await?;

    Ok(winner_assistant_memory.winner.unwrap())
}
