import { Account, AgentRuntime, Memory, stringToUuid } from "@elizaos/core";
import { roomId } from "../client";
import { MAX_MESSAGES_DEFAULT } from "../constants";
import PostgresDatabaseAdapter from "@elizaos/adapter-postgres";
import express, { Request as ExpressRequest } from "express";
import { getRuntime } from "../api";
import { getWinnerAssistantMemory, getWinnerMessageIdFromWinnerAssistantMemory } from "./winner";

export type MemoryWithWinnerAndUserName = Memory & { isWinner: boolean, username: string }
export type MemoryWithUserName = Memory & { username: string }


export async function getRecentMessages(runtime: AgentRuntime, userAddress: string | undefined, max: number = MAX_MESSAGES_DEFAULT): Promise<MemoryWithWinnerAndUserName[]> {
    // Build query
    let sql = `SELECT memories.*, accounts.username FROM memories JOIN accounts ON memories."userId" = accounts.id WHERE type = $1 AND "roomId" = $2`;
    const values: any[] = ["messages", roomId()];
    let paramCount = 2;

    // Adding user filter
    if (userAddress) {
        paramCount++;
        sql += ` AND "userId" = $${paramCount}`;
        values.push(stringToUuid(userAddress));
    }

    // Add ordering and limit
    sql += ' ORDER BY memories."createdAt" DESC';

    // Adding maximum
    paramCount++;
    sql += ` LIMIT $${paramCount}`;
    values.push(max);

    const { rows } = await (runtime.databaseAdapter as PostgresDatabaseAdapter).query(sql, values);
    const messages: (Memory & Account)[] = rows.map((row) => ({
        ...row,
        content:
            typeof row.content === "string"
                ? JSON.parse(row.content)
                : row.content,
    }));
    messages.reverse()

    // We add an isWinner field
    // We query the winner message id
    const winnerAssistantMemory = await getWinnerAssistantMemory(runtime);
    const winnerMessageId = getWinnerMessageIdFromWinnerAssistantMemory(winnerAssistantMemory)

    // We query the account userName for each
    return messages.map((message) => ({
        isWinner: message.id === winnerMessageId,
        ...message,
    }))
}

export function createRecentMessagesRoute(app: express.Application, agents: Map<string, AgentRuntime>) {
    app.get(
        "/:agentId/recentMessages",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)
            const userAddress = req.query.userAddress as string | undefined;
            const maxMessages = parseInt(req.query.max as string ?? MAX_MESSAGES_DEFAULT.toString())

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            res.json(await getRecentMessages(runtime, userAddress, maxMessages));
        })
}