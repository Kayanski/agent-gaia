import { getGameState, TGameState, TGameStatus } from "./database/getGameState";
import { getAssistantMessageByPaiementId, getAssistantMessagesByPaiementId, getHighestPaiementId, getMessageById, getUserMessageByPaiementId, getUserMessagesByPaiementId } from "./database/getMessageById";
import { DbMessage, getMaxPaiementIdByRole, getMessageCount, getRecentMessages, TMessage, winner } from "./database/getMessages";
import { getMessagesCount } from "./database/getMessagesCount";

export { getGameState, getMessagesCount, }
export type { TGameState, TGameStatus }

export type { TMessage, DbMessage }
export { getHighestPaiementId, getMessageById, getUserMessagesByPaiementId, getUserMessageByPaiementId, getAssistantMessagesByPaiementId, getAssistantMessageByPaiementId }
export { getRecentMessages, getMessageCount, winner, getMaxPaiementIdByRole }