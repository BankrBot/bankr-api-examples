import { NextRequest, NextResponse } from "next/server";
import type { PromptResponse } from "../types";

const API_URL = process.env.BANKR_API_URL || "https://api.bankr.bot";
const API_KEY = process.env.BANKR_API_KEY || "";

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { success: false, error: "API key not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${API_URL}/agent/prompt`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error(
        `API returned non-JSON response (${response.status}):`,
        text.substring(0, 200),
      );
      return NextResponse.json(
        {
          success: false,
          error: `API error: ${response.status} ${response.statusText}`,
        },
        { status: response.status || 502 },
      );
    }

    const data: PromptResponse = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || data.message || "API error" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error submitting prompt:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit prompt" },
      { status: 500 },
    );
  }
}
