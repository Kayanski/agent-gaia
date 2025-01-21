"use client"
import { useCapsule } from "@usecapsule/graz";

import dynamic from "next/dynamic";
import { OAuthMethod } from "@usecapsule/react-sdk";

const CapsuleModal = dynamic(
    () => import("@usecapsule/react-sdk").then((mod) => mod.CapsuleModal),
    { ssr: false }
);

export function Capsule({ children }: { children: React.ReactNode }) {

    const { client, modalState, onAfterLoginSuccessful, setModalState, onLoginFailure } = useCapsule();

    return (
        <>{/* Capsule Login */}
            {client && <div className="leap-ui">

                <CapsuleModal
                    capsule={client.getClient()}
                    isOpen={modalState}
                    onClose={() => setModalState(false)}
                    logo={""}
                    theme={{}}
                    oAuthMethods={[OAuthMethod.GOOGLE]}
                    disableEmailLogin={false}
                    disablePhoneLogin={false}
                    authLayout={["AUTH:FULL", "EXTERNAL:FULL"]}
                    externalWallets={["METAMASK", "PHANTOM"]}
                    twoFactorAuthEnabled={false}
                    recoverySecretStepEnabled={true}
                    onRampTestMode
                />
            </div>}
            {children}
        </>
    )
}