import { TGameState, TGameStatus } from "gaia-server";
import { getGameState } from "./database/getGameState";
import { getAssistantMessageByPaiementId, getHighestPaiementId, getMessageById, getUserMessageByPaiementId, } from "./database/getMessageById";
import { DbMessage, getMessageCount, getRecentMessages, TMessage } from "./database/getMessages";
import { getMessagesCount } from "./database/getMessagesCount";
import { winner } from "./database/winner";

export { getGameState, getMessagesCount, }
export type { TGameState, TGameStatus }

export type { TMessage, DbMessage, }
export { getHighestPaiementId, getMessageById, getAssistantMessageByPaiementId, getUserMessageByPaiementId }
export { getRecentMessages, getMessageCount, winner }
export type ApiResult<T> = {
    result: T
}
