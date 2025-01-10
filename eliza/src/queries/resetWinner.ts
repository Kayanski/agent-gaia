import { AgentRuntime } from "@elizaos/core";
import { getWinnerAssistantMemory } from "./winner";
import PostgresDatabaseAdapter from "@elizaos/adapter-postgres";
import express from "express";
import { getRuntime } from "../api";

async function resetWinner(runtime: AgentRuntime): Promise<void> {

    const winnerAssistantMemory = await getWinnerAssistantMemory(runtime);
    if (!winnerAssistantMemory) {
        return
    }
    let sql = `UPDATE memories SET content = jsonb_set(content, '{decision}', '"rejectTransfer"') WHERE id=$1`;

    await (runtime.databaseAdapter as PostgresDatabaseAdapter).query(sql, [winnerAssistantMemory.id]);
}

export function createResetWinnerRoute(app: express.Application, agents: Map<string, AgentRuntime>) {
    app.post(
        "/:agentId/resetWinner",
        async (req: express.Request, res: express.Response) => {
            let runtime = getRuntime(agents, req.params.agentId)

            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            await resetWinner(runtime)
            res.json({ result: true });
        })
}