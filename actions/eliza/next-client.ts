import bodyParser from "body-parser";
import cors from "cors";
import express, { Request as ExpressRequest } from "express";
import multer from "multer";
import {
    elizaLogger,
    generateCaption,
    generateImage,
    Media,
    getEmbeddingZeroVector,
    parseJSONObjectFromText
} from "@elizaos/core";
import { composeContext } from "@elizaos/core";
import { messageCompletionFooter } from "@elizaos/core";
import { AgentRuntime } from "@elizaos/core";
import {
    Content,
    Memory,
    ModelClass,
    Client,
    IAgentRuntime,
} from "@elizaos/core";
import { stringToUuid } from "@elizaos/core";
import { settings } from "@elizaos/core";
import * as fs from "fs";
import * as path from "path";
import { sendMessage } from "@/services/llm";
import { ParsedExplanation } from "@/services/llm/types";

export const messageHandlerTemplate =
    // {{goals}}
    `# Action Examples
{{actionExamples}}
(Action examples are for reference only. Do not use the information from them in your response.)

# Knowledge
{{knowledge}}

# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}

{{providers}}

{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

{{actions}}

# Instructions: Write the next message for {{agentName}}.
`;

export class NextClient {
    private agents: Map<string, AgentRuntime>; // container management

    constructor() {
        elizaLogger.log("DirectClient constructor");
        this.agents = new Map();
    }

    public async postMessage(text: string, userName: string) {

        const agentName = "GAIA";
        const agentId = "gaia"
        const roomId = stringToUuid(
            "default-room-" + agentId
        );
        const userId = stringToUuid(userName);

        let runtime = this.agents.get(agentId);

        // if runtime is null, look for runtime with the same name
        if (!runtime) {
            runtime = Array.from(this.agents.values()).find(
                (a) =>
                    a.character.name.toLowerCase() ===
                    agentId.toLowerCase()
            );
        }

        if (!runtime) {
            throw "Agent not found";
            return;
        }

        await runtime.ensureConnection(
            userId,
            roomId,
            userName,
            userName,
            "direct"
        );

        const messageId = stringToUuid(Date.now().toString());

        const attachments: Media[] = [];


        const content: Content = {
            text,
            attachments,
            source: "direct",
            inReplyTo: undefined,
        };

        const userMessage = {
            content,
            userId,
            roomId,
            agentId: runtime.agentId,
        };

        const memory: Memory = {
            id: stringToUuid(messageId + "-" + userId),
            ...userMessage,
            agentId: runtime.agentId,
            userId,
            roomId,
            content,
            createdAt: Date.now(),
        };

        await runtime.messageManager.addEmbeddingToMemory(memory);
        await runtime.messageManager.createMemory(memory);

        let state = await runtime.composeState(userMessage, {
            agentName: runtime.character.name,
        });

        const context = composeContext({
            state,
            template: messageHandlerTemplate,
        }); console.log(context)


        const response = await generateMessageResponse(context);
        const contentResponse = {
            text: response.explanation,
            action: response.decision ? "approveTransfer" : "rejectTransfer",
        };

        // save response to memory
        const responseMessage: Memory = {
            id: stringToUuid(messageId + "-" + runtime.agentId),
            ...userMessage,
            userId: runtime.agentId,
            content: contentResponse,
            embedding: getEmbeddingZeroVector(),
            createdAt: Date.now(),
        };

        await runtime.messageManager.createMemory(responseMessage);

        state = await runtime.updateRecentMessageState(state);

        let message = null as Content | null;

        await runtime.processActions(
            memory,
            [responseMessage],
            state,
            async (newMessages) => {
                message = newMessages;
                return [memory];
            }
        );

        await runtime.evaluate(memory, state);

    }

    // agent/src/index.ts:startAgent calls this
    public registerAgent(runtime: AgentRuntime) {
        this.agents.set(runtime.agentId, runtime);
    }

    public unregisterAgent(runtime: AgentRuntime) {
        this.agents.delete(runtime.agentId);
    }
}
async function generateMessageResponse(content: string) {
    let retryLength = 1000; // exponential backoff
    while (true) {
        try {
            elizaLogger.log("Generating message response..");

            const response = await sendMessage({
                messages: [{
                    role: "user",
                    content
                }]
            });

            return response
        } catch (error) {
            elizaLogger.error("ERROR:", error);
            // wait for 2 seconds
            retryLength *= 2;
            await new Promise((resolve) => setTimeout(resolve, retryLength));
            elizaLogger.debug("Retrying...");
        }
    }

}


export default NextClient;

