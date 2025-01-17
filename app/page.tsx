import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export const revalidate = 60; // Re-générer toutes les 60 secondes

async function getArticles(limit: number) {
  const articles = await prisma.article.findMany({
    include: {
      category: true,
      tags: true,
    },
    orderBy: [
      {
        publishedAt: "desc",
      },
    ],
    distinct: ["categoryId"],
    take: limit,
  });

  return articles;
}

export default async function Page() {
  const limit = 10;
  const articles = await getArticles(limit);

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-8">Articles en vedette</h1>
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
    </main>
  );
}
