import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";

async function getArticles(limit: number) {
  const articles = await prisma.article.findMany({
    include: {
      category: true,
      tags: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: limit, // Charge uniquement les 10 premiers articles
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

      <section>
        <h2 className="text-3xl font-bold mb-8">Plus d'articles</h2>
        <Link
          href="/page/1"
          className="text-blue-500 underline text-lg hover:text-blue-700"
        >
          Voir tous les articles →
        </Link>
      </section>
    </main>
  );
}
