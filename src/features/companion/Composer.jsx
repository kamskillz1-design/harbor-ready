import React, { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n/useI18n";
import { MAX_MESSAGE_CHARS } from "@/domain/validation/companion";

export default function Composer({ disabled, onSend }) {
  const { t } = useI18n();
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <form
      className="space-y-3 rounded-3xl border border-border bg-card p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={MAX_MESSAGE_CHARS}
        placeholder={t("companion.placeholder")}
        disabled={disabled}
        rows={3}
        aria-label={t("companion.placeholder")}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {text.length} / {MAX_MESSAGE_CHARS}
        </p>
        <Button type="submit" disabled={disabled || !text.trim()}>
          {disabled ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          {disabled ? t("companion.sending") : t("companion.send")}
        </Button>
      </div>
    </form>
  );
}