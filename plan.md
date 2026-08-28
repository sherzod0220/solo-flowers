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
