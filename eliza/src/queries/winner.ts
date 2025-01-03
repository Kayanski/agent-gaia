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
}