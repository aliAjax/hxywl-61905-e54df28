import { useState, useCallback, useRef } from "react";
import type { MessageType, InteractionEffect } from "../puzzle-engine/types";

export function useMessageToast() {
  const [message, setMessage] = useState<{ text: string; type: MessageType } | null>(null);
  const [justCollected, setJustCollected] = useState<string | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMsg = useCallback((text: string, type: MessageType = "info") => {
    setMessage({ text, type });
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }
    const timer = setTimeout(() => setMessage(null), 2500);
    messageTimerRef.current = timer;
  }, []);

  const triggerCollectAnimation = useCallback((itemId: string) => {
    setJustCollected(itemId);
    setTimeout(() => setJustCollected(null), 600);
  }, []);

  const applyEffects = useCallback(
    (effects: InteractionEffect[]) => {
      for (const eff of effects) {
        if (eff.showMessage) {
          showMsg(eff.showMessage, eff.messageType ?? "info");
        }
        if (eff.giveItems) {
          for (const id of eff.giveItems) {
            triggerCollectAnimation(id);
          }
        }
      }
    },
    [showMsg, triggerCollectAnimation]
  );

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    message,
    justCollected,
    showMsg,
    applyEffects,
    triggerCollectAnimation,
    clearMessage,
  };
}
