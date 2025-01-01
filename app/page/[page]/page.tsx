import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export const revalidate = 60; // Re-générer toutes les 60 secondes

async function getArticles(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const articles = await prisma.article.findMany({
    include: {
      category: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    skip,
    take: limit,
  });

  const total = await prisma.article.count();
  const totalPages = Math.ceil(total / limit);

  return { articles, totalPages };
}

export default async function Page({ params }: { params: { page: string } }) {
  const page = parseInt(params.page, 10) || 1;
  const limit = 10;

  const { articles, totalPages } = await getArticles(page, limit);

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-8">Page {page} - Articles</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/${article.category.slug}/${article.slug}`}
            >
              <Card className="overflow-hidden">
                {article.coverImage && (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    {article.category.name}
                  </p>
                  <h2 className="text-xl font-semibold mb-2">
                    {article.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Pagination */}
      <section className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <Link key={pageNum} href={`/page/${pageNum}`}>
            <button
              className={`px-4 py-2 ${
                pageNum === page
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } rounded-md`}
            >
              {pageNum}
            </button>
          </Link>
        ))}
      </section>
    </main>
  );
}

export async function generateStaticParams() {
  const total = await prisma.article.count();
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  return Array.from({ length: totalPages }, (_, i) => ({
    page: `${i + 1}`,
  }));
}
