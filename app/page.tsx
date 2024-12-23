import { MAX_MESSAGES_DEFAULT } from "@/actions/gaia/constants";
import { getGameState } from "@/actions/getGameState";
import { getRecentMessages } from "@/actions/getMessages";
import { Main } from "@/app/home/components/Main";


export default async function Page() {
  const messages = await getRecentMessages(undefined, MAX_MESSAGES_DEFAULT);
  const gameState = await getGameState();
  return <Main messages={messages} gameState={gameState} />;
}
