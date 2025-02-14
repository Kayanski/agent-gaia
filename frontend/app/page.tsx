import { MAX_MESSAGES_DEFAULT } from "@/actions/blockchain/chains";
import { getGameState } from "@/actions/";
import { getRecentMessages } from "@/actions/";
import { Main } from "@/app/home/components/Main";

export default async function Page() {
  const messages = await getRecentMessages(undefined, MAX_MESSAGES_DEFAULT);
  const gameState = await getGameState();
  return <Main messages={messages} gameState={gameState} />;
}
