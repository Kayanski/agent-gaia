import { getGameState } from "@/actions/";
import { Faq } from "./components/Faq";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const gameState = await getGameState();

  return <Faq gameState={gameState} />;
}
