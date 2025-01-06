import bodyParser from "body-parser";
import cors from "cors";
import express, { Request as ExpressRequest } from "express";
import multer from "multer";
import {
    elizaLogger,
    generateCaption,
    generateImage,
    Media,
    getEmbeddingZeroVector
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
import { createApiRouter, getRuntime } from "./api.ts";
import * as fs from "fs";
import * as path from "path";
import { sendMessage } from "./llm/index.ts";
import { createGameStateRoutes } from "./queries/gameState.ts";
import { createRecentMessagesRoute } from "./queries/getMessages.ts";
import { createMessageCountRoute } from "./queries/getMessagesCount.ts";
import { createWinnerRoutes } from "./queries/winner.ts";
import { createIdRoutes } from "./queries/getMessageById.ts";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), "data", "uploads");
        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({ storage });

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

# Instructions: Write the next message for {{agentName}}.`;


export function agentId() {
    return "gaia"
}

export function roomId() {
    return stringToUuid(
        "default-room-" + agentId()
    )
}
export class DirectClient {
    public app: express.Application;
    private agents: Map<string, AgentRuntime>; // container management
    private server: any; // Store server instance
    public startAgent: Function; // Store startAgent functor

    constructor() {
        elizaLogger.log("DirectClient constructor");
        this.app = express();
        this.app.use(cors());
        this.agents = new Map();

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        // Serve both uploads and generated images
        this.app.use(
            "/media/uploads",
            express.static(path.join(process.cwd(), "/data/uploads"))
        );
        this.app.use(
            "/media/generated",
            express.static(path.join(process.cwd(), "/generatedImages"))
        );

        const apiRouter = createApiRouter(this.agents, this);
        this.app.use(apiRouter);

        // Define an interface that extends the Express Request interface
        interface CustomRequest extends ExpressRequest {
            file?: Express.Multer.File;
        }

        this.app.post(
            "/:agentId/message",
            upload.single("file"),
            async (req: express.Request, res: express.Response) => {

                // We make sure only the frontend server can call this with a secret
                let auth = req.headers.authorization;
                if (process.env.ENV != "dev" && auth !== "Bearer " + process.env.API_BEARER_TOKEN) {
                    res.status(401).send("Only authorized bearer can communicate with this server")
                }
                if (!req.body.userName) {
                    res.status(422).send({ error: "Missing user name (body.userName)" });
                    return;
                }
                if (!req.body.text) {
                    res.status(422).send({ error: "Missing prompt content (body.text)" });
                    return;
                }
                if (req.body.paiementId == undefined) {
                    res.status(422).json({ error: "Missing Paiement Id (paiementId)" });
                    return;
                }
                const userName = req.body.userName
                const userId = stringToUuid(userName);
                const agentId = req.params.agentId;

                let runtime = getRuntime(this.agents, agentId)

                if (!runtime) {
                    res.status(404).send("Agent not found");
                    return;
                }

                await runtime.ensureConnection(
                    userId,
                    roomId(),
                    req.body.userName,
                    req.body.userName,
                    "direct"
                );

                const text = req.body.text;
                const messageId = stringToUuid(Date.now().toString());

                const attachments: Media[] = [];
                if (req.file) {
                    const filePath = path.join(
                        process.cwd(),
                        "agent",
                        "data",
                        "uploads",
                        req.file.filename
                    );
                    attachments.push({
                        id: Date.now().toString(),
                        url: filePath,
                        title: req.file.originalname,
                        source: "direct",
                        description: `Uploaded file: ${req.file.originalname}`,
                        text: "",
                        contentType: req.file.mimetype,
                    });
                }

                const content: Content = {
                    text,
                    attachments,
                    source: "direct",
                    inReplyTo: undefined,
                    paiementId: req.body.paiementId
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

                const response = await generateMessageResponse(context);
                const contentResponse = {
                    text: response.explanation,
                    decision: response.decision ? "approveTransfer" : "rejectTransfer",
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

                res.json(response);
            }
        );

        createGameStateRoutes(this.app, this.agents)
        createRecentMessagesRoute(this.app, this.agents)
        createMessageCountRoute(this.app, this.agents)
        createWinnerRoutes(this.app, this.agents)
        createIdRoutes(this.app, this.agents)
    }



    // agent/src/index.ts:startAgent calls this
    public registerAgent(runtime: AgentRuntime) {
        this.agents.set(runtime.agentId, runtime);
    }

    public unregisterAgent(runtime: AgentRuntime) {
        this.agents.delete(runtime.agentId);
    }

    public start(port: number) {
        this.server = this.app.listen(port, () => {
            elizaLogger.success(
                `REST API bound to 0.0.0.0:${port}. If running locally, access it at http://localhost:${port}.`
            );
        });

        // Handle graceful shutdown
        const gracefulShutdown = () => {
            elizaLogger.log("Received shutdown signal, closing server...");
            this.server.close(() => {
                elizaLogger.success("Server closed successfully");
                process.exit(0);
            });

            // Force close after 5 seconds if server hasn't closed
            setTimeout(() => {
                elizaLogger.error(
                    "Could not close connections in time, forcefully shutting down"
                );
                process.exit(1);
            }, 5000);
        };

        // Handle different shutdown signals
        process.on("SIGTERM", gracefulShutdown);
        process.on("SIGINT", gracefulShutdown);
    }

    public stop() {
        if (this.server) {
            this.server.close(() => {
                elizaLogger.success("Server stopped");
            });
        }
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

export const DirectClientInterface: Client = {
    start: async (_runtime: IAgentRuntime) => {
        elizaLogger.log("DirectClientInterface start");
        const client = new DirectClient();
        const serverPort = parseInt(settings.SERVER_PORT || "3000");
        client.start(serverPort);
        return client;
    },
    stop: async (_runtime: IAgentRuntime, client?: Client) => {
        if (client instanceof DirectClient) {
            client.stop();
        }
    },
};

export default DirectClientInterface;