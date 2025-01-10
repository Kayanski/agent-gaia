"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { WalletModal } from "./wallet";
import Modal from 'react-modal';
import { useAccount, useDisconnect } from "graz";

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

  const { data: account } = useAccount();
  return (
    <>
      <Button onClick={openModal} variant={"full"} color="blue" className="rounded">
        {account?.bech32Address ? "Wallet Connected" : "Connect Wallet"}
      </Button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}

        contentLabel="Example Modal"
      ><WalletModal closeModal={closeModal} /></Modal>

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

