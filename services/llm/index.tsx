import { SYSTEM_CONTEXT } from "@/lib/send-system-prompt";
import { SendMessageOptions, sendMessage as claudeSendMessage } from "./claude";
import { StructuredMessage } from "./types";


export async function sendMessage({
  messages,
  maxTokens = 5000,
}: SendMessageOptions): Promise<StructuredMessage> {


  return claudeSendMessage({
    messages,
    maxTokens
  })

}
