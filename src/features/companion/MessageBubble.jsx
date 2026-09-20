import React from "react";
import { cn } from "@/lib/utils";

export default function MessageBubble({ message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground">
          {message.content}
        </p>
      </div>
    );
  }
  // A crisis reply renders no bubble — the safety banner carries it instead.
  if (!message.content) {
    return null;
  }
  return (
    <div className="flex justify-start">
      <p
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-bl-md border px-4 py-3 text-sm",
          message.mode === "elevated"
            ? "border-border bg-secondary text-secondary-foreground"
            : "border-border bg-card text-foreground"
        )}
      >
        {message.content}
      </p>
    </div>
  );
}