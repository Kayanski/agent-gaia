export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StructuredMessage {
  explanation: string;
  decision: boolean;
}
export interface ParsedExplanation {
  user: string,
  text: string,
  action: string
}

export interface ParsedStructuredMessage {
  explanation: ParsedExplanation;
  decision: boolean;
}
