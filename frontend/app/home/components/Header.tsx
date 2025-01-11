import { ConnectWallet } from '@/components/connect'
import { Menu, X } from 'lucide-react'
import { Stats } from './Chat/Stats'
import { HowItWorks } from './Chat/HowItWorks'
import { TGameState } from '@/actions'
import { useState } from 'react'

const MobileMenu = ({ gameState, isOpen, onClose }: {
  gameState: TGameState;
  prizeFund: number;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed z-50 inset-0 bg-black/50 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />
      {/* Sliding menu */}
      <div className={`fixed z-50 left-0 top-0 h-full w-80 bg-[#F2F2F2] transform transition-transform duration-300 ease-in-out overflow-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <X className="w-6 h-6 m-3 cursor-pointer ml-auto" onClick={onClose} />
            </div>
            <HowItWorks gameState={gameState} />
            <Stats
              gameState={gameState}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export const Header = ({ gameState, prizeFund }: { gameState: TGameState; prizeFund: number }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <div className="flex items-center">
        <div
          className="flex items-center gap-4 mr-auto cursor-pointer lg:hidden absolute top-0 left-0 m-3"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu />
        </div>
        <div className="flex items-center gap-4 ml-auto  absolute top-0 right-0 m-3">
          <ConnectWallet />
        </div>
      </div>

      <MobileMenu
        gameState={gameState}
        prizeFund={prizeFund}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  )
}
