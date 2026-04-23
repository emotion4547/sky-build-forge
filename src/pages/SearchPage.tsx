import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Building2, FolderOpen, Newspaper, ArrowRight, LayoutGrid, Blocks } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const typeLabels = {
  catalog_section: "Раздел каталога",
  catalog_subcategory: "Подкатегория",
  product: "Продукция",
  project: "Проект",
  article: "Статья",
} as const;

type SearchResult = {
  id: string;
  title: string;
  type: keyof typeof typeLabels;
  slug: string;
  excerpt?: string;
  sectionSlug?: string;
};

const typeIcons: Record<SearchResult["type"], React.ReactNode> = {
  catalog_section: <LayoutGrid className="h-5 w-5" />,
  catalog_subcategory: <Blocks className="h-5 w-5" />,
  product: <Building2 className="h-5 w-5" />,
  project: <FolderOpen className="h-5 w-5" />,
  article: <Newspaper className="h-5 w-5" />,
};

const typeBadgeVariants: Record<SearchResult["type"], "default" | "secondary" | "outline"> = {
  catalog_section: "secondary",
  catalog_subcategory: "outline",
  product: "default",
  project: "secondary",
  article: "outline",
};

const typeLinks: Record<SearchResult["type"], (result: SearchResult) => string> = {
  catalog_section: (result) => `/products/section/${result.slug}`,
  catalog_subcategory: (result) => `/products/section/${result.sectionSlug}/${result.slug}`,
  product: (result) => `/products/${result.slug}`,
  project: (result) => `/projects/${result.slug}`,
  article: (result) => `/company/press/${result.slug}`,
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchContent = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const searchTerm = `%${searchQuery.toLowerCase()}%`;

      const [sectionsResponse, subcategoriesResponse, productsResponse, projectsResponse, articlesResponse] = await Promise.all([
        supabase
          .from("catalog_sections" as any)
          .select("id, title, slug, description")
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .eq("is_published", true)
          .limit(10),
        supabase
          .from("catalog_subcategories" as any)
          .select("id, title, slug, description, section_id")
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .eq("is_published", true)
          .limit(10),
        supabase
          .from("products")
          .select("id, title, slug, excerpt, section_id")
          .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},catalog_card_title.ilike.${searchTerm},catalog_card_description.ilike.${searchTerm}`)
          .eq("is_published", true)
          .limit(10),
        supabase
          .from("projects")
          .select("id, title, slug, region, problem")
          .or(`title.ilike.${searchTerm},region.ilike.${searchTerm},product_type.ilike.${searchTerm},problem.ilike.${searchTerm}`)
          .eq("is_published", true)
          .limit(10),
        supabase
          .from("articles")
          .select("id, title, slug, lead")
          .or(`title.ilike.${searchTerm},lead.ilike.${searchTerm},body.ilike.${searchTerm}`)
          .eq("is_published", true)
          .limit(10),
      ]);

      const sectionMap = new Map<string, string>();
      (sectionsResponse.data || []).forEach((section: any) => sectionMap.set(section.id, section.slug));

      const missingSectionIds = Array.from(
        new Set(
          [
            ...((subcategoriesResponse.data as any[]) || []).map((item) => item.section_id),
            ...((productsResponse.data as any[]) || []).map((item) => item.section_id),
          ].filter(Boolean),
        ),
      ).filter((id) => !sectionMap.has(id));

      if (missingSectionIds.length > 0) {
        const { data: extraSections } = await supabase
          .from("catalog_sections" as any)
          .select("id, slug")
          .in("id", missingSectionIds);

        (extraSections || []).forEach((section: any) => sectionMap.set(section.id, section.slug));
      }

      const searchResults: SearchResult[] = [
        ...(((sectionsResponse.data as any[]) || []).map((section) => ({
          id: section.id,
          title: section.title,
          type: "catalog_section" as const,
          slug: section.slug,
          excerpt: section.description,
        })) || []),
        ...(((subcategoriesResponse.data as any[]) || [])
          .map((subcategory) => ({
            id: subcategory.id,
            title: subcategory.title,
            type: "catalog_subcategory" as const,
            slug: subcategory.slug,
            sectionSlug: sectionMap.get(subcategory.section_id),
            excerpt: subcategory.description,
          }))
          .filter((item) => Boolean(item.sectionSlug))),
        ...(((productsResponse.data as any[]) || []).map((product) => ({
          id: product.id,
          title: product.title,
          type: "product" as const,
          slug: product.slug,
          excerpt: product.excerpt,
          sectionSlug: product.section_id ? sectionMap.get(product.section_id) : undefined,
        })) || []),
        ...(((projectsResponse.data as any[]) || []).map((project) => ({
          id: project.id,
          title: project.title,
          type: "project" as const,
          slug: project.slug,
          excerpt: `${project.region} — ${project.problem}`,
        })) || []),
        ...(((articlesResponse.data as any[]) || []).map((article) => ({
          id: article.id,
          title: article.title,
          type: "article" as const,
          slug: article.slug,
          excerpt: article.lead,
        })) || []),
      ];

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchContent(query);
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, searchContent, setSearchParams]);

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<SearchResult["type"], SearchResult[]>);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold font-display mb-6">Поиск по сайту</h1>

          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Введите запрос для поиска..."
              className="pl-12 h-14 text-lg"
              autoFocus
            />
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Поиск...</p>
            </div>
          )}

          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-2">Ничего не найдено</p>
              <p className="text-sm text-muted-foreground">Попробуйте изменить запрос или использовать другие ключевые слова</p>
            </div>
          )}

          {!isLoading && query.length > 0 && query.length < 2 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Введите минимум 2 символа для поиска</p>
            </div>
          )}

          {!isLoading && query.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Начните вводить запрос для поиска по каталогу, продукции, проектам и статьям
              </p>
              <p className="text-sm text-muted-foreground">
                Совет: используйте{" "}
                <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>{" "}
                для быстрого поиска с любой страницы
              </p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-8">
              <p className="text-sm text-muted-foreground">Найдено результатов: {results.length}</p>

              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type}>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    {typeIcons[type as SearchResult["type"]]}
                    {typeLabels[type as SearchResult["type"]]}
                    <Badge variant="secondary" className="ml-2">
                      {items.length}
                    </Badge>
                  </h2>

                  <div className="space-y-3">
                    {items.map((result) => (
                      <Link key={`${result.type}-${result.id}`} to={typeLinks[result.type](result)}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer group">
                          <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium truncate group-hover:text-primary transition-colors">{result.title}</h3>
                                <Badge variant={typeBadgeVariants[result.type]} className="shrink-0 text-xs">
                                  {typeLabels[result.type]}
                                </Badge>
                              </div>
                              {result.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{result.excerpt}</p>}
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
