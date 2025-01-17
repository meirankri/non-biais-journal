import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 60; // Re-générer toutes les 60 secondes

// Pre-generate paths for all categories
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
    },
  });

  return categories.map((category) => ({
    categorySlug: category.slug,
  }));
}

// Dynamic Category Page
export default async function CategoryPage({
  params,
}: {
  params: { categorySlug: string };
}) {
  const category = await prisma.category.findUnique({
    where: {
      slug: params.categorySlug,
    },
    include: {
      articles: {
        orderBy: {
          publishedAt: "desc",
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        <p className="text-gray-600">
          Découvrez les articles de la catégorie{" "}
          <span className="text-blue-500">{category.name}</span>.
        </p>
      </header>

      {/* Articles List */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.articles.map((article) => (
            <Link
              key={article.id}
              href={`/${params.categorySlug}/${article.slug}`}
              className="block group h-full"
            >
              <div className="bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 h-full flex flex-col">
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-48 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                    No Image
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-lg font-semibold group-hover:text-blue-500">
                    {article.title}
                  </h2>
                  <p
                    className="text-gray-600 text-sm line-clamp-3 mt-2 flex-grow"
                    dangerouslySetInnerHTML={{
                      __html: article.content.substring(0, 100) + "...",
                    }}
                  />
                  <p className="text-gray-400 text-xs mt-4">
                    Publié le{" "}
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
