import React, { useCallback, useEffect, useRef, useState } from "react";
import PageLoader from "@/components/PageLoader";
import ErrorState from "@/components/ErrorState";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import MessageBubble from "@/features/companion/MessageBubble";
import SafetyBanner from "@/features/companion/SafetyBanner";
import Composer from "@/features/companion/Composer";
import { useI18n } from "@/i18n/useI18n";
import { loadHistory, sendMessage } from "@/app/services/companionService";

export default function Companion() {
  const { t, language } = useI18n();
  const [messages, setMessages] = useState(undefined);
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    setError(false);
    try {
      setMessages(await loadHistory());
    } catch (e) {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">{t("companion.title")}</h1>
        <ErrorState onRetry={load} />
      </div>
    );
  }
  if (messages === undefined) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">{t("companion.title")}</h1>
        <PageLoader />
      </div>
    );
  }

  const lastMode = messages.length > 0 ? messages[messages.length - 1].mode : null;
  const interrupted = lastMode === "crisis";

  const handleSend = async (text) => {
    setSending(true);
    setSendError(false);
    const history = messages
      .slice(-12)
      .filter((m) => m.content)
      .map((m) => ({ role: m.role, content: m.content }));
    try {
      const result = await sendMessage(text, history, language);
      setMessages((current) => [...current, result.userMessage, result.companionMessage]);
    } catch (e) {
      setSendError(true);
      await load();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold text-foreground">{t("companion.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("companion.subtitle")}</p>
      </div>

      <SafetyDisclaimer />

      <div className="flex min-h-[240px] flex-col gap-4">
        {messages.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center">
            <h2 className="font-display text-lg font-semibold text-foreground">{t("companion.emptyTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("companion.emptyBody")}</p>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {interrupted && <SafetyBanner />}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {sendError && (
        <p className="text-sm text-destructive" role="alert">
          {t("errors.AI_UNAVAILABLE")}
        </p>
      )}

      <Composer disabled={sending || interrupted} onSend={handleSend} />
    </div>
  );
}