import React from "react";
import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" aria-hidden="true" />
    </div>
  );
}