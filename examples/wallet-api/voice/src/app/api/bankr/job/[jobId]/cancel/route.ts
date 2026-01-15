import { NextRequest, NextResponse } from "next/server";
import type { JobStatusResponse } from "../../../types";

const API_URL = process.env.BANKR_API_URL || "https://api.bankr.bot";
const API_KEY = process.env.BANKR_API_KEY || "";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  if (!API_KEY) {
    return NextResponse.json(
      { success: false, error: "API key not configured" },
      { status: 500 },
    );
  }

  const { jobId } = await params;

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: "Job ID is required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${API_URL}/wallet/job/${jobId}/cancel`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
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

    const data: JobStatusResponse = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to cancel job" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error cancelling job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel job" },
      { status: 500 },
    );
  }
}
