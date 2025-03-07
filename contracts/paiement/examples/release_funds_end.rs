use std::env;

use cosmos_sdk_proto::{
    cosmos::{bank::v1beta1::MsgSend, base::v1beta1::Coin},
    prost::Name,
    traits::MessageExt,
};
use cosmwasm_schema::serde::Deserialize;
use cosmwasm_std_1::{coin, Addr, BankMsg, Coins, CosmosMsg, Decimal, IbcMsg, IbcTimeout, Uint128};
use cw_orch::daemon::RUNTIME;
use dao_cw_orch::{DaoDaoCore, DaoPreProposeSingle};

use cw_orch_1::daemon::networks::NEUTRON_1;
use cw_orch_1::daemon::Daemon;
use cw_orch_1::prelude::*;

pub const LAST_SENDER_SHARE: Decimal = Decimal::percent(0);

pub const TREASURY_ADDR: &str =
    "neutron1dvlx4249q56z4wrgdn577393vvr5w6vhrkm8eet7ywkeefh3m0dq7ujj2u";

pub const CHUNK_SIZE: usize = 100;
pub const TOKEN1: &str = "untrn";
pub const TOKEN2: &str = "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9";

pub const NEUTRON_TO_COSMOS_CHANNEL_ID: &str = "channel-1";

pub fn main() -> anyhow::Result<()> {
    dotenv::dotenv()?;
    env_logger::init();

    let participants = RUNTIME.block_on(query_all_participants())?;
    let winner: User = serde_json::from_str(&RUNTIME.block_on(query_last_message_sender())?)?;

    let total_messages = participants.iter().map(|(_, c)| c).sum::<i64>() as u128;

    let chain = Daemon::builder(NEUTRON_1).build()?;
    let mut balances = vec![];
    let balance1 =
        chain.balance(&Addr::unchecked(TREASURY_ADDR), Some(TOKEN1.to_string()))?[0].clone();
    let balance2 =
        chain.balance(&Addr::unchecked(TREASURY_ADDR), Some(TOKEN2.to_string()))?[0].clone();
    balances.push(balance1);
    balances.push(balance2);

    let mut last_sender_amounts = vec![];
    for b in &mut balances {
        let amount = Uint128::from(b.amount.u128()).mul_floor(LAST_SENDER_SHARE);
        last_sender_amounts.push(coin(amount.u128(), b.denom.clone()));
        b.amount -= amount;
    }

    let mut each_participants_amount = vec![];
    for b in balances {
        let amount = b.amount.u128() / total_messages;
        each_participants_amount.push(coin(amount, b.denom))
    }

    let current_block = chain.block_info()?;
    let last_sender_msgs: Vec<CosmosMsg> = if winner.chain == chain.chain_info().chain_id {
        vec![cosmwasm_std_1::BankMsg::Send {
            to_address: winner.addr.clone(),
            amount: last_sender_amounts,
        }
        .into()]
    } else if winner.chain == "cosmoshub-4" {
        last_sender_amounts
            .iter()
            .map(|c| {
                cosmwasm_std_1::IbcMsg::Transfer {
                    channel_id: NEUTRON_TO_COSMOS_CHANNEL_ID.to_string(),
                    to_address: winner.addr.clone(),
                    amount: c.clone(),
                    timeout: IbcTimeout::with_timestamp(current_block.time.plus_hours(1)),
                }
                .into()
            })
            .collect()
    } else {
        panic!("Chain not supported {:?}", winner.chain);
    };
    // We add the winner message to this prop (this is not necessarily the last person on the contract)

    // First proposal for the winner
    let dao_proposal = DaoPreProposeSingle::new("gaia-dao-pre-proposal", chain.clone());
    let dao_address = DaoDaoCore::new("gaia-dao-address", chain.clone());

    let proposal_title = "Send all the funds to the last participant";
    let proposal_description = "This sends all the funds to the game winner (10%) !";
    dao_proposal.propose(dao_pre_propose_single::contract::ProposeMessage::Propose {
        title: proposal_title.to_string(),
        description: proposal_description.to_string(),
        msgs: last_sender_msgs,
        vote: Some(SingleChoiceAutoVote {
            vote: Vote::Yes,
            rationale: None,
        }),
    })?;

    for (i, chunk) in participants.chunks(CHUNK_SIZE).enumerate() {
        let mut participant_msgs: Vec<CosmosMsg> = vec![];
        for participant in chunk {
            if participant.0.chain == chain.chain_info().chain_id {
                let mut amounts: Vec<_> = each_participants_amount
                    .iter()
                    .map(|c| coin(c.amount.u128() * participant.1 as u128, c.denom.clone()))
                    .collect();
                amounts.sort_by(|a, b| a.denom.cmp(&b.denom));

                participant_msgs.push(
                    cosmwasm_std_1::BankMsg::Send {
                        to_address: participant.0.addr.to_string(),
                        amount: amounts,
                    }
                    .into(),
                );
            } else if participant.0.chain == "cosmoshub-4" {
                // We send to my address and I reimburse the participants
                let mut amounts = each_participants_amount
                    .iter()
                    .map(|c| coin(c.amount.u128() * participant.1 as u128, c.denom.clone()))
                    .collect::<Vec<_>>();
                println!("Need to send to {:?} : {:?}", participant, amounts);
                amounts.sort_by(|a, b| a.denom.cmp(&b.denom));
                participant_msgs.push(
                    cosmwasm_std_1::BankMsg::Send {
                        to_address: "neutron1ay3785eqz0cyeptv2hhgd86clv7x9zg98g2840".to_string(),
                        amount: amounts,
                    }
                    .into(),
                );
            } else {
                panic!("Chain not supported {:?}", participant.0.chain);
            }
        }

        // Before submitting, I simulate, to make sure this wil work
        RUNTIME.block_on(
            chain.sender().simulate(
                participant_msgs
                    .iter()
                    .flat_map(|t| match t {
                        CosmosMsg::Bank(BankMsg::Send { to_address, amount }) => {
                            let amounts = amount
                                .iter()
                                .map(|a| cosmos_sdk_proto::cosmos::base::v1beta1::Coin {
                                    denom: a.denom.clone(),
                                    amount: a.amount.to_string(),
                                })
                                .collect::<Vec<_>>();

                            Some(Any {
                                type_url: MsgSend::type_url(),
                                value: MsgSend {
                                    from_address: dao_address.address().unwrap().to_string(),
                                    to_address: to_address.clone(),
                                    amount: amounts,
                                }
                                .to_bytes()
                                .unwrap(),
                            })
                        }
                        CosmosMsg::Ibc(IbcMsg::Transfer {
                            channel_id,
                            to_address,
                            amount,
                            timeout,
                        }) => Some(Any {
                            type_url: MsgTransfer::type_url(),
                            value: MsgTransfer {
                                source_port: "transfer".to_string(),
                                source_channel: channel_id.clone(),
                                token: Some(Coin {
                                    denom: amount.denom.clone(),
                                    amount: amount.amount.to_string(),
                                }),
                                sender: dao_address.address().unwrap().to_string(),
                                receiver: to_address.clone(),
                                timeout_height: None,
                                timeout_timestamp: timeout
                                    .timestamp()
                                    .map(|t| t.nanos())
                                    .unwrap_or(0),
                                memo: "".to_string(),
                            }
                            .to_bytes()
                            .unwrap(),
                        }),
                        _ => todo!(),
                    })
                    .collect(),
                None,
            ),
        );
        dao_proposal.propose(dao_pre_propose_single::contract::ProposeMessage::Propose {
            title: format!("Send participant prize for chunk {i}"),
            description: "Sending participation prizes for 100 people in this chunk".to_string(),
            msgs: participant_msgs,
            vote: Some(SingleChoiceAutoVote {
                vote: Vote::Yes,
                rationale: None,
            }),
        })?;
    }

    Ok(())
}

use dao_pre_propose_base::msg::ExecuteMsgFns;
use dao_voting::voting::{SingleChoiceAutoVote, Vote};
use ibc_proto::ibc::apps::transfer::v1::MsgTransfer;
use prost_types::Any;
use sqlx::postgres::PgPoolOptions;

#[derive(Debug)]
pub struct DBParticipant {
    /// Memory content
    pub participant: Option<String>,
    pub count: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct User {
    pub addr: String,
    pub chain: String,
    pub denom: String,
}

async fn query_all_participants() -> anyhow::Result<Vec<(User, i64)>> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&env::var("DATABASE_URL")?)
        .await?;

    let participants = sqlx::query_as!(
        DBParticipant,
        "SELECT accounts.userName as participant, COUNT(memories.id) AS count FROM memories JOIN accounts ON memories.\"userId\" = accounts.id WHERE type = 'messages' AND memories.\"agentId\" != memories.\"userId\" GROUP BY accounts.userName",
    )
    .fetch_all(&pool)
    .await?;

    Ok(participants
        .into_iter()
        .map(|p| {
            (
                serde_json::from_str(&p.participant.unwrap()).unwrap(),
                p.count.unwrap(),
            )
        })
        .collect())
}

#[derive(Debug)]
pub struct LastParticipant {
    pub participant: Option<String>,
}

async fn query_last_message_sender() -> anyhow::Result<String> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&env::var("DATABASE_URL")?)
        .await?;

    let last_message_sender_memory = sqlx::query_as!(
        LastParticipant,
        "SELECT accounts.userName as participant FROM memories JOIN accounts ON memories.\"userId\" = accounts.id WHERE type = 'messages' AND memories.\"agentId\" != memories.\"userId\" ORDER BY memories.\"createdAt\" DESC LIMIT 1",
    )
    .fetch_one(&pool)
    .await?;

    Ok(last_message_sender_memory.participant.unwrap())
}
