
## Цель
Добавить в админку каталога кнопку, которая через ИИ + веб-поиск (Perplexity) автоматически заполняет пустые поля у всех товаров: технические характеристики, USP, применение, обзор, контентные секции, метрики в шапке и карточку каталога. Уже заполненные значения не трогаем.

## Подключения и предпосылки
- Подключить коннектор **Perplexity** (через `standard_connectors--connect`) — даст `PERPLEXITY_API_KEY` в edge-функции.
- `LOVABLE_API_KEY` уже есть → используем Lovable AI (`google/gemini-2.5-pro`) для финальной структуризации текста в JSON.

## Backend: edge-функция `auto-fill-products`

Файл: `supabase/functions/auto-fill-products/index.ts`

Что делает на каждый товар:
1. Принимает `productIds: string[]` и `mode: "empty-only" | "all"` (по умолчанию `empty-only`).
2. Проверяет JWT и роль `admin` (через service role + `has_role`).
3. Для каждого товара:
   - Загружает товар + связанные `catalog_sections.title` и `catalog_subcategories.title` для контекста.
   - Определяет, какие поля пустые: `overview`, `specs_spans/heights/insulation/snow_load/fire_resistance`, `usp[]`, `applications[]`, `hero_metrics[]`, `content_sections[]`, `catalog_card_title`, `catalog_card_description`.
   - **Шаг 1 — Perplexity** (`sonar-pro`): запрос вида «Технические характеристики и типичные параметры для {title} ({section} / {subcategory}) в РФ. Пролёты, высоты, утепление, снеговые районы по СП 20.13330, степени огнестойкости по 123-ФЗ, типичные сферы применения, ключевые преимущества. Дай диапазоны.» Сохраняем `content` + `citations`.
   - **Шаг 2 — Lovable AI** (Gemini 2.5 Pro, tool calling со строгой схемой): на вход даёт текст Perplexity и просит вернуть JSON c полями строго под нашу модель. Язык — русский.
   - Делает `UPDATE products SET ...` — заполняет **только те поля, которые были пустыми** (или все, если `mode = all`).
4. Возвращает массив `{ productId, status: "ok"|"skipped"|"error", filledFields[], error? }`.

Обработка ошибок: 402/429 от Lovable AI и Perplexity → пробрасываем в ответ с понятными сообщениями. Между запросами пауза 1 сек, чтобы не упереться в rate limit.

`supabase/config.toml` — добавить блок функции с `verify_jwt = true`.

### JSON-схема ответа модели (tool calling)
```json
{
  "overview": "string (~120-200 слов)",
  "specs": {
    "spans": "string", "heights": "string", "insulation": "string",
    "snow_load": "string", "fire_resistance": "string"
  },
  "usp": ["string", ...],          // 4-6 пунктов
  "applications": ["string", ...], // 4-8 пунктов
  "hero_metrics": [{"label": "string", "value": "string"}], // 3-4
  "content_sections": [{"title": "string", "body": "string", "items": ["..."]}], // 2-4
  "catalog_card_title": "string",
  "catalog_card_description": "string (≤140 символов)"
}
```

## Frontend: кнопка в `AdminProducts.tsx`

В шапке списка товаров рядом с «Добавить»:
- **Кнопка «Автозаполнить ИИ»** → открывает диалог:
  - Описание, что будет сделано, и предупреждение «может занять несколько минут».
  - Радио: «Только пустые поля» (по умолчанию) / «Перезаписать все».
  - Селект scope: «Все опубликованные товары» / «Только текущая выборка по фильтру».
  - Кнопки «Отмена» / «Запустить».
- При запуске:
  - `supabase.functions.invoke("auto-fill-products", { body: { productIds, mode } })`.
  - Прогресс-индикатор и тосты по каждому товару (через прогрессивный ответ — функция возвращает массив в конце; для простоты — один общий тост с итогом «Заполнено N из M, ошибок K»).
  - После успеха — `refetch` списка.

В карточке отдельного товара (форма редактирования) — маленькая кнопка «Заполнить ИИ» сверху, которая запускает ту же функцию для одного `productId`.

## Что НЕ заполняется автоматически
- `slug`, `title`, `price_from`, `price_to`, `is_published`, `gallery`, `icon`, `section_id`, `subcategory_id`, `sort_order` — не трогаем.

## Технические заметки
- Источник цитат Perplexity сохраняем в логи функции (`console.log`), но в БД не пишем — чтобы не засорять контент.
- Generation idempotent: при повторном запуске с `empty-only` уже заполненные поля пропускаются.
- Нагрузка: ~1 запрос Perplexity + 1 запрос Lovable AI на товар. При 30 товарах — ~60 запросов, ~1–2 минуты.

## Файлы
- ➕ `supabase/functions/auto-fill-products/index.ts`
- ✏️ `supabase/config.toml` — блок `[functions.auto-fill-products]`
- ✏️ `src/components/admin/AdminProducts.tsx` — кнопка и диалог
- ✏️ `CHANGELOG.md`

## Что нужно от вас перед реализацией
1. Подтвердить подключение коннектора **Perplexity** (всплывёт окно выбора/создания подключения).
2. Если коннектор недоступен — могу обойтись только Lovable AI без веб-поиска (тексты будут достоверно звучать, но без ссылок на нормативы и без актуальных данных рынка).
