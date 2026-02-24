import React from "react";
import { Sparkles, Plus } from "lucide-react";

const prompts = ["Summarize this article", "Draft a follow-up email", "Plan my day", "Generate interview questions"];

const FreshChat = () => {
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 rounded-2xl bg-indigo-100 p-3 text-indigo-600">
        <Sparkles className="h-7 w-7" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Welcome to Aura</h1>
      <p className="mt-3 text-slate-500">Start a new conversation and let AI handle the rest.</p>

      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {prompts.map((item) => (
          <button
            key={item}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:shadow"
          >
            <span>{item}</span>
            <Plus className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FreshChat;
