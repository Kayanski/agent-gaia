use cosmwasm_std::{
    coin, ensure_eq, to_json_binary, BankMsg, Binary, Coin, Decimal, Deps, DepsMut, Env,
    MessageInfo, Response, StdError,
};
use cw_paginate::paginate_map;
use cw_storage_plus::Bound;

use crate::{
    msg::{
        CurrentPriceResponse, ExecuteMsg, InstantiateMsg, MessageResponse, MigrateMsg, QueryMsg,
        ReceiverOptions, TimeoutStatusResponse, MESSAGES,
    },
    state::{Config, CONFIG, TRANSFER_CHANNEL_IDS},
    PaiementError, PaiementResult,
};

#[cfg_attr(not(feature = "library"), cosmwasm_std::entry_point)]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> PaiementResult<Response> {
    // We make sure shares add up to 1,
    let share_total: Decimal = msg.shares.iter().map(|(_a, s)| s).sum();
    ensure_eq!(
        share_total,
        Decimal::one(),
        PaiementError::SharesNotEqualToOne {}
    );

    CONFIG.save(
        deps.storage,
        &Config {
            current_price: Decimal::from_atomics(msg.initial_price.amount, 0)?,
            paiement_denom: msg.initial_price.denom,
            multiplier: msg.multiplier,
            next_payment_key: 0,
            shares: msg
                .shares
                .into_iter()
                .map(|(a, s)| {
                    let addr = deps.api.addr_validate(&a)?;

                    Ok::<_, StdError>((addr, s))
                })
                .collect::<Result<_, _>>()?,
            price_limit: msg.price_limit,
            time_limit: msg.time_limit,
            last_message_timestamp: env.block.time,
            char_limit: msg.char_limit,
        },
    )?;
    for (chain_id, channel) in msg.channel_ids {
        TRANSFER_CHANNEL_IDS.save(deps.storage, chain_id, &channel)?;
    }

    Ok(Response::new())
}

#[cfg_attr(not(feature = "library"), cosmwasm_std::entry_point)]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> PaiementResult {
    let mut config = CONFIG.load(deps.storage)?;

    match msg {
        ExecuteMsg::Deposit { message, receiver } => {
            // We make sure it's still possible to send messages
            config.assert_time_limit(&env)?;
            let (price, reimbursement_msgs) =
                config.assert_paiement(deps.as_ref(), &env, info.clone(), &receiver)?;
            let this_message_key = config.next_payment_key;
            if message.len() > config.char_limit.u128() as usize {
                return Err(PaiementError::MessageTooLong {});
            }

            MESSAGES.save(
                deps.storage,
                this_message_key,
                &crate::msg::MessageState {
                    price_paid: price.clone(),
                    receiver: receiver.unwrap_or(ReceiverOptions {
                        addr: info.sender.to_string(),
                        chain: env.block.chain_id,
                        denom: config.paiement_denom.clone(),
                    }),
                    time: env.block.time,
                    msg: message,
                },
            )?;

            // We send the funds to the different addresses
            let messages = config.shares.iter().flat_map(|(addr, share)| {
                let this_amount = price.amount.mul_floor(*share);
                if !this_amount.is_zero() {
                    Some(BankMsg::Send {
                        to_address: addr.to_string(),
                        amount: vec![Coin {
                            denom: price.denom.clone(),
                            amount: this_amount,
                        }],
                    })
                } else {
                    None
                }
            });

            config.current_price *= Decimal::one() + config.multiplier; // We update the price
                                                                        // We limit the price
            if let Some(price_limit) = config.price_limit {
                config.current_price = config.current_price.min(price_limit);
            }
            config.next_payment_key += 1;
            config.last_message_timestamp = env.block.time;
            CONFIG.save(deps.storage, &config)?;
            Ok(Response::new()
                .add_attribute("action", "deposit-ai")
                .add_attribute("paiement-id", this_message_key.to_string())
                .add_messages(reimbursement_msgs)
                .add_messages(messages))
        }
    }
}

#[cfg_attr(not(feature = "library"), cosmwasm_std::entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> PaiementResult<Binary> {
    match msg {
        QueryMsg::CurrentPrice {} => {
            let config = CONFIG.load(deps.storage)?;

            Ok(to_json_binary(&CurrentPriceResponse {
                price: coin(
                    config.current_price.to_uint_floor().u128(),
                    config.paiement_denom,
                ),
            })?)
        }
        QueryMsg::Config {} => {
            let config = CONFIG.load(deps.storage)?;

            Ok(to_json_binary(&config)?)
        }
        QueryMsg::Messages { start_after, limit } => to_json_binary(&paginate_map(
            &MESSAGES,
            deps.storage,
            start_after.map(Bound::exclusive),
            limit,
            |index, response| {
                Ok::<_, StdError>(MessageResponse {
                    message_id: index,
                    price_paid: response.price_paid,
                    sender: response.receiver,
                    time: response.time,
                    msg: response.msg,
                })
            },
        )?)
        .map_err(Into::into),
        QueryMsg::Message { message_id } => {
            to_json_binary(&MESSAGES.load(deps.storage, message_id).map(|response| {
                MessageResponse {
                    message_id,
                    price_paid: response.price_paid,
                    sender: response.receiver,
                    time: response.time,
                    msg: response.msg,
                }
            })?)
            .map_err(Into::into)
        }
        QueryMsg::TimeoutStatus {} => {
            let config = CONFIG.load(deps.storage)?;

            let response = if config.is_timer_inactive() {
                TimeoutStatusResponse::Inactive {
                    current_messages: config.next_payment_key,
                    trigger_message_count: config.time_limit.min_messages,
                }
            } else {
                TimeoutStatusResponse::Active {
                    end_date: config.timer_end(),
                }
            };

            to_json_binary(&response).map_err(Into::into)
        }
    }
}

#[cfg_attr(not(feature = "library"), cosmwasm_std::entry_point)]
pub fn migrate(deps: DepsMut, _env: Env, msg: MigrateMsg) -> PaiementResult {
    for (chain_id, channel) in msg.channel_ids {
        TRANSFER_CHANNEL_IDS.save(deps.storage, chain_id, &channel)?;
    }
    Ok(Response::new())
}
