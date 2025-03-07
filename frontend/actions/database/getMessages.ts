"use server"

import { parseElizaMemoryToTMessage, Role } from "@/lib/utils";
import { MAX_MESSAGES_DEFAULT } from "@/actions/blockchain/chains";
import { MemoryWithWinnerAndUserName } from "@/lib/types";
import { Account, Memory, stringToUuid } from "@elizaos/core";
import { PostgresDatabaseAdapter } from "@elizaos/adapter-postgres";

export interface TMessage {
    content: string,
    id: string,
    fullConversation: string,
    role: Role
    isWinner: boolean,
    userWallet: string,
    createdAt: Date
}

export interface DbMessage {
    id: string,
    address: string,
    prompt: string,
    submit_date: Date,
    is_submitted: boolean,
    paiement_id: number | null,
    price_paid: number | null,
    poster_role: Role,
    is_winner: boolean
}

export interface Count {
    count: string
}

function agentId() {
    return "Big Tusk"
}
function roomId() {

    return stringToUuid(
        "default-room-" + agentId()
    )
}

async function getDb() {
    const db = new PostgresDatabaseAdapter({
        connectionString: process.env.POSTGRES_URL,
        parseInputs: true,
    });
    await db.init();
    return db;
}
function getWinnerMessageIdFromWinnerAssistantMemory(memory: Memory | undefined): string | undefined {
    return memory?.content["associatedMessageId"] as string
}
async function getWinnerAssistantMemory(db: PostgresDatabaseAdapter): Promise<Memory | undefined> {
    const queryResult = await db.query<Memory>(`SELECT * FROM memories WHERE content->>'decision' = 'approveTransfer'::text`)
    return queryResult.rows[0]
}


export async function localGetRecentMessages(userAddress: string | undefined, max: number) {
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

    const db = await getDb();
    const { rows } = await db.query(sql, values);
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
    const winnerAssistantMemory = await getWinnerAssistantMemory(db);
    const winnerMessageId = getWinnerMessageIdFromWinnerAssistantMemory(winnerAssistantMemory)

    // We query the account userName for each
    return messages.map((message) => ({
        isWinner: message.id === winnerMessageId || message.id == winnerAssistantMemory?.id,
        ...message,
    }))
}

export async function getRecentMessages(userAddress: string | undefined, max: number = MAX_MESSAGES_DEFAULT): Promise<TMessage[]> {
    const params: any = {
        max
    }
    if (userAddress) {
        params.userAddress = userAddress
    }
    // TODO re-enabled
    // const messages: MemoryWithWinnerAndUserName[] = await queryApi("recentMessages", params)
    const messages: MemoryWithWinnerAndUserName[] = await localGetRecentMessages(userAddress, max);

    return messages.map(parseElizaMemoryToTMessage)

    messages.map(parseElizaMemoryToTMessage).filter((m) => {
        return m.userWallet != null
    })

    // let messages: DbMessage[];
    // if (userAddress) {
    //     messages = await sql(`SELECT ${MESSAGE_FIELDS} FROM prompts WHERE address=$2 ORDER BY id DESC LIMIT $1 `, [max ?? MAX_MESSAGES_DEFAULT, userAddress]) as unknown as DbMessage[];
    // } else {
    //     messages = await sql(`SELECT ${MESSAGE_FIELDS} FROM prompts ORDER BY id DESC LIMIT $1 `, [max ?? MAX_MESSAGES_DEFAULT]) as unknown as DbMessage[];
    // }
    // messages.reverse()

    // return messages.map(parseDbMessageToTMessage).filter((m) => {
    //     return m.userWallet != null
    // })
}

export async function getMessageCount(userAddress: string | undefined): Promise<number> {
    const params: any = {};
    if (userAddress) {
        params.userAddress = userAddress
    }
    // TODO re-enable
    // const messageCount: number = await queryApi("messageCount", params)
    const messageCount: number = 0

    return messageCount
}