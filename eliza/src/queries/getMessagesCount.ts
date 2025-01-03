import PostgresDatabaseAdapter from "@elizaos/adapter-postgres";
import { AgentRuntime } from "@elizaos/core";
import { roomId } from "../client";
import express, { Request as ExpressRequest } from "express";
import { getRuntime } from "../api";


export async function getMessagesCount(runtime: AgentRuntime): Promise<number> {
    const messagesCount = await (runtime.databaseAdapter as PostgresDatabaseAdapter).countMemories(roomId(), false, "messages")
    return Math.round(messagesCount)
}

export function createMessageCountRoute(app: express.Application, agents: Map<string, AgentRuntime>) {
    app.get(
        "/:agentId/messagesCount",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            res.json(await getMessagesCount(runtime));
        })
}