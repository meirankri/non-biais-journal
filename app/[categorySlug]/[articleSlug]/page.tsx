import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";

// Generate all static paths for articles
export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    select: {
      slug: true,
      category: {
        select: { slug: true },
      },
    },
  });

  return articles.map((article) => ({
    categorySlug: article.category.slug,
    articleSlug: article.slug,
  }));
}

// Dynamic Article Page
export default async function ArticlePage({
  params,
}: {
  params: { categorySlug: string; articleSlug: string };
}) {
  const article = await prisma.article.findUnique({
    where: {
      slug: params.articleSlug,
    },
    include: {
      category: true,
    },
  });

  if (!article || article.category.slug !== params.categorySlug) {
    notFound();
  }

  return (
    <div className="max-w-4xl p-5 m-5 mx-auto">
      <h1 className="text-4xl mb-5 font-bold">{article.title}</h1>
      {article.coverImage && (
        <Image
          src={article.coverImage}
          alt={article.title}
          width={1000}
          height={1000}
          className="mb-5"
        />
      )}
      <p className="text-gray-600 mb-5">By {article.author}</p>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  );
}
