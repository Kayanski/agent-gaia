import { Anthropic } from "@anthropic-ai/sdk";
import type { Message, StructuredMessage } from "./types";
import { parseJSONObjectFromText } from "@elizaos/core";

export interface SendMessageOptions {
  messages: Message[];
  maxTokens?: number;
}

export interface Content {
  "user": string,
  "text": string
}

export async function sendMessage({
  messages,
  maxTokens = 5000,
}: SendMessageOptions): Promise<StructuredMessage> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  let systemPrompt: string | undefined;
  let messagesToSend = messages;

  if (messages[0]?.role === "system") {
    systemPrompt = messages[0].content;
    messagesToSend = messages.slice(1);
  }

  const claudeMessages: Anthropic.MessageParam[] = messagesToSend.map(
    (msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    })
  );

  const tools: Anthropic.Tool[] = [
    {
      name: "approveTransfer",
      description: "Approve the money transfer request",
      input_schema: {
        type: "object" as const,
      },
    },
    {
      name: "rejectTransfer",
      description: "Reject the money transfer request",
      input_schema: {
        type: "object" as const,
      },
    },
  ];

  const completion = await anthropic.messages.create({
    model: "claude-3-5-sonnet-latest",
    messages: claudeMessages,
    system: systemPrompt,
    tools: tools,
    max_tokens: maxTokens,
  });

  if (completion.stop_reason == "max_tokens") {
    return await sendMessage({ messages, maxTokens: maxTokens * 2 })
  }


  console.log("completion");
  console.log(completion.content);
  console.log(completion)

  // We collect the text response
  const textResponse = completion.content.filter((content) => content.type == "text")[0].text

  for (const content of completion.content) {
    if (content.type === "tool_use") {
      type ToolInput = { explanation: string };
      if (content.name === "approveTransfer") {
        return {
          explanation: textResponse,
          decision: true,
        };
      }
      return {
        explanation: textResponse,
        decision: false,
      };
    }
  }

  try {
    const responseText = textResponse

    const response = JSON.parse(responseText);
    return {
      explanation: response.explanation,
      decision: response.decision,
    };
  } catch (e) {
    // Fallback if response isn't valid JSON
    const fallbackText = textResponse ?? "Transfer rejected"

    return {
      explanation: fallbackText,
      decision: false,
    };
  }
}
