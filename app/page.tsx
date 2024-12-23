import { getGameState } from "@/actions/getGameState";
import { getRecentMessages } from "@/actions/getMessages";
import { Main } from "@/app/home/components/Main";

export const MAX_MESSAGES_DEFAULT = 10;
export const MESSAGE_PAGE = 10;

export default async function Page() {
  const messages = await getRecentMessages(undefined, MAX_MESSAGES_DEFAULT);
  const gameState = await getGameState();
  return <Main messages={messages} gameState={gameState} />;
}
