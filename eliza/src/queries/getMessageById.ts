import { AgentRuntime, Memory } from "@elizaos/core";
import PostgresDatabaseAdapter from "@elizaos/adapter-postgres";
import express from "express"
import { getRuntime } from "../api";
import { MAX_MESSAGES_DEFAULT } from "../constants";
import { MemoryWithWinnerAndUserName, MemoryWithUserName } from "./getMessages";

export async function getHighestPaiementId(runtime: AgentRuntime): Promise<number | undefined> {

    let sql = `SELECT MAX(CAST(memories.content->>'paiementId' as INTEGER)) as max FROM memories;`;

    const { rows } = await (runtime.databaseAdapter as PostgresDatabaseAdapter).query(sql);

    return rows[0].max ? parseInt(rows[0].max) : undefined
}

export async function getMessageById(runtime: AgentRuntime, messageId: string): Promise<MemoryWithUserName | undefined> {

    const sql = `SELECT memories.*, accounts.username FROM memories JOIN accounts ON memories."userId" = accounts.id WHERE memories.id = $1`

    const { rows } = await (runtime.databaseAdapter as PostgresDatabaseAdapter).query(sql, [messageId]);

    return rows[0] as MemoryWithUserName
}

export async function getMessageByPaiementId(runtime: AgentRuntime, paiementId: string): Promise<MemoryWithUserName | undefined> {

    const sql = `SELECT memories.*, accounts.username FROM memories JOIN accounts ON memories."userId" = accounts.id WHERE memories.content->>'paiementId' = $1`

    const { rows } = await (runtime.databaseAdapter as PostgresDatabaseAdapter).query(sql, [paiementId]);

    return rows[0] as MemoryWithUserName
}

export async function getAssistantMessageByPaiementId(runtime: AgentRuntime, paiementId: string): Promise<Memory | undefined> {

    const sql = `SELECT ai_memories.* FROM memories JOIN memories as ai_memories ON CAST(memories.id AS TEXT) = ai_memories.content->>'associatedMessageId' WHERE memories.content->>'paiementId' = $1`

    const { rows } = await (runtime.databaseAdapter as PostgresDatabaseAdapter).query(sql, [paiementId]);

    return rows[0] as Memory
}


export function createIdRoutes(app: express.Application, agents: Map<string, AgentRuntime>) {
    app.get(
        "/:agentId/highestPaiementId",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            res.json({
                result: await getHighestPaiementId(runtime)
            });
        })
    app.get(
        "/:agentId/messageById/:messageId",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            if (!req.params.messageId) {
                res.status(422).send("Please specify a messageId");
                return;
            }
            res.json({
                result: await getMessageById(runtime, req.params.messageId)
            });
        })
    app.get(
        "/:agentId/messageByPaiementId/:paiementId",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            if (!req.params.paiementId) {
                res.status(422).send("Please specify a paiementId");
                return;
            }
            res.json({
                result: await getMessageByPaiementId(runtime, req.params.paiementId)
            });
        })
    app.get(
        "/:agentId/assistantMessageByPaiementId/:paiementId",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            if (!req.params.paiementId) {
                res.status(422).send("Please specify a paiementId");
                return;
            }
            res.json({
                result: await getAssistantMessageByPaiementId(runtime, req.params.paiementId)
            });
        })
}




