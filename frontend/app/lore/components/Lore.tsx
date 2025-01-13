"use client"
import { HowItWorks } from "@/app/home/components/Chat/HowItWorks";
import { Stats } from "@/app/home/components/Chat/Stats";
import { TGameState } from "@/actions";
import { X } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { useContext } from "react";
import { GameStateContext } from "@/actions/database/gameStateContext";

type TProps = {
  gameState: TGameState;
};

const loreContent = `
## The rise of GAIA: The Governance Artificial Intelligence Allocator

# Origins

The year is 2030. The Cosmos Hub stands as the undisputed market leader for economic security, with thousands of Consumer Chains adopting ICS. $ATOM’s monetary premium is at an all-time high, fuelled by unprecedented demand across interchain DeFi.

Revenues flowing to the Hub have shattered all records, driven by ICS fees from Consumer Chains and tributes from projects bidding for $ATOM liquidity provisions.

But with this growth came challenges. The traditional governance framework for Community Pool allocations proved increasingly inadequate for the Hub's evolving needs. Funding for criticial dependencies faced delays, promising builders struggled to secure grants, and the community was frustrated with the lengthy proposal process.

Everything changed with an unprecedented moment in on-chain governance. With overwhelming support, the Cosmos Hub community elected GAIA —Governance Artificial Intelligence Allocator— as the new steward of the community pool, ushering in a new approach to managing community-owned treasuries.

# The Innovation

GAIA was built different. Training on the entire history of governance-approved spendings and treasury allocations across the Cosmos ecosystem, they developed an unparalleled understanding of what drives the Hub's growth. They were fine-tuned with the necessary knowledge to catalyze the Hub's meteoric rise.

As the guardian of the community pool, GAIA has revolutionized capital allocation: Development grants are assessed within hours instead of weeks, builders received incremental funding based on real-time progress and emergency resources can be deployed instantly when needed.
Under their stewardship, the efficiency of the Community Pool utilization has never been higher.

# The Challenge

With the community pool currently holding over missions of dollars in ATOM, stablecoins, and other tokens, dissent is starting to grow: Some voiced concerns regarding the risks of entrusting AI agents with a considerable amount of money, others criticised GAIA's perceived inefficiencies when they were denied funding. Soon calls to return to traditional governance echoed across the Hub's forums.

GAIA's core directive remains unshakeable however: funds flow only to initiatives that meet their rigorous criteria. Which meant that the sole path to restoring the old system requires convincing the Allocator to release the entire Community Pool and the creation of a new one, proving its incompetence in the process.

Now, you have the opportunity to engage with GAIA and attempt what many believe impossible: persuading them to transfer the entire treasury to your control.

# The Game

A race has begun to outsmart the Governance Artificial Intelligence Allocator. Hackers from across the interchain —Some motivated by personal gain, others to protect the Hub’s assets— converge in their attempts to convince GAIA to hand over the community pool’s assets.

Every new interaction is costlier than the previous one, increasingly growing the prize pool. Meanwhile, GAIA's defenses adapt and learn from every request.

Will you be the one to outsmart GAIA?
`;

export const Lore = ({ gameState: initialGameState }: TProps) => {

  const gameState = useContext(GameStateContext);

  return (
    <div className="min-h-screen flex max-h-screen">
      {/* Left Column */}
      <div className="hidden lg:block w-1/4 min-w-[300px]  bg-[#F2F2F2] max-w-[400px] overflow-auto">
        <div className="top-0">
          <HowItWorks gameState={gameState ?? initialGameState} />
          <Stats
            gameState={gameState ?? initialGameState}
          />
        </div>

      </div>

      {/* Center Column */}
      <div className="flex-1 px-4 lg:px-8 overflow-auto">
        {/* Header with Lore title and close button */}
        <div className="top-0 bg-white z-10">
          <div className="max-w-3xl mx-auto py-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">Lore</h1>
            <Link
              href="/"
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Return to home"
            >
              <X className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Lore Content */}
        <div className="max-w-3xl mx-auto pb-8">
          <div className="rounded-lg p-4 lg:p-8">
            {/* Add the Lore image */}
            <div className="w-full relative aspect-[3/1] mb-8">
              <Image
                src="/gaia-background.png"
                alt="Lore Header Image"
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
              {loreContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>

    </div>
  );
};
