import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ArticleList({
  articles,
  totalPages,
  currentPage,
}: {
  articles: any[];
  totalPages: number;
  currentPage: number;
}) {
  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/${article.category.slug}/${article.slug}`}
          className="block"
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{article.title}</h3>
              <span className="text-sm text-muted-foreground">
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-muted-foreground mb-4">{article.excerpt}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {article.category.name}
              </span>
              <Button variant="ghost" size="sm">
                Read more →
              </Button>
            </div>
          </Card>
        </Link>
      ))}

      {/* Pagination Controls */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <Link key={pageNum} href={`?page=${pageNum}`}>
            <Button
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
            >
              {pageNum}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
