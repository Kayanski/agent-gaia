import { parseElizaMemoryToTMessage, Role } from "@/lib/utils";
import { MAX_MESSAGES_DEFAULT } from "@/actions/blockchain/chains";
import { queryApi } from "./query";
import { MemoryWithWinnerAndUserName } from "@/lib/types";

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


export async function getRecentMessages(userAddress: string | undefined, max: number = MAX_MESSAGES_DEFAULT): Promise<TMessage[]> {
    let params: any = {
        max
    }
    if (userAddress) {
        params.userAddress = userAddress
    }
    const messages: MemoryWithWinnerAndUserName[] = await queryApi("recentMessages", params)

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
    let params: any = {};
    if (userAddress) {
        params.userAddress = userAddress
    }
    const messageCount: number = await queryApi("messageCount", params)

    return messageCount
}