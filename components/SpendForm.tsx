"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { runAudit, AuditSummary, FormData } from "@/lib/auditEngine";

const TOOLS = [
  { id: "cursor", name: "Cursor", plans: ["Hobby", "Pro", "Business", "Enterprise"] },
  { id: "copilot", name: "GitHub Copilot", plans: ["Individual", "Business", "Enterprise"] },
  { id: "claude", name: "Claude", plans: ["Free", "Pro", "Max", "Team", "Enterprise", "API Direct"] },
  { id: "chatgpt", name: "ChatGPT", plans: ["Plus", "Team", "Enterprise", "API Direct"] },
  { id: "gemini", name: "Gemini", plans: ["Pro", "Ultra", "API"] },
  { id: "windsurf", name: "Windsurf", plans: ["Free", "Pro", "Team"] },
];

const USE_CASES = ["Coding", "Writing", "Data", "Research", "Mixed"];

type ToolEntry = {
  toolId: string;
  plan: string;
  seats: number;
  monthlySpend: number;
};

type FormState = {
  tools: ToolEntry[];
  teamSize: number;
  useCase: string;
};

const defaultEntry = (): ToolEntry => ({
  toolId: TOOLS[0].id,
  plan: TOOLS[0].plans[0],
  seats: 1,
  monthlySpend: 0,
});

const defaultState: FormState = {
  tools: [defaultEntry()],
  teamSize: 1,
  useCase: "Mixed",
};

export default function SpendForm() {
  const [form, setForm] = useState<FormState>(defaultState);
  const [audit, setAudit] = useState<AuditSummary | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("spendlens-form");
    if (saved) setForm(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("spendlens-form", JSON.stringify(form));
  }, [form]);

  const updateTool = (index: number, field: keyof ToolEntry, value: string | number) => {
    const updated = [...form.tools];
    if (field === "toolId") {
      const tool = TOOLS.find((t) => t.id === value)!;
      updated[index] = { ...updated[index], toolId: value as string, plan: tool.plans[0] };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setForm({ ...form, tools: updated });
  };

  const addTool = () => setForm({ ...form, tools: [...form.tools, defaultEntry()] });

  const removeTool = (index: number) => {
    const updated = form.tools.filter((_, i) => i !== index);
    setForm({ ...form, tools: updated.length ? updated : [defaultEntry()] });
  };

  const handleSubmit = () => {
    const result = runAudit(form as FormData);
    setAudit(result);
    setTimeout(() => {
      document.getElementById("audit-results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {form.tools.map((entry, i) => {
        const tool = TOOLS.find((t) => t.id === entry.toolId)!;
        return (
          <div key={i} className="border rounded-xl p-5 space-y-4 bg-card">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm text-muted-foreground">Tool {i + 1}</span>
              <button onClick={() => removeTool(i)} className="text-muted-foreground hover:text-destructive">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">AI Tool</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={entry.toolId}
                  onChange={(e) => updateTool(i, "toolId", e.target.value)}
                >
                  {TOOLS.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Plan</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={entry.plan}
                  onChange={(e) => updateTool(i, "plan", e.target.value)}
                >
                  {tool.plans.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Seats</label>
                <input
                  type="number"
                  min={1}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={entry.seats}
                  onChange={(e) => updateTool(i, "seats", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Monthly Spend (USD)</label>
                <input
                  type="number"
                  min={0}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={entry.monthlySpend}
                  onChange={(e) => updateTool(i, "monthlySpend", Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        );
      })}

      <button onClick={addTool} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <PlusCircle size={16} /> Add another tool
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Team Size</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            value={form.teamSize}
            onChange={(e) => setForm({ ...form, teamSize: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Primary Use Case</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            value={form.useCase}
            onChange={(e) => setForm({ ...form, useCase: e.target.value })}
          >
            {USE_CASES.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={handleSubmit}>
        Run My Audit →
      </Button>

      {/* RESULTS */}
      {audit && (
        <div id="audit-results" className="mt-10 space-y-6">
          {/* Hero */}
          <div className="rounded-2xl bg-card border p-8 text-center space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Potential Savings</p>
            <p className="text-5xl font-bold">${audit.totalMonthlySavings}/mo</p>
            <p className="text-muted-foreground">${audit.totalAnnualSavings.toLocaleString()} saved per year</p>
            {audit.isAlreadyOptimal && (
              <p className="text-green-600 font-medium mt-2">✅ You're spending well. No major optimizations found.</p>
            )}
            {audit.isHighSavings && (
              <div className="mt-4 p-4 bg-primary/10 rounded-xl">
                <p className="font-semibold">You could save over $500/mo — Credex can help you capture even more.</p>
                <a href="https://credex.rocks" target="_blank" className="text-primary underline text-sm">Book a free Credex consultation →</a>
              </div>
            )}
          </div>

          {/* Per tool breakdown */}
          {audit.results.map((r) => (
            <div key={r.toolId} className="border rounded-xl p-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{r.toolName}</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  r.status === "overspending"
                    ? "bg-red-100 text-red-700"
                    : r.status === "switch"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {r.status === "overspending" ? "Overspending" : r.status === "switch" ? "Better option" : "Optimal"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Current: <strong>{r.currentPlan}</strong> · ${r.currentSpend}/mo
              </p>
              <p className="text-sm">{r.recommendedAction}</p>
              <p className="text-xs text-muted-foreground">{r.reason}</p>
              {r.monthlySavings > 0 && (
                <p className="text-green-600 font-semibold text-sm">Save ${r.monthlySavings}/mo</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}