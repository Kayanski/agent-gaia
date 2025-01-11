import { getGameState } from "@/actions/";
import { Faq } from "./components/Faq";


export default async function Page() {
  const gameState = await getGameState();

  return <Faq gameState={gameState} />;
}
