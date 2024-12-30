-- CreateTable
CREATE TABLE "ArticleNotArticle" (
    "id" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleNotArticle_pkey" PRIMARY KEY ("id")
);
