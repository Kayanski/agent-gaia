import { AgentRuntime, Memory } from "@elizaos/core";
import express, { Request as ExpressRequest, query } from "express";
import { getRuntime } from "../api";
import PostgresDatabaseAdapter from "@elizaos/adapter-postgres";
import { getMessagesCount } from "./getMessagesCount";
import { Agent } from "langchain/agents";
import { getWinnerAssistantMemory, getWinnerFromWinnerAssistantMemory } from "./winner";

export type TGameState = {
    uniqueWallets: number,
    messagesCount: number,
    gameStatus: TGameStatus
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

export interface Count {
    count: string
}

export interface UniqueWalletResponse {
    wallets: number
}

async function getUniqueWallets(runtime: AgentRuntime): Promise<{ wallets: number }> {
    const queryResult = await (runtime.databaseAdapter as PostgresDatabaseAdapter).query(`SELECT COUNT(*) as count FROM accounts WHERE username != 'GAIA'`)
    return { wallets: queryResult.rows[0].count };
}


export async function getGameState(runtime: AgentRuntime): Promise<TGameState> {

    const uniqueWallets = await getUniqueWallets(runtime);
    const messagesCount = await getMessagesCount(runtime);
    const winnerAssistantMemory = await getWinnerAssistantMemory(runtime);
    const winner = getWinnerFromWinnerAssistantMemory(winnerAssistantMemory)

    return {
        uniqueWallets: uniqueWallets.wallets,
        messagesCount: Math.round(messagesCount / 2),
        gameStatus: winner ? {
            isGameEnded: true,
            winner: winner
        } : {
            isGameEnded: false,
            winner: undefined
        }
    }
}

export function createGameStateRoutes(app: express.Application, agents: Map<string, AgentRuntime>) {
    app.get(
        "/:agentId/gameState",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            res.json(await getGameState(runtime));
        })
    app.get(
        "/:agentId/uniqueWallets",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            res.json(await getUniqueWallets(runtime));
        })
}

export function endGameDate() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
}