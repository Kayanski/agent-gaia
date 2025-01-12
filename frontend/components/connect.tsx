"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { WalletModal } from "./wallet";
import Modal from 'react-modal';
import { useAccount, useDisconnect } from "graz";
import { useScreenMediaQuery } from "@/lib/useMediaQuery";
import Image from "next/image";
import { toast } from "react-toastify";

Modal.setAppElement('#body');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};
function shortenBech32Address(address, visibleLengthStart = 2, visibleLengthEnd = 4) {
  const delimiterIndex = address.indexOf('1');
  if (delimiterIndex === -1) {
    throw new Error("Invalid Bech32 address: No delimiter ('1') found.");
  }

  const prefix = address.slice(0, delimiterIndex + 1); // Include the delimiter
  const rest = address.slice(delimiterIndex + 1);

  if (rest.length <= visibleLengthStart + visibleLengthEnd) {
    return address; // No shortening needed if the rest is short.
  }

  const start = rest.slice(0, visibleLengthStart);
  const end = rest.slice(-visibleLengthEnd);
  return `${prefix}${start}...${end}`;
}

export function WalletAddress({ address }: { address: string }) {
  return (<Button variant={"link"} className="text-sm cursor-pointer flex flex-row items-center" onClick={() => {
    navigator.clipboard.writeText(address)
    toast("Address copied")
  }} >
    <Image src="/copy.png" alt="copy" width={15} height={15} style={{ height: "15px" }} />
    {shortenBech32Address(address)}
  </Button>)
}

export function CosmosWallet() {
  const [modalIsOpen, setIsOpen] = useState(false);

  const { disconnect } = useDisconnect();

  function openModal() {
    if (account?.bech32Address) {
      disconnect()
    } else {
      setIsOpen(true);
    }
  }
  function closeModal() {
    setIsOpen(false);
  }

  const { isLargeDevice, isExtraLargeDevice } = useScreenMediaQuery();

  const { data: account } = useAccount();
  return (
    <>
      <div className="flex flex-row lg:flex-col gap-2 items-center">
        <Button onClick={openModal} variant={"full"} color="blue" className="rounded">
          {account?.bech32Address ? "Wallet Connected" : "Connect Wallet"}
        </Button>
        {(isLargeDevice || isExtraLargeDevice) && !!account?.bech32Address && <WalletAddress address={account?.bech32Address} />}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}

        contentLabel="Example Modal"
      >
        <WalletModal closeModal={closeModal} />
      </Modal>

    </>
  );
}


export function ConnectWallet() {


  return (
    <div className="flex items-center gap-2">
      {/* Commenting out solana wallet for now */}
      {/* <SolanaWallet /> */}
      {/* <ConnectButton /> */}
      <CosmosWallet />
    </div>
  );
}

