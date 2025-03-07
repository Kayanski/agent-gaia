"use server"


import { AgentRuntime, CacheManager, CacheStore, Character, Client, DbCacheAdapter, elizaLogger, IAgentRuntime, ICacheManager, IDatabaseAdapter, IDatabaseCacheAdapter, ModelProviderName, settings, validateCharacterConfig } from "@elizaos/core";
import { PostgresDatabaseAdapter } from "@elizaos/adapter-postgres";
import path from "path";
import fs from "fs";

const db = new PostgresDatabaseAdapter({
    connectionString: process.env.POSTGRES_URL,
    parseInputs: true,
});

export async function initializeDatabase() {
    if (process.env.POSTGRES_URL) {
        // elizaLogger.info("Initializing PostgreSQL connection...");


        // Test the connection
        await db.init()
            .then(() => {
                // elizaLogger.success(
                //     "Successfully connected to PostgreSQL database"
                // );
            })
            .catch((error) => {
                elizaLogger.error("Failed to connect to PostgreSQL:", error);
            });

        return db;
    } else {
        throw "Couldn't connect to postgres, no POSTGRES_URL env var set"
    }
}

export async function getTokenForProvider(
    provider: ModelProviderName,
    character: Character
): Promise<string> {
    switch (provider) {
        // no key needed for llama_local or gaianet
        case ModelProviderName.LLAMALOCAL:
            return "";
        case ModelProviderName.OLLAMA:
            return "";
        case ModelProviderName.GAIANET:
            return "";
        case ModelProviderName.OPENAI:
            return (
                character.settings?.secrets?.OPENAI_API_KEY ||
                settings.OPENAI_API_KEY || ""
            );
        case ModelProviderName.ETERNALAI:
            return (
                character.settings?.secrets?.ETERNALAI_API_KEY ||
                settings.ETERNALAI_API_KEY || ""
            );
        case ModelProviderName.LLAMACLOUD:
        case ModelProviderName.TOGETHER:
            return (
                character.settings?.secrets?.LLAMACLOUD_API_KEY ||
                settings.LLAMACLOUD_API_KEY ||
                character.settings?.secrets?.TOGETHER_API_KEY ||
                settings.TOGETHER_API_KEY ||
                character.settings?.secrets?.XAI_API_KEY ||
                settings.XAI_API_KEY ||
                character.settings?.secrets?.OPENAI_API_KEY ||
                settings.OPENAI_API_KEY || ""
            );
        case ModelProviderName.CLAUDE_VERTEX:
        case ModelProviderName.ANTHROPIC:
            return (
                character.settings?.secrets?.ANTHROPIC_API_KEY ||
                character.settings?.secrets?.CLAUDE_API_KEY ||
                settings.ANTHROPIC_API_KEY ||
                settings.CLAUDE_API_KEY || ""
            );
        case ModelProviderName.REDPILL:
            return (
                character.settings?.secrets?.REDPILL_API_KEY ||
                settings.REDPILL_API_KEY || ""
            );
        case ModelProviderName.OPENROUTER:
            return (
                character.settings?.secrets?.OPENROUTER ||
                settings.OPENROUTER_API_KEY || ""
            );
        case ModelProviderName.GROK:
            return (
                character.settings?.secrets?.GROK_API_KEY ||
                settings.GROK_API_KEY || ""
            );
        case ModelProviderName.HEURIST:
            return (
                character.settings?.secrets?.HEURIST_API_KEY ||
                settings.HEURIST_API_KEY || ""
            );
        case ModelProviderName.GROQ:
            return (
                character.settings?.secrets?.GROQ_API_KEY ||
                settings.GROQ_API_KEY || ""
            );
        case ModelProviderName.GALADRIEL:
            return (
                character.settings?.secrets?.GALADRIEL_API_KEY ||
                settings.GALADRIEL_API_KEY || ""
            );
        case ModelProviderName.FAL:
            return (
                character.settings?.secrets?.FAL_API_KEY || settings.FAL_API_KEY || ""
            );
        case ModelProviderName.ALI_BAILIAN:
            return (
                character.settings?.secrets?.ALI_BAILIAN_API_KEY ||
                settings.ALI_BAILIAN_API_KEY || ""
            );
        case ModelProviderName.VOLENGINE:
            return (
                character.settings?.secrets?.VOLENGINE_API_KEY ||
                settings.VOLENGINE_API_KEY || ""
            );
        case ModelProviderName.NANOGPT:
            return (
                character.settings?.secrets?.NANOGPT_API_KEY ||
                settings.NANOGPT_API_KEY || ""
            );
        case ModelProviderName.HYPERBOLIC:
            return (
                character.settings?.secrets?.HYPERBOLIC_API_KEY ||
                settings.HYPERBOLIC_API_KEY || ""
            );
        case ModelProviderName.VENICE:
            return (
                character.settings?.secrets?.VENICE_API_KEY ||
                settings.VENICE_API_KEY || ""
            );
        case ModelProviderName.AKASH_CHAT_API:
            return (
                character.settings?.secrets?.AKASH_CHAT_API_KEY ||
                settings.AKASH_CHAT_API_KEY || ""
            );
        case ModelProviderName.GOOGLE:
            return (
                character.settings?.secrets?.GOOGLE_GENERATIVE_AI_API_KEY ||
                settings.GOOGLE_GENERATIVE_AI_API_KEY || ""
            );
        default:
            const errorMessage = `Failed to get token - unsupported model provider: ${provider}`;
            elizaLogger.error(errorMessage);
            throw new Error(errorMessage);
    }
}

// also adds plugins from character file into the runtime
export async function initializeClients(
    character: Character,
    runtime: IAgentRuntime
) {
    // each client can only register once
    // and if we want two we can explicitly support it
    const clients: Record<string, any> = {};
    const clientTypes: string[] =
        character.clients?.map((str) => str.toLowerCase()) || [];
    elizaLogger.log("initializeClients", clientTypes, "for", character.name);

    elizaLogger.log("client keys", Object.keys(clients));


    function determineClientType(client: Client): string {
        // Check if client has a direct type identifier
        if ("type" in client) {
            return (client as any).type;
        }

        // Check constructor name
        const constructorName = client.constructor?.name;
        if (constructorName && !constructorName.includes("Object")) {
            return constructorName.toLowerCase().replace("client", "");
        }

        // Fallback: Generate a unique identifier
        return `client_${Date.now()}`;
    }

    if (character.plugins?.length > 0) {
        for (const plugin of character.plugins) {
            if (plugin.clients) {
                for (const client of plugin.clients) {
                    const startedClient = await client.start(runtime);
                    const clientType = determineClientType(client);
                    elizaLogger.debug(
                        `Initializing client of type: ${clientType}`
                    );
                    clients[clientType] = startedClient;
                }
            }
        }
    }

    return clients;
}


function initializeDbCache(character: Character, db: IDatabaseCacheAdapter) {
    if (!character.id) {
        throw "No id for the character !"
    }
    const cache = new CacheManager(new DbCacheAdapter(db, character.id));
    return cache;
}

export async function initializeCache(
    cacheStore: string,
    character: Character,
    baseDir?: string,
    db?: IDatabaseCacheAdapter
) {
    switch (cacheStore) {
        case CacheStore.DATABASE:
            if (db) {
                // elizaLogger.info("Using Database Cache...");
                return initializeDbCache(character, db);
            } else {
                throw new Error(
                    "Database adapter is not provided for CacheStore.Database."
                );
            }
        default:
            throw new Error(
                `Invalid cache store: ${cacheStore} or required configuration missing.`
            );
    }
}

export async function createAgent(
    character: Character,
    db: IDatabaseAdapter,
    cache: ICacheManager,
    token: string
): Promise<AgentRuntime> {
    return new AgentRuntime({
        databaseAdapter: db,
        token,
        modelProvider: character.modelProvider,
        evaluators: [],
        character,
        // character.plugins are handled when clients are added
        plugins: [
        ].filter(Boolean),
        providers: [],
        actions: [],
        services: [],
        managers: [],
        cacheManager: cache,
        fetch: logFetch,
    });
}

const logFetch = async (url: string, options: any) => {
    elizaLogger.debug(`Fetching ${url}`);
    // Disabled to avoid disclosure of sensitive information such as API keys
    // elizaLogger.debug(JSON.stringify(options, null, 2));
    return fetch(url, options);
};



export async function loadCharacters(
    charactersArg: string
): Promise<Character[]> {
    const characterPaths = charactersArg
        ?.split(",")
        .map((filePath) => filePath.trim());
    const loadedCharacters: Character[] = [];

    if (characterPaths?.length > 0) {
        for (const characterPath of characterPaths) {

            let content: string | null = null;
            let resolvedPath = "";

            // Try different path resolutions in order
            console.log()
            const pathsToTry = [
                characterPath, // exact path as specified
                path.resolve(process.cwd(), characterPath), // relative to cwd
                path.resolve(process.cwd(), "agent", characterPath), // Add this
                path.resolve(process.cwd(), "public", characterPath), // Add this
                path.resolve(__dirname, characterPath), // relative to current script
                path.resolve(
                    __dirname,
                    "characters",
                    path.basename(characterPath)
                ), // relative to agent/characters
                path.resolve(
                    __dirname,
                    "../characters",
                    path.basename(characterPath)
                ), // relative to characters dir from agent
                path.resolve(
                    __dirname,
                    "../../characters",
                    path.basename(characterPath)
                ), // relative to project root characters dir
            ];

            // elizaLogger.info(
            //     "Trying paths:",
            //     pathsToTry.map((p) => ({
            //         path: p,
            //         exists: fs.existsSync(p),
            //     }))
            // );

            for (const tryPath of pathsToTry) {
                content = tryLoadFile(tryPath);
                if (content !== null) {
                    resolvedPath = tryPath;
                    break;
                }
            }

            if (content === null) {
                throw `Error loading character from ${characterPath}: File not found in any of the expected locations (tried ${JSON.stringify(pathsToTry)})`
            }

            try {
                const character = JSON.parse(content);
                validateCharacterConfig(character);

                // .id isn't really valid
                const characterId = character.id || character.name;
                const characterPrefix = `CHARACTER.${characterId.toUpperCase().replace(/ /g, "_")}.`;

                const characterSettings = Object.entries(process.env)
                    .filter(([key]) => key.startsWith(characterPrefix))
                    .reduce((settings, [key, value]) => {
                        const settingKey = key.slice(characterPrefix.length);
                        return { ...settings, [settingKey]: value };
                    }, {});

                if (Object.keys(characterSettings).length > 0) {
                    character.settings = character.settings || {};
                    character.settings.secrets = {
                        ...characterSettings,
                        ...character.settings.secrets,
                    };
                }

                // Handle plugins
                // if (isAllStrings(character.plugins)) {
                //     elizaLogger.info("Plugins are: ", character.plugins);
                //     const importedPlugins = await Promise.all(
                //         character.plugins.map(async (plugin) => {
                //             const importedPlugin = await import(plugin);
                //             return importedPlugin.default;
                //         })
                //     );
                //     character.plugins = importedPlugins;
                // }

                loadedCharacters.push(character);
                // elizaLogger.info(
                //     `Successfully loaded character from: ${resolvedPath}`
                // );
            } catch (e) {
                throw `Error parsing character from ${resolvedPath}: ${e}`;
            }
        }
    }

    if (loadedCharacters.length === 0) {
        throw "No characters found"
    }

    return loadedCharacters;
}


function tryLoadFile(filePath: string): string | null {
    try {
        return fs.readFileSync(filePath, "utf8");
    } catch (e) {
        elizaLogger.debug(`Error loading file at ${e}`)
        return null;
    }
}
