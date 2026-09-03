# Frontend qilish rejasi — Solo Flowers

`frontend.md`dagi backend API tavsifi asosida, `CLAUDE.md`da tasvirlangan mavjud feature-based struktura (`src/features/*`, `src/pages/*`, `src/shared/*`) doirasida bosqichma-bosqich reja. Bu fayl hali hech narsa implement qilinmagan — faqat reja, birga ko'rib chiqib, kelishib olgandan keyin yozishni boshlaymiz.

---

## 0-bosqich — Poydevor (Foundation)

- [ ] `.env` / `.env.example` yaratish: `VITE_API_BASE_URL=http://localhost:8080/api/v1`
- [ ] `src/types/global.d.ts` yoki `vite-env.d.ts`da `import.meta.env.VITE_API_BASE_URL` turini belgilash
- [ ] `src/shared/lib/apiClient.ts` (hozir bo'sh) — Axios instance:
  - `baseURL` — `.env`dan
  - Request interceptor — Auth store'dan `access_token`ni `Authorization: Bearer` header'ga qo'shish
  - Response interceptor — envelope (`{ data, error, message }`) ni ochib, faqat `data`ni qaytarish; `error` bo'lsa shu matn bilan throw qilish
  - 401 kelganda avtomatik `/auth/refresh` chaqirib, so'rovni qayta yuborish (retry), refresh ham muvaffaqiyatsiz bo'lsa — auth store tozalanadi va login sahifasiga yo'naltiriladi
- [ ] `src/shared/lib/utils.ts` (hozir bo'sh) — umumiy helperlar: narxni tiyindan so'mga formatlash (`Intl.NumberFormat`), sana formatlash va h.k.
- [ ] `src/shared/ui/Pagination.tsx` — `page`/`page_size`/`total_pages` asosida ishlaydigan umumiy pagination komponenti (barcha ro'yxat endpointlarida bir xil shakl bor)

## 1-bosqich — Auth feature

- [ ] `features/auth/types.ts` — `User`, `Role` (`customer`/`admin`), `LoginPayload`, `RegisterPayload`, `AuthTokens`
- [ ] `features/auth/api.ts` — `register`, `login`, `refresh`, `getMe`
- [ ] `features/auth/store.ts` — Zustand store: `accessToken`, `refreshToken`, `user`, `setTokens`, `setUser`, `clearAuth`; `persist` middleware bilan `localStorage`ga saqlash
- [ ] `features/auth/hooks.ts` — `useLogin`, `useRegister`, `useMe`, `useLogout` (React Query mutations/queries)
- [ ] `app/providers/AuthProvider.tsx` (hozir passthrough) — ilova ochilganda tokendan foydalanuvchini tiklash uchun `/auth/me` chaqirish
- [ ] Route guard komponentlari (`RequireAuth`, `RequireAdmin`) — `role !== 'admin'` bo'lsa admin sahifalariga kirishni bloklash

## 2-bosqich — Categories feature *(yangi papka kerak, hozircha yo'q)*

- [ ] `features/categories/types.ts` — `Category`
- [ ] `features/categories/api.ts` — `getCategories`, `getCategory`, `getAdminCategories`, `createCategory` (multipart), `updateCategory`, `deleteCategory`
- [ ] `features/categories/hooks.ts` — mos React Query hook'lar
- [ ] `features/categories/components/CategorySelect.tsx` — public filter/forma uchun dropdown
- [ ] Admin CRUD uchun `features/admin-categories/` (`admin-products` namunasiga o'xshab) — `CategoryTable`, `CategoryFormModal`

## 3-bosqich — Events feature *(yangi papka kerak, hozircha yo'q)*

- [ ] `features/events/types.ts` — `Event`
- [ ] `features/events/api.ts` — `getEvents`, `getEvent`, `getAdminEvents`, `createEvent`, `updateEvent`, `deleteEvent`
- [ ] `features/events/hooks.ts`
- [ ] `features/events/components/EventBanner.tsx` — bosh sahifadagi banner/aksiya bloki (`is_root` birinchi chiqadi)
- [ ] Admin CRUD kerak bo'lsa `features/admin-events/`

## 4-bosqich — Products feature (mavjud, bo'sh fayllarni to'ldirish)

- [ ] `features/products/types.ts` — hozirgi soddalashtirilgan `Product` tipini backend shakliga moslab qayta yozish (`images[]`, `price_amount`/`discount_amount`/`final_price_amount`, `flower_types`, `packaging_type`, `stem_count`, `freshness_lifespan`, `rating`, `is_available`, `stock`, `sold_count`, `slug`, `video_url_youtube`/`video_url_instagram` va h.k.)
- [ ] `features/products/api.ts` — `getProducts` (search/category_id/page/page_size), `getProductById`, `getProductBySlug`
- [ ] `features/products/hooks.ts` — `useProducts`, `useProduct`, `useProductBySlug`
- [ ] `features/products/components/ProductCard.tsx` — `final_price_amount` asosida narx, `is_available=false` bo'lsa "tugadi" belgisi
- [ ] `features/products/components/ProductFilterBar.tsx` — qidiruv (debounce bilan, `shared/hooks/useDebounce.ts` mavjud) + kategoriya filter

## 5-bosqich — Admin-products feature (mavjud, bo'sh fayllarni to'ldirish)

- [ ] `features/admin-products/api.ts` — `getAdminProducts`, `createProduct` (multipart, ko'p rasm — `images` maydonini bir necha marta `append`), `updateProduct` (JSON, `clear_discount`/`clear_care_instructions` bayroqlari bilan), `deleteProduct`
- [ ] `features/admin-products/hooks.ts` — mos mutation/query hook'lar, muvaffaqiyatli mutation'dan keyin ro'yxat cache'ini invalidate qilish
- [ ] `features/admin-products/components/ProductTable.tsx` — pagination, `deleted_at`, delete tasdiqlash (`ConfirmDeleteModal`)
- [ ] `features/admin-products/components/ProductFormModal.tsx` — create/update forma (`react-hook-form` + `zod`), rasm yuklash preview (frontendda ham 3MB/jpeg-png-webp tekshiruvi), ko'p qiymatli tag maydonlar (`flower_types`, `occasions`, `compatible_addons`)

## 6-bosqich — Cart va Orders

- [ ] `features/cart/store.ts` — backendda savat/buyurtma endpointi hali yo'q (`frontend.md` 9-bo'lim), shuning uchun cart **faqat client-side** Zustand store bo'lib qoladi (`persist` bilan `localStorage`), server bilan sinxron emas
- [ ] `features/cart/hooks.ts`, `features/cart/components/CartDrawer.tsx` — shu local store ustida
- [ ] `features/orders/*` — backend HTTP endpoint tayyor bo'lmagani uchun **hozircha implement qilinmaydi**; `CheckoutPage` "tez orada" ko'rinishida qoldiriladi yoki bosqich keyinga suriladi

## 7-bosqich — Router va sahifalar

- [ ] `shared/constants/routes.ts`ga qo'shish: `ROUTES.CATEGORY` (masalan `/category/:id`), `ROUTES.ADMIN.CATEGORIES`, `ROUTES.ADMIN.EVENTS`
- [ ] `router/index.tsx`ga ulash: `ProductDetailPage` (slug bo'yicha), kategoriya sahifasi, `admin/CategoriesListPage`, `admin/EventsListPage`
- [ ] `pages/user/ProductDetailPage.tsx`, `pages/user/CheckoutPage.tsx` (hozir bo'sh) — mos feature hook'lari bilan to'ldirish

## 8-bosqich — Umumiy UI va xatoliklarni boshqarish

- [ ] `shared/ui/EmptyState.tsx`, `PageHeader.tsx`, `ConfirmDeleteModal.tsx` (hozir bo'sh) — umumiy qayta ishlatiladigan ko'rinishda to'ldirish
- [ ] Video embed komponenti — `video_url_youtube`/`video_url_instagram` uchun (ikkalasi ham ixtiyoriy, xom string)
- [ ] `apiClient` xatoligini Ant Design `message`/`notification` orqali global ko'rsatish (envelope'dagi `error` matni)
- [ ] `403` holatini alohida "ruxsat yo'q" sahifa/komponent bilan ko'rsatish

---

## Tavsiya etilgan ketma-ketlik

1. **0 + 1** — apiClient va auth (hammasi shunga tayanadi)
2. **2** — categories (products shunga bog'liq)
3. **4** — products (asosiy public storefront)
4. **3** — events (bosh sahifa banneri)
5. **5** — admin-products (+ kerak bo'lsa admin-categories/admin-events)
6. **6** — cart (client-side, backend'siz ishlaydi)
7. **7 + 8** — router ulash va umumiy UI polish
8. **orders** — backend `internal/ordering` HTTP bilan tayyor bo'lgach, alohida bosqich sifatida

## Ochiq savollar (implementatsiyadan oldin hal qilinishi kerak)

- Admin kategoriya/event CRUD uchun alohida `admin-categories`/`admin-events` papka yaratamizmi, yoki `categories`/`events` ichida saqlaymizmi?
- Refresh token flow: `localStorage`da saqlaymizmi (XSS xavfi) yoki boshqa yondashuv kerakmi?
- Forma validatsiyasi uchun `zod` sxemalari backend cheklovlariga (masalan `rating` 1–5, `freshness_lifespan` 1–7, rasm 3MB) qay darajada frontendda ham takrorlanadi?

---

## 10-bosqich — Backend 3 tillik (i18n) API'ga moslashtirish ⚠️ BREAKING CHANGE

**2026-09-03**: Backend jamoasi yangi `frontend.md` yubordi — `categories`, `products`, `events` endi **3 tilda** (`uz`/`eng`/`ru`) ishlaydi, va `products`da bir nechta maydon butunlay olib tashlangan. Bu shunchaki qo'shimcha emas, **hozirgi kodni buzadigan** o'zgarish, chunki `2-bosqich` (Categories), `3-bosqich` (Events), va qisman `4-bosqich` (Products) allaqachon **eski (bir tilli) shaklga mos** qilib yozilgan edi.

### Nima o'zgardi (backend tomonidan)

| | Eski shakl | Yangi shakl |
|---|---|---|
| Category nomi | `name: string` | Public: `?lang=` bo'yicha bitta `name`. Admin (`/categories/admin`): `name_uz`, `name_eng`, `name_ru` — barchasi majburiy |
| Category `parent_id` | mavjud, har doim `null` | **Maydon umuman yo'q** |
| Category rasm | `image_url` ixtiyoriy | `image_url` + yangi `image_public_id` — ikkalasi ham har doim bor |
| Product nomi/tavsifi | `name`, `description: string` | Public: `?lang=` bo'yicha bitta qiymat. Admin (`/products/admin`): `name_uz/eng/ru`, `description_uz/eng/ru` |
| Product narxi | tiyinda (`/100` kerak) | **to'g'ridan-to'g'ri so'mda** (konversiya kerak emas) |
| Product qo'shimcha maydonlari | `video_url_youtube`, `video_url_instagram`, `flower_types`, `color`, `stem_count`, `packaging_type`, `freshness_lifespan`, `care_instructions`, `occasions`, `allow_custom_card`, `compatible_addons` | **Hammasi olib tashlangan** |
| Product yangi maydoni | — | `tag` (badge, masalan `"bestseller"`), 3 tilda (`tag_uz/eng/ru`) admin javobida |
| Event matnlari | `eyebrow`, `title`, `subtitle`, `cta: string` | Public: `?lang=` bo'yicha bitta qiymat. Admin (`/events/admin`): har biri `_uz/_eng/_ru` |
| Barcha public GET (`/categories`, `/products`, `/events` va h.k.) | — | Endi `?lang=uz\|eng\|ru` query parametrini qabul qiladi (default `uz`) |

To'liq tafsilot: [frontend.md](frontend.md) — bo'lim 3 (Categories), 4.0 (til mexanizmi), 4 (Products), 5 (Events).

### Fayl-bo-fayl o'zgarishlar ro'yxati

**`src/shared/lib/utils.ts`**
- [ ] `formatPrice()` — `/100` bo'lishni olib tashlash (narx endi to'g'ridan-to'g'ri so'mda keladi), izohni yangilash.

**`src/features/categories/types.ts`**
- [ ] `Category` (public) — `parent_id`ni olib tashlash; `image_url`ni majburiy qilish (endi har doim bor); `image_public_id: string` qo'shish.
- [ ] Yangi `CategoryAdmin` tipi — `name_uz`, `name_eng`, `name_ru`, `image_url`, `image_public_id`, `created_at`, `updated_at`, `deleted_at`.
- [ ] `CreateCategoryPayload` — `name` → `name_uz`, `name_eng`, `name_ru` (uchtasi ham majburiy) + `image`.
- [ ] `UpdateCategoryPayload` — `name` → `name_uz?`, `name_eng?`, `name_ru?`.

**`src/features/categories/api.ts`**
- [ ] `getCategories(search?, lang?)`, `getCategory(id, lang?)` — `lang` query parametrini qo'shish.
- [ ] `getAdminCategories()` — qaytish tipini `CategoryAdmin[]`ga o'zgartirish.
- [ ] `createCategory` — FormData'ga `name` o'rniga `name_uz`/`name_eng`/`name_ru` qo'shish.
- [ ] `updateCategory` — payload endi `{ name_uz?, name_eng?, name_ru? }`.

**`src/features/categories/hooks.ts`**
- [ ] `useCategories`/`useCategory` — `lang`ni parametr sifatida qabul qilib, `queryKey`ga qo'shish.
- [ ] `useAdminCategories` — qaytish tipi `CategoryAdmin[]`.

**`src/features/admin-categories/components/CategoryFormModal.tsx`**
- [ ] `category` propi tipini `Category` → `CategoryAdmin`ga o'zgartirish.
- [ ] Bitta "Nomi" input o'rniga 3 ta input: `name_uz`, `name_eng`, `name_ru` (barchasi majburiy).
- [ ] `handleSubmit` — create/update payload'larni yangi 3-tilli shaklda yig'ish.

**`src/features/admin-categories/components/CategoryTable.tsx`**
- [ ] `Category` importini `CategoryAdmin`ga almashtirish.
- [ ] `dataIndex: 'name'` ustuni → `name_uz` (yoki barcha 3 tilni ko'rsatish).
- [ ] `Popconfirm`dagi `record.name` → `record.name_uz`.

**`src/features/products/types.ts`**
- [ ] Olib tashlash: `PackagingType`, `PACKAGING_LABELS`, va `Product`dan — `video_url_youtube`, `video_url_instagram`, `flower_types`, `color`, `stem_count`, `packaging_type`, `freshness_lifespan`, `care_instructions`, `occasions`, `allow_custom_card`, `compatible_addons`.
- [ ] Qo'shish: `tag?: string | null` (public), narx izohini "tiyin"dan "so'm"ga yangilash.
- [ ] Yangi `ProductAdmin` tipi — `name_uz/eng/ru`, `description_uz/eng/ru`, `tag_uz/eng/ru`, qolgan umumiy maydonlar + `deleted_at`.

**`src/features/products/api.ts`**
- [ ] `GetProductsParams`ga `lang?` qo'shish.
- [ ] `getProductById(id, lang?)`, `getProductBySlug(slug, lang?)` — `lang` parametri qo'shish.

**`src/features/products/hooks.ts`**
- [ ] `lang`ni tegishli `queryKey`larga qo'shish.

**`src/features/products/components/ProductCard.tsx`, `ProductFilterBar.tsx`**
- [ ] To'g'ridan-to'g'ri o'zgarish shart emas — `formatPrice` va `product.name`/`product.final_price_amount` orqali ishlaydi, `utils.ts` va `types.ts` tuzatilgach avtomatik to'g'ri ishlaydi.

**`src/features/events/types.ts`**
- [ ] `Event` (public) — o'zgarishsiz qoladi (`eyebrow/title/subtitle/cta` — bitta til, `?lang=` orqali tanlanadi).
- [ ] Yangi `EventAdmin` tipi — `eyebrow_uz/eng/ru`, `title_uz/eng/ru`, `subtitle_uz/eng/ru`, `cta_uz/eng/ru`, + `image`, `category_id`, `is_root`, sanalar, `deleted_at`.
- [ ] `CreateEventPayload` — `eyebrow/title/subtitle/cta` → `_uz/_eng/_ru` variantlari (`title_*` majburiy, qolganlari ixtiyoriy) + `category_id`, `is_root?`, `image`.
- [ ] `UpdateEventPayload` — xuddi shunday, barchasi ixtiyoriy.

**`src/features/events/api.ts`**
- [ ] `getEvents(lang?)`, `getEvent(id, lang?)` — `lang` qo'shish.
- [ ] `getAdminEvents()` — qaytish tipi `EventAdmin[]`.
- [ ] `createEvent`/`updateEvent` — 3-tilli maydonlarni jo'natish.

**`src/features/events/hooks.ts`**
- [ ] `lang`ni `queryKey`ga qo'shish.

**`src/features/events/components/EventBanner.tsx`**
- [ ] O'zgarish shart emas (public `Event` shakli o'zgarmagan).

**`src/features/admin-events/components/EventFormModal.tsx`**
- [ ] `event` propi tipi `Event` → `EventAdmin`.
- [ ] `eyebrow`/`title`/`subtitle`/`cta` uchun bittadan input o'rniga 3 tadan (`_uz`/`_eng`/`_ru`) input.

**`src/features/admin-events/components/EventTable.tsx`**
- [ ] `Event` importini `EventAdmin`ga almashtirish, `title` ustuni → `title_uz`, `Popconfirm`dagi `record.title` → `record.title_uz`.

**`src/features/admin-products/*` (hozircha bo'sh stub — 5-bosqichda TO'G'RIDAN-TO'G'RI yangi shaklga mos qilib yoziladi, migratsiya kerak emas)**
- [ ] `api.ts` — `getAdminProducts`, `createProduct` (multipart: `name_uz/eng/ru`, `description_uz/eng/ru?`, `category_id`, `amount`, `currency`, `discount_amount?`, `slug?`, `is_available?`, `rating?`, `stock?`, `tag_uz/eng/ru?`, `images[]`), `updateProduct` (JSON: barcha maydonlar ixtiyoriy + `clear_discount`, `clear_tag_uz/eng/ru` bayroqlari), `deleteProduct`.
- [ ] `hooks.ts` — `useAdminProducts`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`.
- [ ] `ProductFormModal.tsx` — 3 tilli nom/tavsif/tag inputlari, narx so'mda (konversiyasiz), **gul-do'koniga xos maydonlar (rang, poya soni, qadoqlash va h.k.) endi backendda yo'q — forma bularni umuman o'z ichiga olmaydi**.
- [ ] `ProductTable.tsx` — ustunlar: `name_uz`, narx, ombor, holat, amallar.

### Tekshirish rejasi (implementatsiyadan keyin)

- [ ] `tsc -b` — barcha eski maydonlarga bo'lgan murojaatlar olib tashlangani tasdiqlansin.
- [ ] Haqiqiy backend (`192.168.1.61:8080`) bilan: kategoriya/mahsulot/event ro'yxatlarini `lang=uz`, `lang=eng`, `lang=ru` bilan sinash.
- [ ] Admin panelda kategoriya/mahsulot/event yaratish-yangilash-o'chirishni haqiqiy backend bilan uchtala tilni ham to'ldirib sinash.
- [ ] `formatPrice()` endi narxni 100ga bo'lmasligini tasdiqlash (haqiqiy backend javobidagi son bilan solishtirib).
