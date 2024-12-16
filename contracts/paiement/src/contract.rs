use cosmwasm_std::{
    coin, coins, ensure_eq, to_json_binary, Binary, Decimal, Deps, DepsMut, Env, MessageInfo,
    Response, StdError,
};
use cw_paginate::paginate_map;
use cw_storage_plus::Bound;

use crate::{
    msg::{
        Config, CurrentPriceResponse, ExecuteMsg, InstantiateMsg, MessagesResponse, QueryMsg,
        CONFIG, MESSAGES,
    },
    PaiementError, PaiementResult,
};

#[cfg_attr(not(feature = "library"), cosmwasm_std::entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
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
        },
    )?;
    Ok(Response::new())
}

#[cfg_attr(not(feature = "library"), cosmwasm_std::entry_point)]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> PaiementResult {
    let mut config = CONFIG.load(deps.storage)?;

    match msg {
        ExecuteMsg::Deposit {
            message_hash,
            receiver,
        } => {
            let price = coins(
                config.current_price.to_uint_floor().u128(),
                config.paiement_denom.clone(),
            );
            ensure_eq!(
                info.funds,
                price,
                PaiementError::PaiementDidntMatch {
                    received: info.funds,
                    expected: price
                }
            );

            MESSAGES.save(
                deps.storage,
                0,
                &crate::msg::MessageState {
                    price_paid: info.funds[0].clone(),
                    user: receiver
                        .map(|address| deps.api.addr_validate(&address))
                        .transpose()?
                        .unwrap_or(info.sender),
                    msg_hash: message_hash,
                    time: env.block.time,
                },
            )?;

            config.current_price *= config.multiplier; // We update the price
            config.next_payment_key += 1;
            CONFIG.save(deps.storage, &config)?;
        }
    }

    Ok(Response::new())
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
        QueryMsg::Messages { start_after, limit } => to_json_binary(&paginate_map(
            &MESSAGES,
            deps.storage,
            start_after.map(Bound::exclusive),
            limit,
            |index, response| {
                Ok::<_, StdError>(MessagesResponse {
                    message_id: index,
                    price_paid: response.price_paid,
                    sender: response.user,
                    hash: response.msg_hash,
                    time: response.time,
                })
            },
        )?)
        .map_err(Into::into),
    }
}
