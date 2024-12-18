import { getMessagesByPaiementId } from "@/actions/getMessageById";

export const isTxValid = async (
  paiementId: number,
  _blockchain: string,
  _txExpiryMinutes?: number
) => {
  const message = await getMessagesByPaiementId(paiementId);
  if (!message || message.length == 0 || !message[0].pricePaid) {
    console.log({ message });
    console.log(`Message not found with paiement ID ${message[0].paiementId} or price is not set`);
    return false;
  }

  return true
};
