use cosmwasm_schema::cw_serde;
use cosmwasm_std::{
    coin, coins, ensure, ensure_eq, Addr, BankMsg, Coin, Decimal, Env, MessageInfo, Timestamp,
    Uint128,
};
use cw_storage_plus::Item;

use crate::{msg::TimeLimit, PaiementError, PaiementResult};

#[cw_serde]
pub struct Config {
    pub current_price: Decimal,
    pub paiement_denom: String,
    pub multiplier: Decimal,
    pub shares: Vec<(Addr, Decimal)>,
    pub next_payment_key: u32,
    pub last_message_timestamp: Timestamp,
    pub price_limit: Option<Decimal>,
    pub time_limit: TimeLimit,
    pub char_limit: Uint128,
}

impl Config {
    pub fn assert_time_limit(&self, env: &Env) -> PaiementResult<()> {
        if self.is_timer_inactive() {
            return Ok(());
        }
        if self.timer_end() < env.block.time {
            Err(PaiementError::GameEnded {})
        } else {
            Ok(())
        }
    }

    pub fn is_timer_inactive(&self) -> bool {
        self.next_payment_key <= self.time_limit.min_messages
    }

    pub fn timer_end(&self) -> Timestamp {
        self.last_message_timestamp
            .plus_seconds(self.time_limit.seconds_limit)
    }

    pub fn assert_paiement(&self, info: MessageInfo) -> PaiementResult<(Coin, Option<BankMsg>)> {
        let price = coin(
            self.current_price.to_uint_floor().u128(),
            self.paiement_denom.clone(),
        );
        ensure_eq!(
            info.funds.len(),
            1,
            PaiementError::PaiementDidntMatch {
                received: info.funds,
                expected: vec![price]
            }
        );
        ensure_eq!(
            info.funds[0].denom,
            price.denom,
            PaiementError::PaiementDidntMatch {
                received: info.funds,
                expected: vec![price]
            }
        );
        ensure!(
            info.funds[0].amount >= price.amount,
            PaiementError::PaiementDidntMatch {
                received: info.funds,
                expected: vec![price]
            }
        );

        let funds_difference = info.funds[0].amount - price.amount;
        if funds_difference.is_zero() {
            return Ok((price, None));
        }

        Ok((
            price,
            Some(BankMsg::Send {
                to_address: info.sender.to_string(),
                amount: coins(funds_difference.into(), &info.funds[0].denom),
            }),
        ))
    }
}

pub const CONFIG: Item<Config> = Item::new("config");
