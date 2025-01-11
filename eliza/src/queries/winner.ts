import PostgresDatabaseAdapter from "@elizaos/adapter-postgres"
import { AgentRuntime, Memory } from "@elizaos/core"
import express from "express";
import { getRuntime } from "../api";

export async function getWinnerAssistantMemory(runtime: AgentRuntime): Promise<Memory | undefined> {
    const queryResult = await (runtime.databaseAdapter as PostgresDatabaseAdapter).query<Memory>(`SELECT * FROM memories WHERE content->>'decision' = 'approveTransfer'::text`)
    return queryResult.rows[0]
}

export function getWinnerFromWinnerAssistantMemory(memory: Memory | undefined): string | undefined {
    return memory?.content["userName"] as string
}

export function getWinnerMessageFromWinnerAssistantMemory(memory: Memory | undefined): string | undefined {
    return memory?.content["originalMessage"] as string
}

export function getWinnerMessageIdFromWinnerAssistantMemory(memory: Memory | undefined): string | undefined {
    return memory?.content["associatedMessageId"] as string
}

export async function lastMessageSender(runtime: AgentRuntime): Promise<string | undefined> {
    const queryResult = await (runtime.databaseAdapter as PostgresDatabaseAdapter).query(`SELECT accounts.userName FROM memories JOIN accounts ON memories."userId" = accounts.id WHERE type = 'messages' AND memories."agentId" != memories."userId" ORDER BY memories."createdAt" DESC LIMIT 1`)
    return queryResult.rows[0]?.username as string
}

export async function allAddresses(runtime: AgentRuntime): Promise<string[]> {
    const queryResult = await (runtime.databaseAdapter as PostgresDatabaseAdapter).query(`SELECT DISTINCT accounts.userName FROM memories JOIN accounts ON memories."userId" = accounts.id WHERE type = 'messages' AND memories."agentId" != memories."userId" `)

    return queryResult.rows.map(({ username }) => username)
}

export function createWinnerRoutes(app: express.Application, agents: Map<string, AgentRuntime>) {
    app.get(
        "/:agentId/winner",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            const winnerAssistantMemory = await getWinnerAssistantMemory(runtime);
            res.json({ result: getWinnerFromWinnerAssistantMemory(winnerAssistantMemory) });
        })
    app.get(
        "/:agentId/lastMessageSender",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            res.json({ result: await lastMessageSender(runtime) });
        })
    app.get(
        "/:agentId/allAddresses",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            res.json({ result: await allAddresses(runtime) });
        })
}