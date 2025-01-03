import { DbMessage, TMessage } from "@/actions"
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
    role: m.poster_role,
    isWinner: m.is_winner,
    userWallet: m.address,
    createdAt: m.submit_date,
    paiementId: m.paiement_id,
    pricePaid: m.price_paid,
    is_submitted: m.is_submitted
  })
}

export const MESSAGE_FIELDS = 'id, address, prompt, is_submitted, submit_date, paiement_id, price_paid, poster_role, is_winner';

export type Role = "user" | "system" | "assistant";