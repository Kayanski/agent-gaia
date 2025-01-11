import { TGameState } from "@/actions";
import { useEffect, useState } from "react";


export function useTimeRemaining({ gameState }: { gameState: TGameState | undefined }) {

    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    useEffect(() => {
        if (!gameState) return
        if ("inactive" in gameState.timeoutStatus) return;

        // Calculate initial time remaining in seconds
        const now = new Date();
        const initialTimeRemaining = Math.floor(
            (gameState.timeoutStatus.active.endDate.getTime() - now.getTime()) / 1000
        );
        setTimeRemaining(initialTimeRemaining);

        const timerInterval = setInterval(() => {
            setTimeRemaining((prevTime) => {
                if (prevTime <= 0) {
                    clearInterval(timerInterval);
                    return -1;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [gameState]);

    return {
        timeRemaining
    }
}