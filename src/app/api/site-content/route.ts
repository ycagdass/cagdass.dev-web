import { NextResponse } from "next/server";
import { readSiteContent } from "@/lib/siteContent";
import { enrichSiteContentWithGithubProjects } from "@/lib/githubProjects";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await enrichSiteContentWithGithubProjects(await readSiteContent());
  return NextResponse.json(content, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
