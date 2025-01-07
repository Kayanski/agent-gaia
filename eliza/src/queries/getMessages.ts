import { Account, AgentRuntime, Memory, stringToUuid } from "@elizaos/core";
import { roomId } from "../client";
import { MAX_MESSAGES_DEFAULT } from "../constants";
import PostgresDatabaseAdapter from "@elizaos/adapter-postgres";
import express, { Request as ExpressRequest } from "express";
import { getRuntime } from "../api";
import { getWinnerAssistantMemory, getWinnerMessageIdFromWinnerAssistantMemory } from "./winner";
import { MemoryWithWinnerAndUserName } from "../types";

export async function getRecentMessages(runtime: AgentRuntime, userAddress: string | undefined, max: number = MAX_MESSAGES_DEFAULT): Promise<MemoryWithWinnerAndUserName[]> {
    // Build query
    let sql = `SELECT memories.*, accounts.username FROM memories JOIN accounts ON memories."userId" = accounts.id WHERE type = $1 AND "roomId" = $2`;
    const values: any[] = ["messages", roomId()];
    let paramCount = 2;

    // Adding user filter
    if (userAddress) {
        sql += ` AND ("userId" = $${paramCount + 1} OR memories.content->>'userName' = $${paramCount + 2})`;
        paramCount += 2;
        values.push(stringToUuid(userAddress));
        values.push(userAddress);
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
        isWinner: message.id === winnerMessageId || message.id == winnerAssistantMemory.id,
        ...message,
    }))
}

export async function getMessageCount(runtime: AgentRuntime, userAddress: string | undefined): Promise<MemoryWithWinnerAndUserName[]> {
    // Build query
    let sql = `SELECT COUNT(*) as count FROM memories JOIN accounts ON memories."userId" = accounts.id WHERE type = $1 AND "roomId" = $2`;
    const values: any[] = ["messages", roomId()];
    let paramCount = 2;

    // Adding user filter
    if (userAddress) {
        sql += ` AND ("userId" = $${paramCount + 1} OR memories.content->>'userName' = $${paramCount + 2})`;
        paramCount += 2;
        values.push(stringToUuid(userAddress));
        values.push(userAddress);
    }

    const { rows } = await (runtime.databaseAdapter as PostgresDatabaseAdapter).query(sql, values);
    const messages: (Memory & Account)[] = rows.map((row) => ({
        ...row,
        content:
            typeof row.content === "string"
                ? JSON.parse(row.content)
                : row.content,
    }));

    return rows[0].count
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
    app.get(
        "/:agentId/messageCount",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)
            const userAddress = req.query.userAddress as string | undefined;

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            res.json(await getMessageCount(runtime, userAddress));
        })
}