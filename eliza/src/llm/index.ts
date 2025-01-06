import { SendMessageOptions, sendMessage as claudeSendMessage } from "./claude";
import { StructuredMessage } from "./types";


export async function sendMessage({
  messages,
  maxTokens = 2000,
}: SendMessageOptions): Promise<StructuredMessage> {


  return claudeSendMessage({
    messages,
    maxTokens
  })

}
