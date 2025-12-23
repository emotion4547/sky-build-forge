import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, FileText, Building2, FolderOpen, Newspaper } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

type SearchResult = {
  id: string;
  title: string;
  type: "product" | "project" | "article";
  slug: string;
  excerpt?: string;
};

const typeLabels: Record<SearchResult["type"], string> = {
  product: "Продукция",
  project: "Проект",
  article: "Статья",
};

const typeIcons: Record<SearchResult["type"], React.ReactNode> = {
  product: <Building2 className="h-4 w-4" />,
  project: <FolderOpen className="h-4 w-4" />,
  article: <Newspaper className="h-4 w-4" />,
};

const typeBadgeVariants: Record<SearchResult["type"], "default" | "secondary" | "outline"> = {
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

      // Search products
      const { data: products } = await supabase
        .from("products")
        .select("id, title, slug, excerpt")
        .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
        .eq("is_published", true)
        .limit(5);

      // Search projects
      const { data: projects } = await supabase
        .from("projects")
        .select("id, title, slug, region")
        .or(`title.ilike.${searchTerm},region.ilike.${searchTerm},product_type.ilike.${searchTerm}`)
        .eq("is_published", true)
        .limit(5);

      // Search articles
      const { data: articles } = await supabase
        .from("articles")
        .select("id, title, slug, lead")
        .or(`title.ilike.${searchTerm},lead.ilike.${searchTerm}`)
        .eq("is_published", true)
        .limit(5);

      const searchResults: SearchResult[] = [
        ...(products?.map((p) => ({
          id: p.id,
          title: p.title,
          type: "product" as const,
          slug: p.slug,
          excerpt: p.excerpt,
        })) || []),
        ...(projects?.map((p) => ({
          id: p.id,
          title: p.title,
          type: "project" as const,
          slug: p.slug,
          excerpt: p.region,
        })) || []),
        ...(articles?.map((a) => ({
          id: a.id,
          title: a.title,
          type: "article" as const,
          slug: a.slug,
          excerpt: a.lead,
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
      product: `/products/${result.slug}`,
      project: `/projects/${result.slug}`,
      article: `/company/press/${result.slug}`,
    };
    
    navigate(paths[result.type]);
    onOpenChange(false);
    setQuery("");
    setResults([]);
  };

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Group results by type
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по сайту..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <CommandList className="max-h-[400px]">
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Поиск...
              </div>
            )}
            
            {!isLoading && query.length >= 2 && results.length === 0 && (
              <CommandEmpty>Ничего не найдено.</CommandEmpty>
            )}

            {!isLoading && query.length < 2 && query.length > 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Введите минимум 2 символа
              </div>
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

            {!isLoading && Object.entries(groupedResults).map(([type, items]) => (
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
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.title}</div>
                        {result.excerpt && (
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
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
