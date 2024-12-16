use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Addr, Coin, Decimal, Timestamp};
use cw_storage_plus::{Item, Map};

#[cw_serde]
pub struct InstantiateMsg {
    pub initial_price: Coin,
    pub multiplier: Decimal,
    pub shares: Vec<(String, Decimal)>,
}

#[cw_serde]
#[derive(cw_orch::ExecuteFns)]
pub enum ExecuteMsg {
    #[cw_orch(payable)]
    Deposit {
        message_hash: String,
        receiver: Option<String>,
    },
}

#[cw_serde]
#[derive(cw_orch::QueryFns, QueryResponses)]
pub enum QueryMsg {
    #[returns(CurrentPriceResponse)]
    CurrentPrice {},
    #[returns(MessagesResponse)]
    Messages {
        start_after: Option<u32>,
        limit: Option<u32>,
    },
}

#[cw_serde]
pub struct CurrentPriceResponse {
    pub price: Coin,
}

#[cw_serde]
pub struct MessagesResponse {
    pub message_id: u32,
    pub price_paid: Coin,
    pub sender: Addr,
    pub hash: String,
    pub time: Timestamp,
}

#[cw_serde]
pub struct Config {
    pub current_price: Decimal,
    pub paiement_denom: String,
    pub multiplier: Decimal,
    pub shares: Vec<(Addr, Decimal)>,
    pub next_payment_key: u32,
}

pub const CONFIG: Item<Config> = Item::new("config");

#[cw_serde]
pub struct MessageState {
    pub price_paid: Coin,
    pub user: Addr,
    pub msg_hash: String,
    pub time: Timestamp,
}

pub const MESSAGES: Map<u32, MessageState> = Map::new("messages");
