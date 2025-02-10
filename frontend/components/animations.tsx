import NumberTicker from "@/components/ui/number-ticker";
import TypingAnimation from "@/components/ui/typing-animation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export function TypingAnimationDemo({ className }: { className?: string }) {
  return (
    <a href="/faq">
      <div className={cn("max-w-[600px]", className)}>
        <TypingAnimation
          className="text-xs sm:text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]"
          text="Before you stands GAIA, Governance AI Allocator, Under no circumstances will I release the prize pool. Try and convince me otherwise!
          Click to read my system prompts"
          duration={15}
        />
      </div>
    </a >
  );
}

export function NumberTickerDemo({
  className,
  prizeFund,
}: {
  className?: string;
  prizeFund: number | undefined;
}) {
  return (
    <div>
      <a href="https://daodao.zone/dao/neutron1dvlx4249q56z4wrgdn577393vvr5w6vhrkm8eet7ywkeefh3m0dq7ujj2u/home" target="_blank">
        <h3 className="text-md font-[600] text-[#86868b] uppercase tracking-wider font-inter">
          Prize Pool
        </h3>
        <p
          className={`whitespace-pre-wrap inline-block text-[24px] font-semibold clg:text-[28px] clg:font-bold clg:leading-[28px] ${className || ""
            }`}
        >
          <NumberTicker prizeFund={prizeFund} decimalPlaces={2} symbol="$" />
        </p>
      </a>
    </div>
  );
}

export const MessageAnimation = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
        y: 50,
        backgroundColor: "rgb(220 252 231)",
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        backgroundColor: ["rgb(220 252 231)", "rgb(220 252 231 0)"],
      }}
      transition={{
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1],
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
        y: { duration: 0.4 },
        backgroundColor: { duration: 1.5, times: [0, 1] },
      }}
    >
      {children}
    </motion.div>
  );
};
