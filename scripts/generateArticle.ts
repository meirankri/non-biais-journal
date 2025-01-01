import { messagePrompt } from "@/constants";
import { createProvider } from "@/lib/ai-providers";
import { Message } from "@/types/ai-providers";
import { prisma } from "@/lib/prisma";
import * as cheerio from "cheerio";

type ArticleData = {
  title: string;
  slug: string;
  content: string;
  author: string;
  publishedAt: Date;
  categoryId: string;
  tags: string[];
  featured: boolean;
  coverImage: string | null;
  originalUrl: string;
};

const baseUrl = "https://www.francetvinfo.fr";

/**
 * Liste des catégories avec leurs slugs et IDs.
 * Cela permet de lier les articles à la bonne catégorie.
 */
const categories = [
  { id: "cm56ui2t40000xiq2xgyu2rki", slug: "Monde" },
  { id: "cm56ui3270003xiq2k7ta737a", slug: "Culture" },
  { id: "cm56ui3270002xiq20fl8962i", slug: "Europe" },
  { id: "cm56ui3270001xiq2bd1ptbje", slug: "Environnement" },
  { id: "cm56ui32f0004xiq20m1fyh1r", slug: "Faits-divers" },
  { id: "cm56ui33d0005xiq2rri11psa", slug: "Societe" },
  { id: "cm56ui33x0006xiq2u6fdfocc", slug: "economie" },
  { id: "cm56ui34k0007xiq2otz3chvb", slug: "Sante" },
  { id: "cm56ui35c0008xiq26uhu85b5", slug: "Politique" },
  { id: "cm56ui35c000axiq2l9f3pu5e", slug: "Sciences" },
  { id: "cm56ui35c0009xiq20geucxuk", slug: "Sport" },
];

/**
 * Récupère les liens d'une page spécifique pour une catégorie.
 * @param categorySlug - Le slug de la catégorie.
 * @param pageNumber - Le numéro de la page (1, 2 ou 3).
 */
async function fetchLinksFromPage(
  categorySlug: string,
  pageNumber?: number
): Promise<string[]> {
  const url = `${formatLinkToBaseUrl(baseUrl)}/${categorySlug.toLowerCase()}/${
    pageNumber ? `${pageNumber}.html` : ""
  }`;

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to fetch ${url}: ${response.statusText}`);
    return [];
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const links: string[] = [];
  $("a").each((_, element) => {
    const href = $(element).attr("href");
    const imageAlt = $(element).find("img").attr("alt");

    if (
      href &&
      href.includes(categorySlug.toLowerCase()) &&
      href.endsWith(".html") &&
      !/\/\d+\.html$/.test(href) &&
      imageAlt !== "video"
    ) {
      links.push(`${href}`);
    }
  });

  return links;
}

/**
 * Filtre les liens déjà enregistrés dans la base de données.
 * @param links - Liste des liens récupérés.
 */
async function filterExistingLinks(links: string[]): Promise<string[]> {
  const cleanedLinks = links.map(cleanUrl);

  const existingArticles = await prisma.article.findMany({
    where: {
      originalUrl: {
        in: cleanedLinks,
      },
    },
    select: {
      originalUrl: true,
    },
  });

  const existingNotArticles = await prisma.articleNotArticle.findMany({
    where: {
      originalUrl: {
        in: cleanedLinks,
      },
    },
  });

  console.log(existingArticles, cleanedLinks);

  const existingUrls = new Set(
    existingArticles.map((article) => cleanUrl(article.originalUrl || ""))
  );

  const existingNotArticlesUrls = new Set(
    existingNotArticles.map((article: { originalUrl: string }) =>
      cleanUrl(article.originalUrl)
    )
  );

  return cleanedLinks.filter(
    (link) => !existingUrls.has(link) && !existingNotArticlesUrls.has(link)
  );
}

const selectImageFromMain = ($: any): string | null => {
  const main = $("main");
  let bestImage: { src: string; width: number } | null = {
    src: "",
    width: 0,
  }; // Type explicite

  // Parcourir toutes les balises <source> dans <main>
  main.find("picture source").each((_: number, element: any) => {
    const source = $(element);
    const srcSet = source.attr("srcset");

    if (srcSet) {
      // Récupérer les différentes sources d'images
      const sources = srcSet.split(",").map((entry: string) => {
        const [url, size] = entry.trim().split(/\s+/);
        const dimensions = size?.match(/^(\d+)w$/); // Extrait la largeur si elle est spécifiée
        const width = dimensions ? parseInt(dimensions[1], 10) : 0;
        return { url, width };
      });

      // Sélectionner la meilleure image de ce <source>
      sources.forEach(({ url, width }: { url: string; width: number }) => {
        if (!bestImage || (width > bestImage.width && width >= 200)) {
          bestImage = { src: url, width }; // Assigne un objet valide à bestImage
        }
      });
    }
  });

  // Retourner l'URL de la meilleure image trouvée ou null si aucune
  return bestImage?.src || null;
};

const cleanUrl = (url: string): string => {
  return url.replace(/([^:]\/)\/+/g, "$1");
};

const extractTextContent = (html: string): string => {
  return cheerio.load(html).text().replace(/\s+/g, " ").trim();
};

/**
 * Récupère le contenu principal d'un article.
 * @param url - URL de l'article.
 */
async function fetchArticleContent(
  url: string,
  categorySlug: string,
  categoryId: string
): Promise<ArticleData | null> {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to fetch ${url}: ${response.statusText}`);
    return null;
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const main = $("main");
  const article = main.find("article");

  const title = $("h1").text().trim();

  const content =
    article.length > 0 ? article.text().trim() : main.text().trim();
  const author = $("meta[name='author']").attr("content") || "Unknown";
  const coverImage = selectImageFromMain($);
  const slug = url.split("/").pop()?.split(".")[0];
  if (!content) {
    console.error(`Failed to extract content from ${url}`);
    return null;
  }

  return {
    title,
    slug: slug || "",
    content: extractTextContent(content),
    author,
    publishedAt: new Date(),
    categoryId,
    tags: [],
    featured: false,
    coverImage,
    originalUrl: cleanUrl(url),
  };
}

/**
 * Envoie un contenu à l'API Mistral AI pour reformulation.
 * @param content - Contenu de l'article à reformuler.
 */
async function reformulateArticle(
  content: string
): Promise<{ title: string; content: string; isArticle: boolean } | null> {
  const provider = createProvider("mistral", {
    apiKey: process.env.MISTRAL_API_KEY || "",
  });

  try {
    const response = await provider.analyze({
      messages: messagePrompt(content) as Message[],
      temperature: 0.1,
      maxTokens: 4096,
      responseFormat: { type: "json_object" },
    });
    const result = provider.parseResponse(response);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Enregistre un article dans la base de données.
 * @param article - Données de l'article.
 */
async function saveArticleToDatabase(article: ArticleData): Promise<void> {
  const existingArticle = await prisma.article.findUnique({
    where: {
      categoryId_slug: {
        categoryId: article.categoryId,
        slug: article.slug,
      },
    },
  });

  if (existingArticle) {
    console.log(`Article already exists: ${article.title}`);
    return;
  }
  await prisma.article.create({
    data: {
      title: article.title,
      slug: article.slug,
      content: article.content,
      author: article.author,
      publishedAt: article.publishedAt,
      categoryId: article.categoryId,
      featured: article.featured,
      coverImage: article.coverImage,
      originalUrl: article.originalUrl,
      tags: {
        connectOrCreate: article.tags.map((tag) => ({
          where: { name: tag },
          create: { name: tag, slug: tag.toLowerCase().replace(/\s+/g, "-") },
        })),
      },
    },
  });
}

const formatLinkToBaseUrl = (url: string): string => {
  if (url.startsWith(baseUrl)) {
    return url;
  }
  return `${baseUrl}${url}`;
};

/**
 * Traite une catégorie entière en récupérant et enregistrant ses articles.
 * @param category - Catégorie à traiter.
 */
async function processCategory(category: {
  id: string;
  slug: string;
}): Promise<void> {
  const links: string[] = [];

  // Récupérer les liens des pages 1, 2 et 3
  for (let page = 1; page <= 3; page++) {
    if (page === 1) {
      const pageLinks = await fetchLinksFromPage(category.slug);
      links.push(...pageLinks);
    } else {
      const pageLinks = await fetchLinksFromPage(category.slug, page);
      links.push(...pageLinks);
    }
  }

  const formattedLinks = links.map(formatLinkToBaseUrl);
  // Filtrer les liens déjà enregistrés
  const filteredLinks = await filterExistingLinks(formattedLinks);

  // Traiter chaque lien
  for (const link of filteredLinks) {
    const articleData = await fetchArticleContent(
      link,
      category.slug,
      category.id
    );

    console.log(articleData);
    if (!articleData) continue;

    const reformulatedContent = await reformulateArticle(articleData.content);
    console.log(reformulatedContent);
    if (!reformulatedContent?.isArticle) {
      console.log(`Article is not an article: ${articleData.title}`);
      await prisma.articleNotArticle.create({
        data: {
          originalUrl: articleData.originalUrl,
        },
      });
      continue;
    }
    if (!reformulatedContent?.content) continue;

    articleData.content = reformulatedContent.content;
    articleData.title =
      articleData.title.length > 0
        ? reformulatedContent.title
        : articleData.title;

    // Enregistrer l'article dans la base de données
    await saveArticleToDatabase(articleData);
  }
}

/**
 * Fonction principale pour traiter toutes les catégories.
 */
export async function generateArticle(): Promise<void> {
  for (const category of categories) {
    console.log(`Processing category: ${category.slug}`);
    try {
      await processCategory(category);
    } catch (error) {
      console.error(error);
    }
  }

  console.log("Tous les articles ont été traités !");
  await prisma.$disconnect();
}

generateArticle().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
