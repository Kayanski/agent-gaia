import { Memory } from "@elizaos/core"


export type ApiRoute = "gameState" | "uniqueWallets" | `highestPaiementId` | `recentMessages` | `messagesCount` | `winner` |
    `messageById/${string}` | `messageByPaiementId/${string}` | `assistantMessageByPaiementId/${string}`


export interface UniqueWalletResponse {
    wallets: number
}

export type MemoryWithWinnerAndUserName = Memory & { isWinner: boolean, username: string }
export type MemoryWithUserName = Memory & { username: string }


export type TGameState = {
    uniqueWallets: number,
    messagesCount: number
    endgameTime: Date,
    gameStatus: TGameStatus
}

export type TGameStateResponse = {
    uniqueWallets: number,
    messagesCount: number
    endgameTime: string,
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