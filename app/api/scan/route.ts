export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { getGallery } from "@/lib/gallery";
import { getScanPreview, isScanApiEnabled } from "@/lib/scan-utils";
import type { ScanResult } from "@/lib/types";

export async function GET() {
  const gallery = getGallery();
  const preview = getScanPreview(gallery);

  return NextResponse.json({
    scanApiEnabled: isScanApiEnabled(),
    onVercel: process.env.VERCEL === "1",
    ...preview,
    lastFullScan: gallery.lastFullScan,
    lastIncrementalScan: gallery.lastIncrementalScan,
  });
}

function runScanScript(incremental: boolean): Promise<ScanResult> {
  return new Promise((resolve, reject) => {
    const script = path.join(process.cwd(), "scripts", "scan-projects.js");
    const args = [script, "--json"];
    if (incremental) args.push("--incremental");

    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || "Scan process failed"));
        return;
      }

      try {
        const lines = stdout.trim().split("\n");
        const jsonLine = lines[lines.length - 1];
        resolve(JSON.parse(jsonLine) as ScanResult);
      } catch {
        reject(new Error("Failed to parse scan output"));
      }
    });
  });
}

export async function POST(request: NextRequest) {
  if (!isScanApiEnabled()) {
    return NextResponse.json(
      {
        error:
          "Scan API is disabled on this host. Run `npm run scan:incremental` locally, then redeploy.",
        scanApiEnabled: false,
      },
      { status: 503 }
    );
  }

  let incremental = true;
  try {
    const body = await request.json();
    if (typeof body.incremental === "boolean") {
      incremental = body.incremental;
    }
  } catch {
    // default incremental
  }

  try {
    const result = await runScanScript(incremental);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
