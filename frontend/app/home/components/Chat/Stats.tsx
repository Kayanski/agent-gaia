import { TGameState } from "@/actions";
import { ACTIVE_NETWORK } from "@/actions/blockchain/chains";
import { useAllTokenPrices } from "@/actions/getCurrentPrice";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface StatsProps {
  gameState: TGameState | undefined
  className?: string;
}
const DECIMAL_PLACES = 2;

export const Stats = ({ gameState,
  className,
}: StatsProps) => {

  const { data: tokenPrices } = useAllTokenPrices();

  const priceText = useMemo(() => {
    if (!gameState) {
      return ""
    }

    const coinInfo = ACTIVE_NETWORK.chain.currencies.find((c) => c.coinMinimalDenom == gameState.messagePrice.denom);

    const priceText = Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(parseInt(gameState.messagePrice.amount) / Math.pow(10, coinInfo?.coinDecimals ?? 0))

    const tokenPrice = tokenPrices?.find((price) => price.denom == gameState.messagePrice.denom)
    const value = tokenPrice ? tokenPrice.price * parseInt(gameState.messagePrice.amount) / Math.pow(10, 6) : undefined;
    const tokenPriceText = value ? ` ($${Intl.NumberFormat("en-US", {
      minimumFractionDigits: DECIMAL_PLACES,
      maximumFractionDigits: DECIMAL_PLACES,
    }).format(Number(value.toFixed(DECIMAL_PLACES)))})` : "";

    return `${priceText} ${coinInfo?.coinDenom.toUpperCase()}${tokenPriceText} `
  }, [gameState, tokenPrices])


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
