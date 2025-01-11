"use client"
import { GameStateContext } from "@/actions/database/gameStateContext";
import { useGameState } from "@/actions/database/getGameState";


export function Context({ children }: { children: React.ReactNode }) {

    const { data: gameState } = useGameState();

    return (
        <GameStateContext.Provider value={gameState}>
            {children}
        </GameStateContext.Provider>)
}