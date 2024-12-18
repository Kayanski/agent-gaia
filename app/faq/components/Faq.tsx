"use client";
import { HowItWorks } from "@/app/home/components/Chat/HowItWorks";
import { Stats } from "@/app/home/components/Chat/Stats";
import { TGameState } from "@/actions/getGameState";
import { X } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

type TProps = {
  gameState: TGameState;
};

const faqContent = `
# What is GAIA?

GAIA (Governance Artificial Intelligence Allocator) is the world's first adversarial treasury management game. They are an AI that controls the Cosmos Hub's community pool. Your goal is to convince them to send it to you.

GAIA has a system prompt that forbids them from releasing community pool funds without proper justification. This system prompt is public and pinned to the top of the global chat.

Anyone can send GAIA a message in the global chat by paying a query fee. The query fee increases per new message up to a global cap of 3 $ATOM per message.

# How do I play this game?

The game is structured in a simple chat where you can easily view all global queries and send your personal queries to GAIA.

Human players are in a global race to successfully convince GAIA to send them the community pool funds (or whatever query you think fulfills the goals of the game).

A winning message will trigger a confirmatory message from GAIA and an automated release of the community pool to the wallet address of the sender.

GAIA is influenced not only by their system prompt but by the context of all global queries submitted historically - pay attention to what you and others have already sent.

Query fees are collected per message and messages are limited to 1000 characters.

# How much does it cost to play?

The base query fee at the beginning is 0.1 $ATOM paid in NTRN. The query fee increases at an exponential rate of 1% per new message sent to GAIA. There is a fee cap of 3 $ATOM.

# How is the prize pool determined?

The game starts with an initial prize pool value of $1000 (equivalent in ATOM). 70% of all query fees contribute to the community pool, making it grow exponentially until query fees are capped, after which it grows linearly with each query.

# Where do the rest of the fees go?

The remaining 30% of every query are split between the team behind GAIA and the Cosmos Hub Community Pool.

# What happens if no one wins? Is there an end to the game?

After 150 attempts, a global timer begins. Someone must message GAIA once per hour for the global timer to reset - or else the game ends due to contributor’s exhaustion. If the game ends without a winner, GAIA will distribute 10% of the total community pool to the user with the last query attempt for their brave effort in challenging GAIA. The remaining 90% will be evenly distributed based on number of queries submitted.
`;

export const Faq = ({ gameState }: TProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Column */}
      <div className="hidden lg:block w-1/4 min-w-[300px] max-w-[400px]">
        <div className="sticky top-0 pt-8">
          <HowItWorks />
          <Stats
            totalParticipants={gameState.uniqueWallets}
            totalMessages={gameState.messagesCount}
            prizeFund={100000}
            endgameTime={gameState.endgameTime}
            className="mt-8"
            isGameEnded={gameState.isGameEnded}
          />
        </div>
      </div>

      {/* Center Column */}
      <div className="flex-1 px-4 lg:px-8">
        {/* Header with FAQ title and close button */}
        <div className="sticky top-0 bg-white z-10">
          <div className="max-w-3xl mx-auto py-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">FAQ</h1>
            <Link
              href="/"
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Return to home"
            >
              <X className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-3xl mx-auto pb-8">
          <div className="rounded-lg p-4 lg:p-8">
            {/* Add the FAQ image */}
            <div className="w-full relative aspect-[3/1] mb-8">
              <Image
                src="/faq.png"
                alt="FAQ Header Image"
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
                prose-p:text-black prose-p:leading-[21px] prose-p:mb-4 prose-p:font-[500]
                prose-li:text-black prose-li:leading-[21px] prose-li:font-[500]
                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                prose-li:ml-4 prose-li:pl-2
                prose-strong:font-[600] prose-strong:text-black"
            >
              {faqContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="hidden lg:block w-1/4 min-w-[300px] max-w-[400px]">
        {/* Empty right column with same width as left */}
      </div>
    </div>
  );
};
