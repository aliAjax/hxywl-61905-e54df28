import type { MessageType } from "../puzzle-engine/types";

export interface MessageToastProps {
  message: { text: string; type: MessageType } | null;
}

export function MessageToast({ message }: MessageToastProps) {
  if (!message) return null;
  return (
    <div className={`toast toast-${message.type}`}>
      {message.type === "collect" && "✨ "}
      {message.type === "error" && "⚠️ "}
      {message.text}
    </div>
  );
}
