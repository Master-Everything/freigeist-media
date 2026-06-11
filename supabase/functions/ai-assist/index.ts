import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ACTION_PROMPTS: Record<string, string> = {
  rewrite:
    "Rewrite the following text while preserving its meaning. Improve clarity and flow. Return ONLY the rewritten text, no explanations.",
  shorten:
    "Shorten the following text significantly while keeping the key information. Return ONLY the shortened text.",
  expand:
    "Expand the following text with more detail, examples, or context. Return ONLY the expanded text.",
  "improve-style":
    "Improve the writing style of the following text. Make it more engaging and professional. Return ONLY the improved text.",
  "translate-de":
    "Translate the following text to German. Return ONLY the translation.",
  "translate-en":
    "Translate the following text to English. Return ONLY the translation.",
  "suggest-title":
    "Based on the following article content, suggest 5 compelling article titles. Format as a numbered list.",
  "suggest-subtitle":
    "Based on the following article content, suggest 3 concise subtitles/taglines. Format as a numbered list.",
  "fix-grammar":
    "Review the following text for grammar, spelling, and punctuation errors. Return the corrected text. Mark corrections with **bold** where changes were made.",
  "check-journalism":
    "You are an experienced journalism editor. Analyze the following article against core journalistic standards: factual accuracy, balanced reporting, source attribution, neutrality/objectivity, clarity, and proper separation of news from opinion. Provide a structured assessment with specific feedback and suggestions for improvement. Use markdown formatting with sections for each criterion.",
  "check-press-release":
    "You are an experienced PR and communications specialist. Analyze the following text as a press release. Evaluate it against these criteria: headline effectiveness, lead paragraph (who/what/when/where/why), newsworthiness, quote quality and attribution, boilerplate/company background, contact information, AP style compliance, call-to-action clarity, and overall structure. Provide a structured assessment with specific feedback and suggestions for improvement. Use markdown formatting with sections for each criterion.",
  "check-company-news":
    "You are an experienced corporate communications editor. Analyze the following text as company news (internal or external). Evaluate it against these criteria: tone and voice consistency, target audience alignment, brand message consistency, key message clarity, stakeholder relevance, factual accuracy, compliance considerations, and readability. Provide a structured assessment with specific feedback and suggestions for improvement. Use markdown formatting with sections for each criterion.",
  "research-web":
    "You are a senior research journalist. Based on the following article content (or topic description), provide comprehensive background research. Include: key context and background information, related angles worth exploring, important facts and data points, historical context, current developments in this area, and potential interview subjects or expert domains. Note: this analysis is based on your training knowledge, not live web search. Use markdown formatting with clear sections.",
  "brainstorm-headlines":
    "You are a creative headline writer for a professional news outlet. Based on the following article content, generate at least 10 headline and angle variations. Cover different tones: formal/serious, engaging/conversational, provocative/attention-grabbing, SEO-friendly, and question-based. For each headline, briefly note the tone/approach in parentheses. Use markdown formatting with a numbered list.",
  "find-sources":
    "You are a research editor helping journalists find credible sources. Based on the following article content, suggest: types of credible sources to consult, specific expert domains and organizations, statistics and data points to look for, academic research areas relevant to the topic, official reports or publications to reference, and potential counterpoints or alternative perspectives. Use markdown formatting with clear sections.",
  "generate-outline":
    "You are a senior editor helping structure an article. Based on the following content or topic, create a detailed article outline including: a compelling introduction approach, main sections with sub-points, suggested content flow and transitions, key points to cover in each section, estimated word count per section, and a strong conclusion approach. Use markdown formatting with clear hierarchy.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated user — prevents credit abuse via the public anon key.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve API key and endpoint: Lovable Cloud → OpenAI-compatible fallback
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    let apiKey: string;
    let apiUrl: string;
    let model: string;

    if (LOVABLE_API_KEY) {
      apiKey = LOVABLE_API_KEY;
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      model = "google/gemini-3-flash-preview";
    } else if (OPENAI_API_KEY) {
      apiKey = OPENAI_API_KEY;
      apiUrl = Deno.env.get("AI_BASE_URL") || "https://api.openai.com/v1/chat/completions";
      model = Deno.env.get("AI_MODEL") || "gpt-4o";
    } else {
      return new Response(
        JSON.stringify({ error: "No AI API key configured. Set LOVABLE_API_KEY or OPENAI_API_KEY." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, selectedText, fullContent, customPrompt, language, categorySlugs } =
      await req.json();

    // --- Structured metadata suggestion (non-streaming) ---
    if (action === "suggest-metadata") {
      const metaPrompt = `You are analyzing an article to suggest metadata. The article content is provided below. Available category slugs: ${(categorySlugs || []).join(", ")}.`;
      const metaUserContent = fullContent || selectedText || "";

      const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: metaPrompt },
              { role: "user", content: metaUserContent },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "suggest_metadata",
                  description: "Return metadata suggestions for the article.",
                  parameters: {
                    type: "object",
                    properties: {
                      titles: {
                        type: "array",
                        items: { type: "string" },
                        description: "3 compelling title suggestions",
                      },
                      subtitle: {
                        type: "string",
                        description: "A concise subtitle or tagline",
                      },
                      category: {
                        type: "string",
                        description: "Best-matching category slug from the available list",
                      },
                      reading_time: {
                        type: "number",
                        description: "Estimated reading time in minutes",
                      },
                    },
                    required: ["titles", "subtitle", "category", "reading_time"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "suggest_metadata" } },
          }),
        }
      );

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const body = await response.text();
        console.error("AI gateway error:", status, body);
        return new Response(JSON.stringify({ error: "AI service error" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        return new Response(JSON.stringify({ error: "No metadata returned" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const metadata = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(metadata), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Streaming text actions ---
    let systemPrompt: string;
    let userContent: string;

    if (action === "custom" && customPrompt) {
      systemPrompt =
        "You are a helpful writing assistant for a news/editorial CMS. Follow the user's instructions precisely. If the user references 'the text' or 'selected text', it refers to the text provided after the instruction.";
      userContent = customPrompt + (selectedText ? `\n\nText:\n${selectedText}` : `\n\nFull article:\n${fullContent}`);
    } else {
      const promptTemplate = ACTION_PROMPTS[action];
      if (!promptTemplate) {
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      systemPrompt = promptTemplate;
      if (language) {
        systemPrompt += ` Respond in ${language}.`;
      }
      const fullContentActions = ["suggest-title", "suggest-subtitle", "research-web", "brainstorm-headlines", "find-sources", "generate-outline"];
      userContent = fullContentActions.includes(action)
          ? fullContent || selectedText || ""
          : selectedText || fullContent || "";
    }

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const body = await response.text();
      console.error("AI gateway error:", response.status, body);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assist error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
