import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-utils";
import { getCmsPage } from "@/lib/content/cms-config";
import {
  getPageContent,
  savePageContent,
  validatePageContent,
} from "@/lib/content/page-content";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { slug } = await context.params;
  const page = getCmsPage(slug);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const content = await getPageContent(slug);
  return NextResponse.json({ page: { slug: page.slug, title: page.title }, content });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { slug } = await context.params;
  const page = getCmsPage(slug);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const body = await request.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  const validated = validatePageContent(slug, body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const merged = await savePageContent(slug, validated, user!.id);
  return NextResponse.json({ success: true, content: merged });
}
