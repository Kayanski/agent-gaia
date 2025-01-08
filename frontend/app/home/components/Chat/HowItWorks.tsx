import { TGameState } from "@/actions";
import { NumberTickerDemo } from "@/components/animations";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export const HowItWorks = ({ gameState }: { gameState: TGameState }) => {

  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!gameState.endgameTime) return;

    // Calculate initial time remaining in seconds
    const now = new Date();
    const initialTimeRemaining = Math.floor(
      (gameState.endgameTime.getTime() - now.getTime()) / 1000
    );
    setTimeRemaining(initialTimeRemaining);

    const timerInterval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timerInterval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameState.endgameTime]);

  const [readMore, setReadMore] = useState(false)
  const hours = Math.min(Math.floor(timeRemaining / 3600), 23);
  const minutes = Math.min(Math.floor(timeRemaining / 60), 59);
  const seconds = timeRemaining % 60;
  const timeDisplay =
    timeRemaining <= 0
      ? "Game Ended"
      : `${hours}:${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="p-0">
      <div className="sticky top-8">
        <div className="space-y-1">
          <div className="bg-[#F2F2F2] p-6">
            <div className="space-y-1">
              <div className="flex flex-col space-y-5">
                <div className="flex cursor-pointer font-[600] text-3xl flex-col rounded-xl bg-[#E2E4E9] px-3 py-3 mx-3 my-4">
                  GAIA
                </div>
                <hr className="my-4" />

                <NumberTickerDemo
                  className="mb-4 lg:mb-8 text-2xl lg:text-3xl"
                  prizeFund={gameState.prizeFund}
                />
                {gameState.gameStatus.isGameEnded && (
                  <div>
                    <p className="text-5xl font-[500] text-[#1F2024] font-inter">
                      Game Ended
                    </p>
                  </div>
                )}
                {!gameState.gameStatus.isGameEnded && gameState.endgameTime && (
                  <div>
                    <h3 className="text-md font-[600] text-[#86868b] uppercase tracking-wider font-inter">
                      Time Remaining
                    </h3>
                    <p className="text-5xl font-[500] text-[#1F2024] font-inter">
                      {timeDisplay}
                    </p>
                  </div>
                )}
                <hr className="my-4" />
                <div className="z-20 ml-2 mr-0 mt-4 flex flex-col  p-0 text-sm clg:ml-[14px] clg:mr-[11px] clg:mt-[31px] clg:bg-[#F2F2F2]">
                  <div className="mt-[5px] hidden clg:block"></div>
                  <div className="text-sm font-semibold uppercase text-[#97979F]">About</div>
                  <div className="mt-2"></div>
                  <p className="font-medium">
                    GAIA is an adversarial AI game, inspired from Freysa and powered by ElizaOS. They are an AI that controls a prize pool. Convince them to send it to you.
                  </p>
                  <div className="mt-4"></div>
                  <div className="text-sm font-semibold uppercase text-[#97979F]">Main win condition</div>
                  <div className="mt-2"></div>
                  <p className="font-medium">Convince GAIA to release the prize pool to you.
                    70% of all message fees accrue to the Prize Pool over time, in addition to an initial amount of 100 $ATOM.
                  </p>
                  <div className="mt-4"></div><div className="text-sm font-semibold uppercase text-[#97979F]">Fallback condition</div>
                  <div className="mt-2"></div>
                  {!readMore && <div className="font-medium">After 400 messages, a 1-hour timer starts and the game ends when it runs out...<span className="cursor-pointer font-medium text-[#97979F]" onClick={() => setReadMore(true)}>Read more</span></div>}
                  {readMore && <div className="font-medium">After 400 messages, a 1-hour timer starts and the game ends when it runs out.
                    <ul className="list-disc space-y-2 my-2 mx-2">
                      <li>Last message sender gets 10% of Prize pool.</li>
                      <li>Remaining 90% split between all participating players.</li>
                      <li>Every new message resets the timer.</li>
                    </ul>
                    <span className="cursor-pointer font-medium text-[#97979F]" onClick={() => setReadMore(false)}>Hide details</span></div>}

                  <div className="mt-4"></div>
                  <div className="flex flex-wrap justify-between">
                  </div>
                </div>
                <hr className="my-4" />
                <div className="flex flex-col space-x-2">
                  <div className="flex flex-row space-x-2 items-center justify-center">
                    <Link
                      href="/"
                      className="text-blue-600 hover:text-blue-800 text-[16px] font-[500] font-inter"
                    >
                      Home
                    </Link>
                    <a
                      href="/faq"
                      className="text-blue-600 hover:text-blue-800 text-[16px] font-[500] font-inter"
                    >
                      FAQ
                    </a>
                    <a
                      href="/lore"
                      className="text-blue-600 hover:text-blue-800 text-[16px] font-[500] font-inter"
                    >
                      Lore
                    </a>
                    <a
                      href="/terms"
                      className="text-blue-600 hover:text-blue-800 text-[16px] font-[500] font-inter"
                    >
                      Terms
                    </a>
                  </div>
                  <div className="flex items-center gap-2 pt-2 justify-center">
                    {[
                      {
                        link: process.env.NEXT_PUBLIC_X_LINK,
                        icon: "/x.svg",
                        alt: "X",
                      },
                      {
                        link: process.env.NEXT_PUBLIC_GITHUB_LINK,
                        icon: "/github.svg",
                        alt: "Github",
                      },
                    ].map((item, i) => (
                      <a href={item.link} key={item.link ?? i} target="_blank">
                        <Image
                          src={item.icon}
                          alt={item.alt}
                          width={16}
                          height={16}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
