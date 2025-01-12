
// @eliza/core

/**
 * Represents a stored memory/message
 */
interface Memory {
    /** Optional unique identifier */
    id?: UUID;
    /** Associated user ID */
    userId: UUID;
    /** Associated agent ID */
    agentId: UUID;
    /** Optional creation timestamp */
    createdAt?: number;
    /** Memory content */
    content: Content;
    /** Optional embedding vector */
    embedding?: number[];
    /** Associated room ID */
    roomId: UUID;
    /** Whether memory is unique */
    unique?: boolean;
    /** Embedding similarity score */
    similarity?: number;
}

/**
 * Represents a UUID string in the format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 */
type UUID = `${string}-${string}-${string}-${string}-${string}`;
/**
 * Represents the content of a message or communication
 */
interface Content {
    /** The main text content */
    text: string;
    /** Optional action associated with the message */
    action?: string;
    /** Optional source/origin of the content */
    source?: string;
    /** URL of the original message/post (e.g. tweet URL, Discord message link) */
    url?: string;
    /** UUID of parent message if this is a reply/thread */
    inReplyTo?: UUID;
    /** Array of media attachments */
    attachments?: any[];
    /** Additional dynamic properties */
    [key: string]: unknown;
}

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

export type TimeoutStatus = {
    "inactive": {
        currentMessages: number,
        triggerMessageCount: number
    }
} | {
    "active": {
        endDate: Date
    }
}


export type TGameState = {
    uniqueWallets: number,
    messagesCount: number
    timeoutStatus: TimeoutStatus,
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