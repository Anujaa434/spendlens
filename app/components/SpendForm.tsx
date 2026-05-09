"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { runAudit, AuditSummary, AuditFormData } from "@/lib/auditEngine";

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
  const [auditId, setAuditId] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const [leadForm, setLeadForm] = useState({ email: "", companyName: "", role: "", website: "" });

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

  const handleSubmit = async () => {
    setLoading(true);
    const result = runAudit(form as AuditFormData);
    setAudit(result);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tools: form.tools,
          teamSize: form.teamSize,
          useCase: form.useCase,
          results: result.results,
          totalMonthlySavings: result.totalMonthlySavings,
          totalAnnualSavings: result.totalAnnualSavings,
        }),
      });
      const data = await res.json();
      setAuditId(data.auditId);
      setAiSummary(data.aiSummary);
    } catch (err) {
      console.error("API error:", err);
      setAiSummary("Based on your audit, we found optimization opportunities in your AI tool stack. Review the breakdown above for specific recommendations.");
    }

    setLoading(false);
    setTimeout(() => {
      document.getElementById("audit-results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleLeadSubmit = async () => {
    if (!auditId || !leadForm.email) return;
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditId, ...leadForm }),
    });
    setLeadSaved(true);
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
            {USE_CASES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
        {loading ? "Analyzing..." : "Run My Audit →"}
      </Button>

      {audit && (
        <div id="audit-results" className="mt-10 space-y-6">
          <div className="rounded-2xl bg-card border p-8 text-center space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Potential Savings</p>
            <p className="text-5xl font-bold">${audit.totalMonthlySavings}/mo</p>
            <p className="text-muted-foreground">${audit.totalAnnualSavings.toLocaleString()} saved per year</p>
            {audit.isAlreadyOptimal && (
              <p className="text-green-600 font-medium mt-2">You are spending well. No major optimizations found.</p>
            )}
            {audit.isHighSavings && (
              <div className="mt-4 p-4 bg-primary/10 rounded-xl">
                <p className="font-semibold">You could save over $500/mo — Credex can help you capture even more.</p>
                <a href="https://credex.rocks" target="_blank" rel="noreferrer" className="text-primary underline text-sm">
                  Book a free Credex consultation →
                </a>
              </div>
            )}
          </div>

          {audit.results.map((r) => (
            <div key={r.toolId} className="border rounded-xl p-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{r.toolName}</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  r.status === "overspending" ? "bg-red-100 text-red-700"
                  : r.status === "switch" ? "bg-yellow-100 text-yellow-700"
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

          {aiSummary && (
            <div className="border rounded-xl p-5 bg-card space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">AI Summary</p>
              <p className="text-sm leading-relaxed">{aiSummary}</p>
            </div>
          )}

          {auditId && (
            <div className="border rounded-xl p-5 bg-card space-y-2">
              <p className="text-sm font-semibold">Share your audit</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={`${window.location.origin}/audit/${auditId}`}
                />
                <button
                  className="px-3 py-2 border rounded-md text-sm hover:bg-muted"
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/audit/${auditId}`)}
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {!leadSaved && (
            <div className="border rounded-xl p-5 bg-card space-y-4">
              <p className="font-semibold">Save your report</p>
              <p className="text-sm text-muted-foreground">Get notified when new optimizations apply to your stack.</p>
              <input type="text" name="website" className="hidden" value={leadForm.website} onChange={(e) => setLeadForm({ ...leadForm, website: e.target.value })} />
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Company name (optional)"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={leadForm.companyName}
                onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Your role (optional)"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={leadForm.role}
                onChange={(e) => setLeadForm({ ...leadForm, role: e.target.value })}
              />
              <Button className="w-full" onClick={handleLeadSubmit}>Save my report →</Button>
            </div>
          )}

          {leadSaved && (
            <div className="border rounded-xl p-5 bg-green-50 text-green-700 text-sm font-medium">
              Report saved! We will notify you when new optimizations apply to your stack.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
