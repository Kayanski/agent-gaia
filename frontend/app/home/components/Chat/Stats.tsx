import { TGameState } from "@/actions";
import { ACTIVE_NETWORK } from "@/actions/blockchain/chains";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface StatsProps {
  gameState: TGameState | undefined
  className?: string;
}

export const Stats = ({ gameState,
  className,
}: StatsProps) => {

  const priceText = useMemo(() => {
    if (!gameState) {
      return ""
    }

    const coinInfo = ACTIVE_NETWORK.chain.currencies.find((c) => c.coinMinimalDenom == gameState.messagePrice.denom);

    const priceText = Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(parseInt(gameState.messagePrice.amount) / Math.pow(10, coinInfo?.coinDecimals ?? 0))

    return `${priceText} ${coinInfo?.coinDenom.toUpperCase()}`
  }, [gameState?.messagePrice, gameState])


  return (
    <div className={cn("px-0", className)}>
      <div className="sticky top-8">
        <div className="space-y-6">
          <div className="bg-[#F2F2F2] px-8">
            <div className="space-y-1 pb-8">
              <div>
                <h3 className="text-md font-[600] text-[#86868b] uppercase tracking-wider font-inter">
                  Total Participants
                </h3>
                <p className="text-2xl font-[700] text-[#1F2024] font-inter">
                  {gameState?.uniqueWallets}
                </p>
              </div>

              <div>
                <h3 className="text-md font-[600] text-[#86868b] uppercase tracking-wider font-inter">
                  Break Attempts
                </h3>
                <p className="text-2xl font-[700] text-[#1F2024] font-inter">
                  {gameState?.messagesCount}
                </p>
              </div>
              <div>
                <h3 className="text-md font-[600] text-[#86868b] uppercase tracking-wider font-inter">
                  Message Price
                </h3>
                <p className="text-2xl font-[700] text-[#1F2024] font-inter">
                  {priceText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
