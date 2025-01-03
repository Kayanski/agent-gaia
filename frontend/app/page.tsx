import { MAX_MESSAGES_DEFAULT } from "@/actions/gaia/constants";
import { getGameState } from "@/actions/";
import { getRecentMessages } from "@/actions/";
import { Main } from "@/app/home/components/Main";
export const dynamic = 'force-dynamic';


export default async function Page() {
  const messages = await getRecentMessages(undefined, MAX_MESSAGES_DEFAULT);
  const gameState = await getGameState();
  return <Main messages={messages} gameState={gameState} />;
}
