"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface ConnectSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { relation: "follow" | "friend" | "collaborator" }) => Promise<void>;
  relations?: Array<{ value: "follow" | "friend" | "collaborator"; label: string }>;
}

const DEFAULT_RELATIONS: Array<{ value: "follow" | "friend" | "collaborator"; label: string }> = [
  { value: "follow", label: "Follow" },
  { value: "friend", label: "Friend" },
  { value: "collaborator", label: "Collaborator" },
];

export function ConnectSheet({ open, onClose, onSubmit, relations = DEFAULT_RELATIONS }: ConnectSheetProps) {
  const [relation, setRelation] = useState<"follow" | "friend" | "collaborator">("follow");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setRelation("follow");
      setIsSubmitting(false);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ relation });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/60 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Connect</h2>
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Relation
            <Select value={relation} onChange={(event) => setRelation(event.target.value as typeof relation)}>
              {(relations || DEFAULT_RELATIONS).map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
