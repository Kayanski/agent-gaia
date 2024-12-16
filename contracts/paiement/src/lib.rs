pub mod msg;
use cosmwasm_std::{Coin, DecimalRangeExceeded, Response, StdError};
pub mod contract;

#[cfg(not(target_arch = "wasm32"))]
pub mod interface;

#[derive(thiserror::Error, Debug, PartialEq)]
pub enum PaiementError {
    #[error(transparent)]
    Std(#[from] StdError),

    #[error("Paiement didn't match, received {received:?}, expected {expected:?}")]
    PaiementDidntMatch {
        received: Vec<Coin>,
        expected: Vec<Coin>,
    },
    #[error(transparent)]
    DecimalRangeExceeded(#[from] DecimalRangeExceeded),

    #[error("Input shares sum should be equal to 1")]
    SharesNotEqualToOne {},
}

pub type PaiementResult<T = Response> = Result<T, PaiementError>;
