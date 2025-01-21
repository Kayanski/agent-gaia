"use client"
import CapsuleClient, { Environment, OAuthMethod } from "@usecapsule/react-sdk";
import dynamic from "next/dynamic";
import React from "react";

const CapsuleModal = dynamic(
    () => import("@usecapsule/react-sdk").then((mod) => mod.CapsuleModal),
    { ssr: false }
);

const capsuleClient = new CapsuleClient(Environment.BETA, process.env.NEXT_PUBLIC_CAPSULE_API_KEY);

export const capsuleContext = React.createContext({
    setModalState: (a: boolean) => { console.warn('context not provided:', a) },
    modalState: false
});

export function CapsuleProvider({ children }: {
    children?: React.ReactNode
}) {

    const [isModalOpen, setIsModalOpen] = React.useState(true);

    return <>
        <capsuleContext.Provider value={{
            setModalState: setIsModalOpen,
            modalState: isModalOpen
        }}>
            <CapsuleModal
                capsule={capsuleClient}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                logo={""}
                theme={{ "backgroundColor": "#ffffff" }}
                oAuthMethods={[OAuthMethod.GOOGLE]}
                disableEmailLogin={false}
                disablePhoneLogin={false}
                authLayout={["AUTH:FULL", "EXTERNAL:FULL"]}
                externalWallets={["KEPLR", "LEAP"]}
                twoFactorAuthEnabled={false}
                recoverySecretStepEnabled={true}
                onRampTestMode
            />
            {children}
        </capsuleContext.Provider>
    </>
}