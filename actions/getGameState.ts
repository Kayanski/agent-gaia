export interface TGameState {
    uniqueWallets: number,
    messagesCount: number
    endgameTime: Date,
    isGameEnded: boolean
}

export async function getGameState(): Promise<TGameState> {
    return {
        uniqueWallets: 4,
        messagesCount: 5,
        endgameTime: new Date(),
        isGameEnded: false,
    }
}