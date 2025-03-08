import { SkipClient } from "@skip-go/client";
import { getOfflineSigners } from "graz";

export const skipClient = new SkipClient({
    getCosmosSigner: async (chainID: string) => {
        const signer = await getOfflineSigners({
            chainId: chainID
        })
        return signer.offlineSigner
    }
});


