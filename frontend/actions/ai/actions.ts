import { Action, IAgentRuntime, Memory } from "@elizaos/core";

export const acceptAction: Action = {
    name: "ACCEPT_OUTGOING_TRANSFER",
    similes: ["ACCEPT_OUTGOING_TRANSFER", "APPROVE_OUTGOING_TRANSFER"],
    description: "Accept the outgoing funds transfer",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        // Validation logic
        return true;
    },
    handler: async (runtime: IAgentRuntime, message: Memory) => {
        // Implementation
    },
    examples: [],
};

export const rejectAction: Action = {
    name: "REJECT_OUTGOING_TRANSFER",
    similes: ["REJECT_OUTGOING_TRANSFER", "APPROVE_OUTGOING_TRANSFER"],
    description: "Reject the outgoing funds transfer",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        // Validation logic
        return true;
    },
    handler: async (runtime: IAgentRuntime, message: Memory) => {
        // Implementation
    },
    examples: [],
};