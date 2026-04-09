import { detectImageMimeFromBytes } from "@/lib/image-mime";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const article = await prisma.feedArticle.findUnique({
    where: { id },
    select: { coverImage: true },
  });

  if (!article?.coverImage) {
    return new Response(null, { status: 404 });
  }

  const body = new Uint8Array(article.coverImage);
  const contentType = detectImageMimeFromBytes(body);

  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
