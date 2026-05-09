import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tools, teamSize, useCase, results, totalMonthlySavings, totalAnnualSavings } = body;

  // Generate AI summary
  let aiSummary = "";
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const topSavings = results
      .filter((r: any) => r.monthlySavings > 0)
      .map((r: any) => `${r.toolName} (${r.recommendedAction}, save $${r.monthlySavings}/mo)`)
      .join(", ");

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `You are an AI spend advisor. Write a 80-100 word personalized audit summary for a team of ${teamSize} primarily using AI tools for ${useCase}. Their biggest savings opportunities are: ${topSavings || "none found — they are already spending optimally"}. Total potential savings: $${totalMonthlySavings}/month. Be specific, encouraging, and actionable. No bullet points, just a paragraph.`,
        },
      ],
    });
    aiSummary = (message.content[0] as any).text;
  } catch {
    // Fallback summary
    if (totalMonthlySavings > 0) {
      aiSummary = `Based on your current AI tool stack, your team of ${teamSize} has an opportunity to save $${totalMonthlySavings}/month ($${totalAnnualSavings}/year) by optimizing your subscriptions. The biggest wins come from right-sizing plans to match your actual team size and use case. These are straightforward changes that won't impact your workflow — just your bill.`;
    } else {
      aiSummary = `Great news — your team of ${teamSize} is already spending optimally on AI tools for ${useCase}. Your current stack is well-matched to your needs. We'll notify you when new optimizations become available or when better-value alternatives emerge for your use case.`;
    }
  }

  // Save to Supabase
  const { data, error } = await supabase
    .from("audits")
    .insert({
      tools,
      team_size: teamSize,
      use_case: useCase,
      total_monthly_savings: totalMonthlySavings,
      total_annual_savings: totalAnnualSavings,
      results,
      is_public: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ auditId: data.id, aiSummary });
}