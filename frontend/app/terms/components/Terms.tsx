"use client";
import { HowItWorks } from "@/app/home/components/Chat/HowItWorks";
import { Stats } from "@/app/home/components/Chat/Stats";
import { TGameState } from "@/actions";
import { X } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { useGameState } from "@/actions/database/getGameState";

type TProps = {
  gameState: TGameState;
};

const termsContent = `
### **1. Acceptance of Terms**

- By participating in this adversarial game with GAIA, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use or participate in the game.

### **2. Game Participation**

- You must be of legal age in your jurisdiction to participate.
- You must have a Neutron-compatible wallet, GAIA’s front-end supports both [Keplr](https://www.keplr.app/) and [Leap](https://www.leapwallet.io/#download) wallets.
- You bear the costs of all transaction fees associated with your participation.
- Message content must not violate any laws or contain harmful content or threats to yourself or others.

### **3. Payment and Fees**

- All message fees are non-refundable.
- Fees must be paid in ATOM on Neutron.
- Message fees increase at a rate of 1% per message.
- Maximum message fee is capped at 3 ATOM per message.

### **4. Prize Pool**

- The initial prize pool starts at 100 $ATOM.
- 70% of all message fees contribute to the prize pool
- The remaining fees are split between the team ( 20%) and the Hub’s Community Pool ( 10%)
- Prize distribution in case of no winner:
    - 10% to the last participant.
    - 90% distributed proportionally among all participants based on number of messages.

### **5. Game Rules**

- Messages are limited to 1000 characters.
- After 400 attempts, the timer mechanism activates.
- Once the timer is activated, one message per hour is required to keep the game active.

### **6. Disclaimers**

- Your access to and interactions with GAIA through this interface is entirely at your own risk and could lead to losses. You take full responsibility for your use of the interface, and acknowledge that you use it on the basis of your own enquiry, without solicitation or inducement by Contributors.
- The game operates on blockchain technology and is subject to network conditions. GAIA’s contracts are not audited and are publicly available on [GitHub](https://github.com/Kayanski/gaia-agent/).
- We are not responsible for:
    - Wallet connection issues.
    - Network delays or failures.
    - Lost or failed transactions.
    - External wallet or blockchain-related issues.

### **7. Intellectual Property**

- All game content, including GAIA’s responses, are protected by intellectual property rights.
- Users retain rights to their individual queries.
- Public queries may be viewed by all participants.

### **8. Modifications**

- We reserve the right to modify these terms at any time.
- Continued participation after changes constitutes acceptance of modified terms.
- Major changes will be announced through official channels on Telegram and X.

### **9. Termination**

- We reserve the right to terminate access for violations of these terms.
- Game may end according to specified conditions in the rules.
- Force majeure events may affect game operation.

### **10. Governing Law**

- These terms are governed by applicable laws.
- Any disputes will be resolved in the appropriate jurisdiction.
- Smart contract code is public and governs technical operations.

### **11. Contact**

- For questions about these terms, please contact us through official channels on Telegram and X.
`;

export const Terms = ({ gameState: initialGameState }: TProps) => {
  const { data: gameState } = useGameState();
  return (
    <div className="min-h-screen flex max-h-screen">
      {/* Left Column */}
      <div className="hidden lg:block w-1/4 min-w-[300px] bg-[#F2F2F2]  max-w-[400px] overflow-auto">
        <div className="">
          <HowItWorks gameState={gameState ?? initialGameState} />
          <Stats
            gameState={gameState ?? initialGameState}
          />
        </div>
      </div>

      {/* Center Column */}
      <div className="flex-1 px-4 lg:px-8 overflow-auto">
        {/* Header with Terms title and close button */}
        <div className="bg-white z-10">
          <div className="max-w-3xl mx-auto py-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">Terms & Conditions</h1>
            <Link
              href="/"
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Return to home"
            >
              <X className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Terms Content */}
        <div className="max-w-3xl mx-auto pb-8">
          <div className="rounded-lg p-4 lg:p-8">
            {/* Add the Terms image */}
            <div className="w-full relative aspect-[3/1] mb-8">
              <Image
                src="/gaia-background.png"
                alt="Terms Header Image"
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>

            <ReactMarkdown
              className="prose prose-slate max-w-none
                prose-headings:mb-4 prose-headings:text-black
                prose-h1:text-3xl prose-h1:font-[700] prose-h1:mt-8 prose-h1:mb-6 prose-h1:text-black
                prose-h2:text-2xl prose-h2:font-[700] prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-black
                prose-h3:text-xl prose-h3:font-[600] prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-black
                prose-p:text-black prose-p:leading-[21px] prose-p:mb-4 prose-p:font-[500]
                prose-li:text-black prose-li:leading-[21px] prose-li:font-[500]
                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                prose-li:ml-4 prose-li:pl-2
                prose-strong:font-[600] prose-strong:text-black"
            >
              {termsContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>

    </div>
  );
};
