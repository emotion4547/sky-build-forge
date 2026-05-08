// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const isEmpty = (v: any) => {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim().length === 0;
  if (Array.isArray(v)) return v.length === 0;
  return false;
};

const fillSchema = {
  type: "object",
  properties: {
    overview: { type: "string", maxLength: 900 },
    specs_spans: { type: "string", maxLength: 180 },
    specs_heights: { type: "string", maxLength: 180 },
    specs_insulation: { type: "string", maxLength: 180 },
    specs_snow_load: { type: "string", maxLength: 180 },
    specs_fire_resistance: { type: "string", maxLength: 180 },
    usp: { type: "array", maxItems: 6, items: { type: "string", maxLength: 140 } },
    applications: { type: "array", maxItems: 8, items: { type: "string", maxLength: 100 } },
    hero_metrics: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          label: { type: "string", maxLength: 32 },
          value: { type: "string", maxLength: 48 },
        },
        required: ["label", "value"],
        additionalProperties: false,
      },
    },
    content_sections: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          title: { type: "string", maxLength: 45 },
          body: { type: "string", maxLength: 420 },
          items: { type: "array", maxItems: 4, items: { type: "string", maxLength: 120 } },
        },
        required: ["title", "body", "items"],
        additionalProperties: false,
      },
    },
    catalog_card_title: { type: "string", maxLength: 50 },
    catalog_card_description: { type: "string", maxLength: 140 },
  },
  required: [
    "overview",
    "specs_spans",
    "specs_heights",
    "specs_insulation",
    "specs_snow_load",
    "specs_fire_resistance",
    "usp",
    "applications",
    "hero_metrics",
    "content_sections",
    "catalog_card_title",
    "catalog_card_description",
  ],
  additionalProperties: false,
};

async function fillWithPerplexity(
  productTitle: string,
  sectionTitle: string,
  subcategoryTitle: string,
): Promise<any> {
  if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY не настроен");
  const sys =
    "Ты эксперт и копирайтер для сайта производителя быстровозводимых зданий из ЛСТК и металлоконструкций в России. Пиши профессионально, на русском языке, без воды. Используй отраслевые факты, типовые диапазоны и ссылки на нормы (СП, ГОСТ, 123-ФЗ), если они релевантны. USP — 4–6 кратких пунктов. Applications — 4–8 пунктов. hero_metrics — 3–4 показателя. content_sections — 2–4 смысловых блока (Конструкция, Преимущества, Этапы, Гарантии и т.п.) с body 2–4 предложения и items 3–5 пунктов. catalog_card_title — короткий (до 50 симв), catalog_card_description — до 140 символов. overview — 2 абзаца, ~150 слов.";

  const user = `Товар: «${productTitle}»\nРаздел каталога: ${sectionTitle}\nПодкатегория: ${subcategoryTitle}\n\nЗаполни все поля карточки товара на русском языке. Если по полю нет точных данных — дай типовые отраслевые диапазоны. Все значения в SI, цифры с единицами измерения.`;

  const resp = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "fill_product_card",
          schema: fillSchema,
        },
      },
      max_tokens: 3500,
    }),
  });

  if (resp.status === 429) throw new Error("Лимит запросов к автозаполнению — попробуйте позже");
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Perplexity ${resp.status}: ${t.slice(0, 200)}`);
  }
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Нет ответа от автозаполнения");
  return typeof content === "string" ? JSON.parse(content) : content;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Не авторизовано" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Не авторизовано" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: roleData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Доступ только для администраторов" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { productId, mode = "empty-only" } = body;
    if (!productId || typeof productId !== "string") {
      return new Response(JSON.stringify({ error: "productId обязателен" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: product, error: prodErr } = await admin
      .from("products")
      .select("*, section:section_id(title), subcategory:subcategory_id(title)")
      .eq("id", productId)
      .maybeSingle();
    if (prodErr) throw prodErr;
    if (!product) {
      return new Response(JSON.stringify({ error: "Товар не найден" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sectionTitle = (product as any).section?.title || "";
    const subcategoryTitle = (product as any).subcategory?.title || "";

    const filled = await fillWithPerplexity(product.title, sectionTitle, subcategoryTitle);

    const update: Record<string, any> = {};
    const overwrite = mode === "all";
    const setIfNeeded = (field: string, value: any, currentEmpty: boolean) => {
      if (overwrite || currentEmpty) update[field] = value;
    };

    setIfNeeded("overview", filled.overview, isEmpty(product.overview));
    setIfNeeded("specs_spans", filled.specs_spans, isEmpty(product.specs_spans));
    setIfNeeded("specs_heights", filled.specs_heights, isEmpty(product.specs_heights));
    setIfNeeded("specs_insulation", filled.specs_insulation, isEmpty(product.specs_insulation));
    setIfNeeded("specs_snow_load", filled.specs_snow_load, isEmpty(product.specs_snow_load));
    setIfNeeded("specs_fire_resistance", filled.specs_fire_resistance, isEmpty(product.specs_fire_resistance));
    setIfNeeded("usp", filled.usp, isEmpty(product.usp));
    setIfNeeded("applications", filled.applications, isEmpty(product.applications));
    setIfNeeded("hero_metrics", filled.hero_metrics, isEmpty(product.hero_metrics));
    setIfNeeded("content_sections", filled.content_sections, isEmpty(product.content_sections));
    setIfNeeded("catalog_card_title", filled.catalog_card_title, isEmpty(product.catalog_card_title));
    setIfNeeded("catalog_card_description", filled.catalog_card_description, isEmpty(product.catalog_card_description));

    const filledFields = Object.keys(update);
    if (filledFields.length > 0) {
      const { error: updErr } = await admin.from("products").update(update).eq("id", productId);
      if (updErr) throw updErr;
    }

    return new Response(
      JSON.stringify({
        productId,
        status: filledFields.length === 0 ? "skipped" : "ok",
        filledFields,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("auto-fill-products fatal:", e);
    const message = e?.message || "Внутренняя ошибка";
    const status = message.includes("Лимит запросов") ? 429 : 500;
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
