export type ChatCompletionRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
