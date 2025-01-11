
import { getGameState } from "@/actions/";
import { Lore } from "./components/Lore";

export default async function Page() {
  const gameState = await getGameState();

  return <Lore gameState={gameState} />;
}