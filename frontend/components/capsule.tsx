"use client"
import { useCapsule } from "graz";

import { OAuthMethod } from "@leapwallet/cosmos-social-login-capsule-provider";
import "@leapwallet/cosmos-social-login-capsule-provider-ui/styles.css";
import dynamic from "next/dynamic";

const LeapSocialLogin = dynamic(
    () => import("@leapwallet/cosmos-social-login-capsule-provider-ui").then((m) => m.CustomCapsuleModalView),
    { ssr: false },
);

const TransactionSigningModal = dynamic(
    () => import("@leapwallet/cosmos-social-login-capsule-provider-ui").then((m) => m.TransactionSigningModal),
    { ssr: false },
);

export function Capsule({ children }: { children: React.ReactNode }) {

    const { client, modalState, onAfterLoginSuccessful, setModalState, onLoginFailure } = useCapsule();

    return (
        <>{/* Capsule Login */}
            {client && <div className="leap-ui">
                <LeapSocialLogin
                    theme="dark"
                    capsule={client.getClient()}
                    oAuthMethods={[OAuthMethod.GOOGLE, OAuthMethod.FACEBOOK, OAuthMethod.TWITTER, OAuthMethod.DISCORD, OAuthMethod.APPLE]}
                    onAfterLoginSuccessful={() => {
                        try {
                            void onAfterLoginSuccessful?.();
                        } catch (e) {
                            console.log(e)
                        }
                    }}
                    onLoginFailure={() => {
                        onLoginFailure();
                    }}
                    setShowCapsuleModal={setModalState}
                    showCapsuleModal={modalState}
                />
                <TransactionSigningModal dAppInfo={{ name: "Agent Gaia" }} />
            </div>}
            {children}
        </>
    )
}