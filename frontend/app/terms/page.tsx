import { getGameState } from "@/actions";
import { Terms } from "./components/Terms";

export default async function Page() {
  const gameState = await getGameState();

  return <Terms gameState={gameState} />;
}
