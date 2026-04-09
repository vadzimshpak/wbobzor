import { detectImageMimeFromBytes } from "@/lib/image-mime";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; imageId: string }> }
) {
  const { id: articleId, imageId } = await context.params;

  const row = await prisma.articleBodyImage.findFirst({
    where: { id: imageId, articleId },
    select: { data: true, mimeType: true },
  });

  if (!row?.data) {
    return new Response(null, { status: 404 });
  }

  const body = new Uint8Array(row.data);
  const fromBytes = detectImageMimeFromBytes(body);
  const contentType =
    fromBytes !== "application/octet-stream" ? fromBytes : row.mimeType;

  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
