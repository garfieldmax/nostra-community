"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

export function AskCommunityAI() {
  const [question, setQuestion] = useState("");
  const [showScaffold, setShowScaffold] = useState(false);

  const handleAsk = () => {
    if (question.trim()) {
      setShowScaffold(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAsk();
    }
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Ask Community AI</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about this community..."
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        <button
          onClick={handleAsk}
          className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!question.trim()}
        >
          Ask
        </button>
      </div>
      {showScaffold && (
        <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          Scaffold for community AI here
        </div>
      )}
    </Card>
  );
}

