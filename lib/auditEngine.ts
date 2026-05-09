export type ToolEntry = {
  toolId: string;
  plan: string;
  seats: number;
  monthlySpend: number;
};

export type AuditFormData = {
  tools: ToolEntry[];
  teamSize: number;
  useCase: string;
};

export type AuditResult = {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedPlan: string;
  monthlySavings: number;
  reason: string;
  status: "overspending" | "optimal" | "switch";
};

export type AuditSummary = {
  results: AuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isHighSavings: boolean;
  isAlreadyOptimal: boolean;
};

const PRICING: Record<string, Record<string, number>> = {
  cursor: { Hobby: 0, Pro: 20, Business: 40, Enterprise: 40 },
  copilot: { Individual: 10, Business: 19, Enterprise: 39 },
  claude: { Free: 0, Pro: 20, Max: 100, Team: 30, Enterprise: 60, "API Direct": 0 },
  chatgpt: { Plus: 20, Team: 30, Enterprise: 60, "API Direct": 0 },
  gemini: { Pro: 20, Ultra: 300, API: 0 },
  windsurf: { Free: 0, Pro: 15, Team: 35 },
};

const TOOL_NAMES: Record<string, string> = {
  cursor: "Cursor",
  copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

function auditTool(entry: ToolEntry, teamSize: number, useCase: string): AuditResult {
  const { toolId, plan, seats, monthlySpend } = entry;
  const toolName = TOOL_NAMES[toolId] || toolId;

  let result: AuditResult = {
    toolId,
    toolName,
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction: "No change needed",
    recommendedPlan: plan,
    monthlySavings: 0,
    reason: "You are on the right plan for your usage.",
    status: "optimal",
  };

  if (toolId === "cursor") {
    if (plan === "Business" && seats === 1) {
      result = { ...result, recommendedAction: "Downgrade to Pro", recommendedPlan: "Pro", monthlySavings: monthlySpend - 20 > 0 ? monthlySpend - 20 : 20, reason: "Business plan is designed for teams. 1 seat on Pro gives the same core features at $20/mo vs $40/mo.", status: "overspending" };
    } else if (plan === "Enterprise" && seats <= 3) {
      result = { ...result, recommendedAction: "Downgrade to Business", recommendedPlan: "Business", monthlySavings: monthlySpend - 40 * seats, reason: "Enterprise pricing is for large orgs with compliance needs. Teams under 5 rarely need it.", status: "overspending" };
    }
  }

  if (toolId === "copilot") {
    if (plan === "Business" && seats === 1) {
      result = { ...result, recommendedAction: "Downgrade to Individual", recommendedPlan: "Individual", monthlySavings: monthlySpend - 10, reason: "Individual plan is identical for solo developers. Business adds policy controls you don't need alone.", status: "overspending" };
    } else if (plan === "Enterprise" && seats <= 5) {
      result = { ...result, recommendedAction: "Downgrade to Business", recommendedPlan: "Business", monthlySavings: monthlySpend - 19 * seats, reason: "Enterprise adds fine-tuning and audit logs. Teams under 5 rarely use these features.", status: "overspending" };
    }
  }

  if (toolId === "claude") {
    if (plan === "Team" && seats === 1) {
      result = { ...result, recommendedAction: "Downgrade to Pro", recommendedPlan: "Pro", monthlySavings: monthlySpend - 20, reason: "Team plan starts at $30/seat but is built for collaboration. Solo users get full value from Pro at $20/mo.", status: "overspending" };
    } else if (plan === "Max" && (useCase === "Writing" || useCase === "Research") && seats === 1) {
      result = { ...result, recommendedAction: "Downgrade to Pro", recommendedPlan: "Pro", monthlySavings: monthlySpend - 20, reason: "Max plan ($100/mo) gives 5x more usage — valuable for heavy usage but overkill for writing/research.", status: "overspending" };
    } else if (plan === "Enterprise" && seats <= 3) {
      result = { ...result, recommendedAction: "Downgrade to Team", recommendedPlan: "Team", monthlySavings: monthlySpend - 30 * seats, reason: "Enterprise adds SSO and audit logs. Teams under 5 rarely need these controls.", status: "overspending" };
    }
  }

  if (toolId === "chatgpt") {
    if (plan === "Team" && seats === 1) {
      result = { ...result, recommendedAction: "Downgrade to Plus", recommendedPlan: "Plus", monthlySavings: monthlySpend - 20, reason: "Team plan adds shared workspaces and admin controls. Solo users are fully covered by Plus at $20/mo.", status: "overspending" };
    } else if (plan === "Enterprise" && seats <= 5) {
      result = { ...result, recommendedAction: "Downgrade to Team", recommendedPlan: "Team", monthlySavings: monthlySpend - 30 * seats, reason: "Enterprise is priced for compliance-heavy orgs. Small teams get the same core access on Team.", status: "overspending" };
    }
  }

  if (toolId === "gemini") {
    if (plan === "Ultra" && useCase !== "Data" && seats === 1) {
      result = { ...result, recommendedAction: "Downgrade to Pro", recommendedPlan: "Pro", monthlySavings: monthlySpend - 20, reason: "Gemini Ultra ($300/mo) is built for data-heavy workloads. For coding, writing, or research, Pro at $20/mo is sufficient.", status: "overspending" };
    }
  }

  if (toolId === "windsurf") {
    if (plan === "Team" && seats === 1) {
      result = { ...result, recommendedAction: "Downgrade to Pro", recommendedPlan: "Pro", monthlySavings: monthlySpend - 15, reason: "Team plan adds admin features you don't need solo. Pro at $15/mo covers all individual coding needs.", status: "overspending" };
    }
  }

  if (result.monthlySavings < 0) result.monthlySavings = 0;
  return result;
}

export function runAudit(formData: AuditFormData): AuditSummary {
  const results = formData.tools.map((tool) => auditTool(tool, formData.teamSize, formData.useCase));
  const totalMonthlySavings = results.reduce((sum, r) => sum + r.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;
  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings,
    isHighSavings: totalMonthlySavings > 500,
    isAlreadyOptimal: totalMonthlySavings === 0,
  };
}
