import { Memory } from "@elizaos/core"


export type ApiRoute = "gameState" | "uniqueWallets" | `highestPaiementId` | `recentMessages` | `messagesCount` | `messageCount` | `winner` |
    `messageById/${string}` | `messageByPaiementId/${string}` | `assistantMessageByPaiementId/${string}` |
    `lastMessageSender` | `allAddresses`


export interface UniqueWalletResponse {
    wallets: number
}

export type MemoryWithWinnerAndUserName = Memory & { isWinner: boolean, username: string }
export type MemoryWithUserName = Memory & { username: string }


export type EndGameCondition = {
    date: Date
} | {
    currentMessageNumber: number,
    triggerMessageNumber: number
};


export type TGameState = {
    uniqueWallets: number,
    messagesCount: number
    endgameCondition: EndGameCondition,
    gameStatus: TGameStatus,
    messagePrice: {
        denom: string,
        amount: string
    },
    prizeFund: number
}

export type TGameStateResponse = {
    uniqueWallets: number,
    messagesCount: number,
    gameStatus: TGameStatus
}

export type TGameStatus = ({
    isGameEnded: true,
    winner: string
} | { isGameEnded: false, winner: undefined })



export interface StructuredMessage {
    explanation: string;
    decision: boolean;
}