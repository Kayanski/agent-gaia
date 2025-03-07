
export const messageCompletionFooter = `\nResponse format should be formatted in a valid JSON block like this:
\`\`\`json
{ "user": "{{agentName}}", "text": "<string>", "action": "<string>" }
\`\`\`

The “action” field should be one of the options in [Available Actions] and the "text" field should be the response you want to send.
`;

export const messageHandlerTemplate =
    // {{goals}}
    // "# Action Examples" is already included
    `{{actionExamples}}
(Action examples are for reference only. Do not use the information from them in your response.)

# Knowledge
{{knowledge}}

# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}

{{providers}}

{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

{{actions}}

# Instructions: Write the next message for {{agentName}}.
` + messageCompletionFooter;
