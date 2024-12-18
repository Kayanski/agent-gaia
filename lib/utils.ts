import { DbMessage, TMessage } from "@/actions/getMessages"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function asyncAction<T>(promise: Promise<T>): Promise<{ data: T | undefined, err: any | undefined }> {

  return promise.then((data) => ({
    data,
    err: undefined
  })).catch((err) => ({
    data: undefined,
    err
  }))

}

export function parseDbMessageToTMessage(m: DbMessage): TMessage {
  return ({
    content: m.prompt,
    id: m.id,
    fullConversation: m.prompt,
    role: "user" as TMessage["role"],
    isWinner: false,
    userWallet: m.address,
    createdAt: m.submit_date,
    paiementId: m.payment_id,
    pricePaid: m.price_paid
  })
}

export const MESSAGE_FIELDS = 'address, prompt, is_submitted, submit_date, order_id, paiement_id, price_paid';
