import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Building2, FolderOpen, Newspaper, LayoutGrid, Blocks } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

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
  catalog_section: <LayoutGrid className="h-4 w-4" />,
  catalog_subcategory: <Blocks className="h-4 w-4" />,
  product: <Building2 className="h-4 w-4" />,
  project: <FolderOpen className="h-4 w-4" />,
  article: <Newspaper className="h-4 w-4" />,
};

const typeBadgeVariants: Record<SearchResult["type"], "default" | "secondary" | "outline"> = {
  catalog_section: "secondary",
  catalog_subcategory: "outline",
  product: "default",
  project: "secondary",
  article: "outline",
};

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
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
          .limit(4),
        supabase
          .from("catalog_subcategories" as any)
          .select("id, title, slug, description, section_id")
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .eq("is_published", true)
          .limit(6),
        supabase
          .from("products")
          .select("id, title, slug, excerpt, section_id, subcategory_id")
          .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},catalog_card_title.ilike.${searchTerm},catalog_card_description.ilike.${searchTerm}`)
          .eq("is_published", true)
          .limit(6),
        supabase
          .from("projects")
          .select("id, title, slug, region")
          .or(`title.ilike.${searchTerm},region.ilike.${searchTerm},product_type.ilike.${searchTerm}`)
          .eq("is_published", true)
          .limit(5),
        supabase
          .from("articles")
          .select("id, title, slug, lead")
          .or(`title.ilike.${searchTerm},lead.ilike.${searchTerm}`)
          .eq("is_published", true)
          .limit(5),
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
          excerpt: project.region,
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
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, searchContent]);

  const handleSelect = (result: SearchResult) => {
    const paths: Record<SearchResult["type"], string> = {
      catalog_section: `/products/section/${result.slug}`,
      catalog_subcategory: `/products/section/${result.sectionSlug}/${result.slug}`,
      product: `/products/${result.slug}`,
      project: `/projects/${result.slug}`,
      article: `/company/press/${result.slug}`,
    };

    navigate(paths[result.type]);
    onOpenChange(false);
    setQuery("");
    setResults([]);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<SearchResult["type"], SearchResult[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-[550px]">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по каталогу и сайту..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                className="rounded p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <CommandList className="max-h-[400px]">
            {isLoading && <div className="py-6 text-center text-sm text-muted-foreground">Поиск...</div>}

            {!isLoading && query.length >= 2 && results.length === 0 && <CommandEmpty>Ничего не найдено.</CommandEmpty>}

            {!isLoading && query.length < 2 && query.length > 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">Введите минимум 2 символа</div>
            )}

            {!isLoading && query.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <p>Начните вводить для поиска</p>
                <p className="mt-2 text-xs">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>{" "}
                  для быстрого доступа
                </p>
              </div>
            )}

            {!isLoading &&
              Object.entries(groupedResults).map(([type, items]) => (
                <CommandGroup
                  key={type}
                  heading={
                    <span className="flex items-center gap-2">
                      {typeIcons[type as SearchResult["type"]]}
                      {typeLabels[type as SearchResult["type"]]}
                    </span>
                  }
                >
                  {items.map((result) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      value={`${result.title} ${result.excerpt || ""}`}
                      onSelect={() => handleSelect(result)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-1 items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{result.title}</div>
                          {result.excerpt && (
                            <div className="mt-0.5 truncate text-xs text-muted-foreground">
                              {result.excerpt.slice(0, 80)}...
                            </div>
                          )}
                        </div>
                        <Badge variant={typeBadgeVariants[result.type]} className="shrink-0 text-xs">
                          {typeLabels[result.type]}
                        </Badge>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
