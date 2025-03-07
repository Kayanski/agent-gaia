"use server"

import {
    elizaLogger,
    Media,
    getEmbeddingZeroVector,
    stringToUuid,
    Content,
    Memory,
    generateMessageResponse,
    ModelClass,
    Character,
    IDatabaseAdapter,
    IDatabaseCacheAdapter,
    CacheStore
} from "@elizaos/core";
import { composeContext } from "@elizaos/core";
import { AgentRuntime } from "@elizaos/core";

import { createAgent, getTokenForProvider, initializeCache, initializeClients, initializeDatabase, loadCharacters } from "./helpers";
import { acceptAction, rejectAction } from "./actions";
import { ACTIVE_NETWORK } from "../blockchain/chains";
import { messageHandlerTemplate } from "./template";

function agentId() {
    return "Big Tusk"
}
function roomId() {

    return stringToUuid(
        "default-room-" + agentId()
    )
}


export async function sendAiMessage(user: any, message: string) {
    const client = new NextClient()
    await client.init();

    const newMessage = await client.post(user, ACTIVE_NETWORK.character, message, 0, []);
    await client.stop();
    return newMessage
}

class NextClient {
    private agents: Map<string, AgentRuntime>; // container management
    private server: any; // Store server instance

    constructor() {
        elizaLogger.log("DirectClient constructor");
        this.agents = new Map()
    }

    async init() {
        const charactersArg = process.env.GAIA_FILE!;
        const characters = await loadCharacters(charactersArg);

        try {
            for (const character of characters) {
                await this.startAgent(character);
            }
        } catch (error) {
            elizaLogger.error("Error starting agents:", error);
        }

        elizaLogger.log(
            "Run `pnpm start:client` to start the client and visit the outputted URL (http://localhost:5173) to chat with your agents. When running multiple agents, use client with different port `SERVER_PORT=3001 pnpm start:client`"
        );
    }

    getRuntime(agentId: string) {
        let runtime = this.agents.get(agentId);

        // if runtime is null, look for runtime with the same name
        if (!runtime) {
            runtime = Array.from(this.agents.values()).find(
                (a) =>
                    a.character.name.toLowerCase() ===
                    agentId.toLowerCase()
            );
        }
        return runtime
    }

    public async post(bodyUserName: any, agentId: string, text: string, paiementId: number, attachments: Media[]) {

        console.log(bodyUserName, agentId, text, paiementId, attachments)

        const userName = bodyUserName.addr;
        const userId = stringToUuid(userName);

        const runtime = this.getRuntime(agentId)

        if (!runtime) {
            throw "Agent not found"
        }

        await runtime.ensureConnection(
            userId,
            roomId(),
            bodyUserName,
            bodyUserName,
            "direct"
        );
        const messageId = stringToUuid(Date.now().toString());


        const content: Content = {
            text,
            attachments,
            source: "direct",
            inReplyTo: undefined,
            paiementId,
        };

        const userMessage = {
            content,
            userId,
            roomId: roomId(),
            agentId: runtime.agentId,
        };
        const userMessageId = stringToUuid(messageId + "-" + userId);

        const memory: Memory = {
            id: userMessageId,
            ...userMessage,
            agentId: runtime.agentId,
            userId,
            roomId: roomId(),
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
        });

        const aiResponse = await generateMessageResponse({
            runtime: runtime,
            context,
            modelClass: ModelClass.MEDIUM,
        });
        console.log("This is the complete ai response", aiResponse)

        const contentResponse = {
            text: aiResponse.text,

            // TODO re-enable
            // decision: aiResponse.action ? [acceptAction.name, ...acceptAction.similes].includes(aiResponse.action) : false,
            originalMessage: text,
            userName,
            associatedMessageId: userMessageId,
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

        return aiResponse;
    }


    async startAgent(
        character: Character,
    ): Promise<[IDatabaseAdapter & IDatabaseCacheAdapter, AgentRuntime]> {
        let db: IDatabaseAdapter & IDatabaseCacheAdapter;
        try {
            character.id ??= stringToUuid(character.name);
            character.username ??= character.name;

            const token = await getTokenForProvider(character.modelProvider, character);

            db = await initializeDatabase() as IDatabaseAdapter &
                IDatabaseCacheAdapter;

            await db.init();

            const cache = await initializeCache(
                process.env.CACHE_STORE ?? CacheStore.DATABASE,
                character,
                "",
                db
            ); // "" should be replaced with dir for file system caching. THOUGHTS: might probably make this into an env
            const runtime: AgentRuntime = await createAgent(
                character,
                db,
                cache,
                token
            );

            // start services/plugins/process knowledge
            await runtime.initialize();

            // start assigned clients
            runtime.clients = await initializeClients(character, runtime);
            // TODO re-enable
            // runtime.actions = [acceptAction, rejectAction];

            // add to container
            this.registerAgent(runtime);

            // report to console
            elizaLogger.debug(`Started ${character.name} as ${runtime.agentId}`);
            return [db, runtime];
        } catch (error) {
            elizaLogger.error(
                `Error starting agent for character ${character.name}:`,
                error
            );
            elizaLogger.error(error);
            // @ts-ignore this fails from the original code
            if (db) {
                await db.close();
            }
            throw error;
        }
    }

    public registerAgent(runtime: AgentRuntime) {
        this.agents.set(runtime.agentId, runtime);
    }

    public async stop() {
        for (const [, runtime] of this.agents) {
            await runtime.stop()
        }

    }




    // createGameStateRoutes(this.app, this.agents)
    // createRecentMessagesRoute(this.app, this.agents)
    // createMessageCountRoute(this.app, this.agents)
    // createWinnerRoutes(this.app, this.agents)
    // createIdRoutes(this.app, this.agents)
    // createResetWinnerRoute(this.app, this.agents)
}



//     public unregisterAgent(runtime: AgentRuntime) {
//     this.agents.delete(runtime.agentId);
// }