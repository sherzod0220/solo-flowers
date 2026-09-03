# API — Frontend uchun qo'llanma

Bu hujjat backendda hozircha tayyor bo'lgan barcha endpointlarni tasvirlaydi. DDD arxitekturasida qurilgan (auth — `identity`, kategoriya/mahsulot — `catalog` bounded context).

> Swagger UI: `http://localhost:8080/swagger/index.html` (backend ishga tushirilgandan keyin shu yerdan interaktiv sinab ko'rish mumkin)

---

## 1. Umumiy ma'lumotlar

| | |
|---|---|
| **Base URL** | `http://localhost:8080/api/v1` |
| **Content-Type (JSON so'rovlar)** | `application/json` |
| **Content-Type (fayl yuklash)** | `multipart/form-data` |
| **Auth** | JWT Bearer token (`Authorization: Bearer <access_token>`) |
| **CORS** | Hozircha dev rejimda barcha originlarga ochiq (`*`) |

### Javob formati (Envelope)

**Barcha** endpointlar bir xil "envelope" ko'rinishida javob qaytaradi:

```json
{
  "data": { },
  "error": "",
  "message": ""
}
```

- Muvaffaqiyatli bo'lsa — `data` to'ldiriladi, `error` bo'lmaydi.
- Xatolik bo'lsa — `error` maydonida matn bo'ladi, `data` bo'lmaydi (HTTP status kodiga qarang, pastda jadval bor).

> Eslatma: `data`, `error`, `message` maydonlari `omitempty` — ya'ni bo'sh bo'lsa JSON'da umuman ko'rinmaydi.

### Xatolik status kodlari

| Status | Ma'nosi |
|---|---|
| `400` | Noto'g'ri so'rov / validatsiya xatosi (masalan bo'sh nom, manfiy narx, email formati noto'g'ri) |
| `401` | Token yo'q / noto'g'ri / muddati o'tgan, yoki login/parol xato |
| `403` | Token bor, lekin huquq yetarli emas (admin bo'lmagan user admin endpointga murojaat qilsa) |
| `404` | Resurs topilmadi (masalan mavjud bo'lmagan category ID) |
| `409` | Conflict — email band, yoki bir xil nomli category allaqachon mavjud |
| `500` | Server ichki xatosi |

---

## 2. Autentifikatsiya (Auth)

Barcha auth endpointlar prefiksi: **`/api/v1/auth`**

Yangi ro'yxatdan o'tgan foydalanuvchi avtomatik `customer` rolida yaratiladi. `admin` rolini faqat backend/DB orqali qo'lda berish mumkin (frontendda buni tanlash imkoniyati yo'q).

### 2.1 Ro'yxatdan o'tish

```
POST /api/v1/auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

- Parol uchun minimal uzunlik yoki murakkablik tekshiruvi backendda **yo'q** — istalgan bo'sh bo'lmagan string qabul qilinadi (frontendda o'zingiz validatsiya qo'shishni tavsiya qilamiz).
- Email formati regex bilan tekshiriladi va kichik harflarga normalize qilinadi.

**Muvaffaqiyatli javob — `201 Created`:**
```json
{
  "data": {
    "user_id": "uuid",
    "email": "user@example.com"
  }
}
```

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | email formati noto'g'ri yoki JSON body noto'g'ri |
| 409 | bu email bilan foydalanuvchi allaqachon mavjud |

---

### 2.2 Tizimga kirish

```
POST /api/v1/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Muvaffaqiyatli javob — `200 OK`:**
```json
{
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi..."
  }
}
```

- `access_token` — TTL: `.env` dagi `JWT_ACCESS_TTL` (default 15m)
- `refresh_token` — TTL: `.env` dagi `JWT_REFRESH_TTL` (default 168h / 7 kun)

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | body noto'g'ri |
| 401 | email yoki parol noto'g'ri |

---

### 2.3 Tokenni yangilash

```
POST /api/v1/auth/refresh
```

`access_token` muddati tugaganda, foydalanuvchini qayta login qildirmasdan yangi juftlik olish uchun ishlatiladi.

**Body:**
```json
{
  "refresh_token": "eyJhbGciOi..."
}
```

**Muvaffaqiyatli javob — `200 OK`:** (login bilan bir xil formatda, yangi `access_token` + `refresh_token`)
```json
{
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi..."
  }
}
```

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | body noto'g'ri |
| 401 | refresh token yaroqsiz yoki muddati o'tgan — foydalanuvchini qayta login sahifasiga yo'naltiring |

---

### 2.4 Joriy foydalanuvchini olish

```
GET /api/v1/auth/me
```

🔒 **Autentifikatsiya talab qilinadi** — `Authorization: Bearer <access_token>`

**Muvaffaqiyatli javob — `200 OK`:**
```json
{
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

- `role` — `"customer"` yoki `"admin"`. Frontendda admin panelni ko'rsatish/yashirish uchun shu maydondan foydalaning.

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 401 | token yo'q, noto'g'ri yoki muddati o'tgan |

---

## 3. Kategoriyalar (Categories)

Prefiks: **`/api/v1/categories`** (bu endpointlar `/api/v1/auth` ostida emas, to'g'ridan-to'g'ri `/api/v1` ostida)

Kategoriya nomi endi (mahsulot bilan bir xil qoidada) **3 tilda** (`uz`, `eng`, `ru`) saqlanadi. Ommaviy (public) endpointlar `?lang=` query parametriga qarab **bitta tildagi** javob qaytaradi; admin endpointi (`/categories/admin`) esa **har doim barcha 3 tilni** to'liq qaytaradi. Til mexanizmi mahsulotdagi bilan bir xil — [4.0](#40-til-lang-qanday-ishlaydi)ga qarang: `?lang=uz|eng|ru`, berilmasa yoki noto'g'ri bo'lsa `uz` (default), so'ralgan tilda qiymat bo'sh bo'lsa `uz`ga fallback.

### Category obyekti — ommaviy (public) javob shakli

```json
{
  "id": "uuid",
  "name": "Elektronika",
  "image_url": "https://res.cloudinary.com/.../category-images/....jpg",
  "image_public_id": "category-images/xxxxxxx",
  "created_at": "2026-08-18T10:00:00Z",
  "updated_at": "2026-08-18T10:00:00Z"
}
```

### Category obyekti — admin javob shakli (`GET /categories/admin`)

```json
{
  "id": "uuid",
  "name_uz": "Elektronika",
  "name_eng": "Electronics",
  "name_ru": "Электроника",
  "image_url": "https://res.cloudinary.com/.../category-images/....jpg",
  "image_public_id": "category-images/xxxxxxx",
  "created_at": "2026-08-18T10:00:00Z",
  "updated_at": "2026-08-18T10:00:00Z",
  "deleted_at": null
}
```

> **Muhim:** Kategoriyada **`parent_id` maydoni umuman yo'q** — hozircha kategoriyalar ierarxiyasi (parent/child daraxti) backendda mavjud emas, barcha kategoriyalar "flat" (tekis) ro'yxat sifatida keladi. `image_url` va `image_public_id` har doim javobda bor (Cloudinary'ga yuklangan rasm). Nomlar yaratishda **barcha 3 til majburiy** (bo'sh bo'lsa `400`).

---

### 3.1 Kategoriyalar ro'yxatini olish (public)

```
GET /api/v1/categories?search=<matn>&lang=<uz|eng|ru>
```

- Auth talab qilinmaydi.
- `search` — ixtiyoriy query parametr, nom bo'yicha qidirish uchun (`name_uz`/`name_eng`/`name_ru` — uchala til ustuni bo'yicha birga qidiradi).
- `lang` — ixtiyoriy, default `uz`.
- Faqat **o'chirilmagan** (`deleted_at IS NULL`) kategoriyalarni qaytaradi.

**Javob — `200 OK`:**
```json
{
  "data": [
    { "id": "uuid", "name": "Elektronika", "image_url": "url", "image_public_id": "...", "created_at": "...", "updated_at": "..." }
  ]
}
```

---

### 3.2 Bitta kategoriyani olish

```
GET /api/v1/categories/{id}?lang=<uz|eng|ru>
```

- Auth talab qilinmaydi.
- `lang` — ixtiyoriy, default `uz`.

**Javob — `200 OK`:**
```json
{ "data": { "id": "uuid", "name": "Elektronika", "image_url": "...", "image_public_id": "...", "created_at": "...", "updated_at": "..." } }
```

---

### 3.3 Kategoriyalarni olish — admin (o'chirilganlar bilan birga)

```
GET /api/v1/categories/admin?search=<matn>
```

🔒 **Faqat admin** (`Authorization: Bearer <access_token>`, foydalanuvchi roli `admin` bo'lishi shart)

- Oddiy `/categories`dan farqi: soft-delete qilingan (o'chirilgan) kategoriyalarni ham qaytaradi va **har doim barcha 3 tilni to'liq** qaytaradi (`lang` qabul qilinmaydi — yuqoridagi admin shaklga qarang). Admin panelda ro'yxat va tahrirlash formasini shu javobdan to'ldiring.

**Xatoliklar:** `401` (token yo'q), `403` (admin emas)

---

### 3.4 Yangi kategoriya yaratish

```
POST /api/v1/categories
```

🔒 **Faqat admin**

**Content-Type:** `multipart/form-data`

| Maydon | Turi | Majburiymi | Izoh |
|---|---|---|---|
| `name_uz` | string | ✅ ha | Kategoriya nomi (o'zbekcha) |
| `name_eng` | string | ✅ ha | Kategoriya nomi (inglizcha) |
| `name_ru` | string | ✅ ha | Kategoriya nomi (ruscha) |
| `image` | file | ✅ ha | Kategoriya rasmi — **majburiy**, bo'lmasa 400 xato qaytadi |

**Rasm cheklovlari (categories va products uchun bir xil):**
- Maksimal hajm: **3 MB**
- Ruxsat etilgan formatlar: `image/jpeg`, `image/png`, `image/webp`
- Bulardan tashqarisi (masalan gif, boshqa hajm) — `400` xato

**Muvaffaqiyatli javob — `201 Created`:** `{ "data": <Category obyekti — public shakl, lang=uz> }`

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | `name_uz`/`name_eng`/`name_ru`dan biri bo'sh, `image` yuborilmagan/noto'g'ri format/3MB dan katta |
| 401 | token yo'q |
| 403 | admin emas |
| 500 | server xatosi |

> Eslatma: bir xil nomli kategoriya yaratishga hozircha **cheklov yo'q** (nom unikal bo'lishi shart emas) — `409` bu endpointda qaytmaydi.

---

### 3.5 Kategoriyani yangilash

```
PUT /api/v1/categories/{id}
```

🔒 **Faqat admin**

**Content-Type:** `application/json`

**Body** (barcha maydonlar ixtiyoriy — faqat yubormoqchi bo'lgan tillarni jo'nating, qolganlari o'zgarmaydi):
```json
{
  "name_uz": "Yangi nom",
  "name_eng": "New name",
  "name_ru": "Новое название"
}
```

> Diqqat: bu endpoint **JSON body** qabul qiladi (rasm yangilash uchun `multipart/form-data` emas!). Rasmni yangilash uchun alohida endpoint yo'q. Nomni yangilashda `name_uz`/`name_eng`/`name_ru`dan **kamida bittasini** yuborsangiz, backend o'zgarmagan tillarni joriy qiymati bilan birga qayta tekshiradi (uchalasi ham bo'sh bo'lmasligi kerak) — shuning uchun xavfsizroq usul barcha 3 tilni birga yuborishdir.

**Javob — `200 OK`:**
```json
{ "data": null }
```

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | nom(lar) bo'sh string sifatida yuborilgan |
| 401 | token yo'q |
| 403 | admin emas |
| 404 | kategoriya topilmadi |
| 500 | server xatosi |

---

### 3.6 Kategoriyani o'chirish

```
DELETE /api/v1/categories/{id}
```

🔒 **Faqat admin**

- Bu **soft delete** — ya'ni ma'lumot bazadan butunlay o'chmaydi, faqat `deleted_at` belgilanadi. Shu sababli o'chirilgan kategoriya oddiy `GET /categories` ro'yxatida chiqmaydi, lekin `GET /categories/admin` orqali ko'rish mumkin.

**Javob — `200 OK`:**
```json
{ "data": "Kategoriya o'chirildi" }
```

**Xatoliklar:** `401`, `403`, `500`

---

## 4. Mahsulotlar (Products)

Prefiks: **`/api/v1/products`**

Mahsulot nomi va tavsifi **3 tilda** (`uz`, `eng`, `ru`) saqlanadi. Ommaviy (public) endpointlar `?lang=` query parametriga qarab **bitta tildagi** javob qaytaradi; admin endpointi (`/products/admin`, tahrirlash formasi uchun) esa **har doim barcha 3 tilni** to'liq qaytaradi.

### 4.0 Til (`lang`) qanday ishlaydi

Quyidagi public GET endpointlarning barchasi `?lang=uz|eng|ru` query parametrini qabul qiladi:
`GET /products`, `GET /products/{id}`, `GET /products/slug/{slug}`, `GET /categories/{id}/products`.

- Berilmasa yoki noto'g'ri qiymat yuborilsa — `uz` ishlatiladi (default).
- Agar so'ralgan tilda `name`/`description`/`tag` bo'sh bo'lsa — backend avtomatik `uz` qiymatiga fallback qiladi (frontendda bo'sh matn ko'rinmasligi uchun).
- Misol: `GET /api/v1/products?lang=ru&page=1`

> `GET /products/admin` (admin ro'yxati) `lang` qabul qilmaydi — u har doim 3 ta tilni birga qaytaradi, chunki admin panel tahrirlash formasi barcha tillarni bir vaqtda ko'rsatishi/yangilashi kerak.

---

### Product obyekti — ommaviy (public) javob shakli

`lang`ga mos ravishda **bitta tildagi** `name`/`description`/`tag` bilan qaytadi:

```json
{
  "id": "uuid",
  "name": "51 ta qizil atirgul",
  "description": "Premium Ekvador atirgullaridan yig'ilgan buket",
  "tag": "bestseller",
  "images": [
    "https://res.cloudinary.com/.../product-images/....jpg",
    "https://res.cloudinary.com/.../product-images/....jpg"
  ],
  "category_id": "uuid",
  "price_amount": 150000,
  "price_currency": "UZS",
  "discount_amount": 120000,
  "final_price_amount": 120000,
  "slug": "51-ta-qizil-atirgul",
  "is_available": true,
  "rating": 4.5,
  "stock": 12,
  "sold_count": 34,
  "created_at": "2026-08-18T10:00:00Z",
  "updated_at": "2026-08-18T10:00:00Z"
}
```

### Product obyekti — admin javob shakli (`GET /products/admin`)

Barcha 3 til birga, tahrirlash formasini to'ldirish uchun:

```json
{
  "id": "uuid",
  "name_uz": "51 ta qizil atirgul",
  "name_eng": "51 red roses",
  "name_ru": "51 красная роза",
  "description_uz": "Premium Ekvador atirgullaridan yig'ilgan buket",
  "description_eng": "A bouquet of premium Ecuadorian roses",
  "description_ru": "Букет из премиальных эквадорских роз",
  "tag_uz": "bestseller",
  "tag_eng": "Bestseller",
  "tag_ru": "хит продаж",
  "images": ["https://res.cloudinary.com/.../product-images/....jpg"],
  "category_id": "uuid",
  "price_amount": 150000,
  "price_currency": "UZS",
  "discount_amount": 120000,
  "final_price_amount": 120000,
  "slug": "51-ta-qizil-atirgul",
  "is_available": true,
  "rating": 4.5,
  "stock": 12,
  "sold_count": 34,
  "created_at": "2026-08-18T10:00:00Z",
  "updated_at": "2026-08-18T10:00:00Z",
  "deleted_at": null
}
```

Muhim izohlar:
- **`name` / `description`** — 3 tilda saqlanadi (`name_uz/eng/ru`, `description_uz/eng/ru`). Yaratishda **nom uchun barcha 3 til majburiy** (bo'sh bo'lsa `400`), tavsif ixtiyoriy (bo'sh string bo'lishi mumkin).
- **`tag`** — ixtiyoriy belgi/badge, masalan `"bestseller"`, 3 tilda (`tag_uz/eng/ru`). Berilmasa `null`/`omitempty`.
- Video (YouTube/Instagram) va gul-do'koniga xos maydonlar (`flower_types`, `color`, `stem_count`, `packaging_type`, `freshness_lifespan`, `care_instructions`, `allow_custom_card`, `compatible_addons`, `occasions`) **butunlay olib tashlangan** — endi mavjud emas.
- **`images`** — Cloudinary CDN URL'lari ro'yxati, **eng ko'pi bilan 5 ta**. Bo'sh bo'lishi ham mumkin (`[]`).
- **`price_amount` / `discount_amount` / `final_price_amount`** — endi **tiyinda emas, to'g'ridan-to'g'ri so'mda** (butun son) saqlanadi va qaytadi — backend hech qanday konversiya qilmaydi, frontend qanday yuborsa, shundayligicha saqlanadi va qaytadi. `discount_amount` bo'lmasa, javobda bu maydon umuman ko'rinmaydi (`omitempty`) va `final_price_amount` = `price_amount` bilan teng bo'ladi. `discount_amount` bo'lsa, u har doim `price_amount`dan kichik bo'ladi va **narxni ko'rsatishda `final_price_amount`dan foydalaning**.
- **`slug`** — URL uchun (masalan `/product/51-ta-qizil-atirgul`). Yaratishda yubormasangiz, backend `name_uz`dan avtomatik hosil qiladi. Har bir mahsulotda **unikal** bo'lishi shart — band bo'lgan slug yuborilsa `409` qaytadi.
- **`rating`** — 1 dan 5 gacha, default `1`. Hozircha foydalanuvchi sharhlaridan avtomatik hisoblanmaydi — admin qo'lda kiritadi (izoh/sharh tizimi hali yo'q).
- **`stock`** / **`sold_count`** — ombordagi son va sotilganlar soni. `is_available` bilan bir xil narsa emas: `stock=0` bo'lsa ham `is_available` alohida `true`/`false` bo'lishi mumkin — frontendda ikkalasini alohida hisobga oling ("tugadi" belgisi uchun `is_available`ni ishlating).
- `category_id` — **backend create/update paytida bu ID chindan mavjud kategoriyaga tegishli ekanligini tekshiradi** — mavjud bo'lmagan `category_id` yuborilsa xato qaytadi.

---

### 4.1 Mahsulotlar ro'yxatini olish (public)

```
GET /api/v1/products?search=<matn>&category_id=<uuid>&lang=<uz|eng|ru>&page=<son>&page_size=<son>
```

- Auth talab qilinmaydi.
- `search` — ixtiyoriy, nom bo'yicha qidirish (`ILIKE`, uchala til ustuni — `name_uz`/`name_eng`/`name_ru` — bo'yicha birga qidiradi).
- `category_id` — ixtiyoriy, faqat shu kategoriyaga tegishli mahsulotlarni qaytaradi. Ikkalasini birga ham berish mumkin.
- `lang` — ixtiyoriy, [4.0](#40-til-lang-qanday-ishlaydi)ga qarang, default `uz`.
- `page` — ixtiyoriy, sahifa raqami, **1 dan boshlanadi**. Berilmasa yoki `1`dan kichik bo'lsa `1` deb olinadi.
- `page_size` — ixtiyoriy, sahifadagi elementlar soni. Berilmasa `20`. Maksimal `100` — undan katta qiymat yuborilsa `100`ga qisqartiriladi.
- Faqat **o'chirilmagan** (`deleted_at IS NULL`) mahsulotlarni qaytaradi. `is_available=false` bo'lgan mahsulotlar ham shu ro'yxatda keladi (yashirilmaydi) — "tugagan" holatini frontendda `is_available` orqali ko'rsating.

**Javob — `200 OK`:**
```json
{
  "data": {
    "items": [ <Product obyekti — public shakl>, ... ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 42,
      "total_pages": 3
    }
  }
}
```

> Diqqat: bu **ro'yxat qaytaradigan barcha `/products` endpointlarida bir xil shakl** (pastdagi 4.2 va 4.5 ham shu). `data` to'g'ridan-to'g'ri massiv emas, balki `items` + `pagination` bo'lgan obyekt. Mahsulotlar ro'yxatini chizishda `data.items`ni, "keyingi sahifa" tugmasi uchun `data.pagination.total_pages`ni ishlating.

---

### 4.2 Kategoriya bo'yicha mahsulotlarni olish (public)

```
GET /api/v1/categories/{id}/products?search=<matn>&lang=<uz|eng|ru>&page=<son>&page_size=<son>
```

- Auth talab qilinmaydi.
- Xuddi `GET /products?category_id={id}` bilan bir xil natija — kategoriya sahifasida (masalan "Atirgullar" kategoriyasi) qulay bo'lishi uchun alohida yo'l sifatida ham ochilgan.
- `lang` / `page` / `page_size` — 4.1 bilan bir xil qoidalar.

**Javob — `200 OK`:** 4.1dagi bilan bir xil `{ "data": { "items": [...], "pagination": {...} } }` shakli.

---

### 4.3 Bitta mahsulotni olish (ID bo'yicha)

```
GET /api/v1/products/{id}?lang=<uz|eng|ru>
```

- Auth talab qilinmaydi.
- `lang` — ixtiyoriy, default `uz`.

**Javob — `200 OK`:** `{ "data": <Product obyekti — public shakl> }`

**Xatoliklar:** `404` — mahsulot topilmadi (yoki o'chirilgan)

---

### 4.4 Bitta mahsulotni olish (slug bo'yicha)

```
GET /api/v1/products/slug/{slug}?lang=<uz|eng|ru>
```

- Auth talab qilinmaydi. Mahsulot sahifasi (`/product/51-ta-qizil-atirgul`) uchun SEO-friendly URL'da shundan foydalaning.
- `lang` — ixtiyoriy, default `uz`.

**Javob — `200 OK`:** `{ "data": <Product obyekti — public shakl> }`

**Xatoliklar:** `404` — mahsulot topilmadi

---

### 4.5 Mahsulotlarni olish — admin (o'chirilganlar bilan birga)

```
GET /api/v1/products/admin?search=<matn>&category_id=<uuid>&page=<son>&page_size=<son>
```

🔒 **Faqat admin**

- Oddiy `/products`dan farqi: soft-delete qilingan mahsulotlarni ham qaytaradi va **har doim barcha 3 tilni to'liq** qaytaradi (`lang` qabul qilinmaydi — [4.0](#40-til-lang-qanday-ishlaydi)ga qarang). Har bir elementda qo'shimcha `deleted_at` maydoni bo'ladi (o'chirilmagan bo'lsa `null`).
- `page` / `page_size` — 4.1 bilan bir xil qoidalar. Javob shakli ham bir xil: `{ "data": { "items": [...], "pagination": {...} } }`, lekin har bir element yuqoridagi **admin shaklida** (`name_uz/eng/ru`, `description_uz/eng/ru`, `tag_uz/eng/ru`, `deleted_at`).
- Admin panelda mahsulotni tahrirlash formasini shu ro'yxatdagi qatordan to'ldiring — alohida "bitta mahsulotni admin ko'rinishida olish" endpointi yo'q.

**Xatoliklar:** `401` (token yo'q), `403` (admin emas)

---

### 4.6 Yangi mahsulot yaratish

```
POST /api/v1/products
```

🔒 **Faqat admin**

**Content-Type:** `multipart/form-data`

| Maydon | Turi | Majburiymi | Izoh |
|---|---|---|---|
| `name_uz` | string | ✅ ha | Mahsulot nomi (o'zbekcha) |
| `name_eng` | string | ✅ ha | Mahsulot nomi (inglizcha) |
| `name_ru` | string | ✅ ha | Mahsulot nomi (ruscha) |
| `description_uz` | string | ❌ yo'q | Tavsif (o'zbekcha) |
| `description_eng` | string | ❌ yo'q | Tavsif (inglizcha) |
| `description_ru` | string | ❌ yo'q | Tavsif (ruscha) |
| `category_id` | string (uuid) | ✅ ha | Mavjud kategoriya ID'si — backend tekshiradi |
| `amount` | integer | ✅ ha | Narx, **so'mda** (butun son, tiyinga aylantirilmaydi) |
| `currency` | string | ✅ ha | Valyuta kodi, masalan `"UZS"` |
| `discount_amount` | integer | ❌ yo'q | Chegirma narxi, so'mda. Berilsa `amount`dan kichik va bir xil valyutada bo'lishi shart |
| `slug` | string | ❌ yo'q | Bo'sh qoldirilsa `name_uz`dan avtomatik hosil qilinadi |
| `is_available` | `"true"`/`"false"` | ❌ yo'q | Berilmasa `true` deb olinadi |
| `rating` | number | ❌ yo'q | 1–5, berilmasa `1` |
| `stock` | integer | ❌ yo'q | Berilmasa `0` |
| `tag_uz` | string | ❌ yo'q | Belgi/badge, masalan `"bestseller"` (o'zbekcha, ixtiyoriy) |
| `tag_eng` | string | ❌ yo'q | Belgi/badge (inglizcha, ixtiyoriy) |
| `tag_ru` | string | ❌ yo'q | Belgi/badge (ruscha, ixtiyoriy) |
| `images` | file (bir nechta) | ❌ yo'q | Bir nechta faylni **bir xil `images` maydon nomi bilan** yuboring; eng ko'pi bilan 5 ta |

> Ko'p faylni bitta form-data maydonida yuborish: `FormData.append('images', file1); FormData.append('images', file2); ...` (brauzer/`fetch`da bir nechta marta shu nomda `append` qiling — array belgisi `images[]` shart emas, backend `images` nomidagi barcha fayllarni oladi).

**Rasm cheklovi:** har bir rasm — maks. 3MB, formatlar: `jpeg`/`png`/`webp` (categorydagi bilan bir xil).

**Muvaffaqiyatli javob — `201 Created`:** `{ "data": <Product obyekti — public shakl, lang=uz> }`

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | `name_uz`/`name_eng`/`name_ru`/`category_id` bo'sh yoki noto'g'ri, `amount`/`discount_amount` noto'g'ri yoki chegirma asosiy narxdan katta, `rating` diapazondan tashqari, 5 tadan ortiq rasm, rasm formati/hajmi noto'g'ri |
| 401 | token yo'q |
| 403 | admin emas |
| 409 | shu `slug` allaqachon band |
| 500 | server xatosi |

---

### 4.7 Mahsulotni yangilash

```
PUT /api/v1/products/{id}
```

🔒 **Faqat admin**

**Content-Type:** `application/json`

**Body** (barcha maydonlar ixtiyoriy — faqat yubormoqchi bo'lgan maydonlarni jo'nating, qolganlari o'zgarmaydi):
```json
{
  "name_uz": "Yangi nom",
  "name_eng": "New name",
  "name_ru": "Новое название",
  "description_uz": "Yangi tavsif",
  "description_eng": "New description",
  "description_ru": "Новое описание",
  "category_id": "boshqa-uuid",
  "amount": 160000,
  "currency": "UZS",
  "discount_amount": 130000,
  "clear_discount": false,
  "slug": "yangi-slug",
  "is_available": true,
  "rating": 4.8,
  "stock": 20,
  "sold_count": 40,
  "tag_uz": "bestseller",
  "tag_eng": "Bestseller",
  "tag_ru": "хит продаж",
  "clear_tag_uz": false,
  "clear_tag_eng": false,
  "clear_tag_ru": false
}
```

> Diqqat: bu endpoint **JSON body** qabul qiladi (rasm yangilash uchun `multipart/form-data` emas — hozircha rasmlarni yangilash uchun alohida endpoint yo'q). `category_id` yuborilsa, backend uni ham mavjudligiga tekshiradi. Nomni yangilashda `name_uz`/`name_eng`/`name_ru`dan **kamida bittasini** yuborsangiz, backend o'zgarmagan tillarni joriy qiymati bilan birga qayta tekshiradi — shuning uchun agar 3 tildan birortasini yangilamoqchi bo'lsangiz ham, xavfsizroq usul barcha 3 tilni birga yuborishdir.
>
> Maxsus bayroqlar: `clear_discount: true` — chegirmani butunlay o'chiradi (`discount_amount`ni yubormasdan); `clear_tag_uz`/`clear_tag_eng`/`clear_tag_ru: true` — mos tildagi tag'ni `null` qiladi. Bular berilmasa, mos maydon yuborilgan taqdirdagina o'zgaradi.

**Javob — `200 OK`:** `{ "data": null }`

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | validatsiya xatosi (bo'sh nom, noto'g'ri narx/chegirma va h.k.) |
| 401 | token yo'q |
| 403 | admin emas |
| 404 | mahsulot topilmadi |
| 409 | yangi `slug` allaqachon band |
| 500 | server xatosi |

---

### 4.8 Mahsulotni o'chirish

```
DELETE /api/v1/products/{id}
```

🔒 **Faqat admin**

- Bu **soft delete** — `deleted_at` belgilanadi, yozuv bazadan o'chmaydi. O'chirilgan mahsulot oddiy `GET /products` ro'yxatida chiqmaydi, lekin `GET /products/admin` orqali ko'rish mumkin.

**Javob — `200 OK`:**
```json
{ "data": "Mahsulot o'chirildi" }
```

**Xatoliklar:** `401`, `403`, `500`

---

## 5. Eventlar (Events)

Bosh sahifadagi banner/aksiya bloklari (masalan "Bugungi taklif — Sevimlilar uchun gullar") uchun. Prefiks: **`/api/v1/events`**

`eyebrow`, `title`, `subtitle`, `cta` — to'rttasi ham endi **3 tilda** (`uz`, `eng`, `ru`) saqlanadi (product/category bilan bir xil qoida). Ommaviy endpointlar `?lang=` query parametriga qarab **bitta tildagi** javob qaytaradi; admin endpointi (`/events/admin`) esa **har doim barcha 3 tilni** to'liq qaytaradi. Til mexanizmi — [4.0](#40-til-lang-qanday-ishlaydi)ga qarang: `?lang=uz|eng|ru`, berilmasa yoki noto'g'ri bo'lsa `uz` (default), so'ralgan tilda qiymat bo'sh bo'lsa `uz`ga fallback.

### Event obyekti — ommaviy (public) javob shakli

```json
{
  "id": "uuid",
  "eyebrow": "Bugungi taklif",
  "title": "Sevimlilar uchun gullar",
  "subtitle": "Bugun buyurtma bering, bugun yetkazamiz",
  "cta": "Mahsulotlarni ko'rish",
  "image": "https://res.cloudinary.com/.../event-images/....jpg",
  "category_id": "uuid",
  "is_root": true,
  "created_at": "2026-08-18T10:00:00Z",
  "updated_at": "2026-08-18T10:00:00Z"
}
```

### Event obyekti — admin javob shakli (`GET /events/admin`)

```json
{
  "id": "uuid",
  "eyebrow_uz": "Bugungi taklif",
  "eyebrow_eng": "Today's offer",
  "eyebrow_ru": "Предложение дня",
  "title_uz": "Sevimlilar uchun gullar",
  "title_eng": "Flowers for your loved ones",
  "title_ru": "Цветы для любимых",
  "subtitle_uz": "Bugun buyurtma bering, bugun yetkazamiz",
  "subtitle_eng": "Order today, delivered today",
  "subtitle_ru": "Закажите сегодня — доставим сегодня",
  "cta_uz": "Mahsulotlarni ko'rish",
  "cta_eng": "View products",
  "cta_ru": "Смотреть товары",
  "image": "https://res.cloudinary.com/.../event-images/....jpg",
  "category_id": "uuid",
  "is_root": true,
  "created_at": "2026-08-18T10:00:00Z",
  "updated_at": "2026-08-18T10:00:00Z",
  "deleted_at": null
}
```

- `image` — Cloudinary'ga yuklangan rasmning to'liq CDN URL'i (local `/images/...` fayl yo'li emas — bu maydonga to'g'ridan-to'g'ri backenddan qaytgan URL keladi, frontendda `<img src>` sifatida shuni ishlating).
- `category_id` — event qaysi kategoriyaga tegishli ekanligi. **Create va update paytida backend bu ID chindan mavjud kategoriyaga tegishli ekanligini tekshiradi** — mavjud bo'lmagan/noto'g'ri `category_id` yuborilsa `400` xato qaytadi.
- `is_root` — `true` bo'lsa, `GET /events` va `GET /events/admin` ro'yxatlarida **birinchi bo'lib** chiqadi (backendda `ORDER BY is_root DESC, created_at DESC`). Bir nechta event `is_root: true` bo'lishi mumkin — ular orasida eng yangisi birinchi keladi.
- `title` — yaratishda **barcha 3 til majburiy** (bo'sh bo'lsa `400`). `eyebrow`/`subtitle`/`cta` — ixtiyoriy (bo'sh string bo'lishi mumkin).

---

### 5.1 Eventlar ro'yxatini olish (public)

```
GET /api/v1/events?lang=<uz|eng|ru>
```

- Auth talab qilinmaydi.
- `lang` — ixtiyoriy, default `uz`.
- Faqat **o'chirilmagan** (`deleted_at IS NULL`) eventlarni qaytaradi — bosh sahifada shundan foydalaning.

**Javob — `200 OK`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "eyebrow": "Bugungi taklif",
      "title": "Sevimlilar uchun gullar",
      "subtitle": "Bugun buyurtma bering, bugun yetkazamiz",
      "cta": "Mahsulotlarni ko'rish",
      "image": "https://res.cloudinary.com/.../gul2.jpg",
      "category_id": "uuid",
      "is_root": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

---

### 5.2 Bitta eventni olish

```
GET /api/v1/events/{id}?lang=<uz|eng|ru>
```

- Auth talab qilinmaydi.
- `lang` — ixtiyoriy, default `uz`.

**Javob — `200 OK`:**
```json
{ "data": { "id": "uuid", "eyebrow": "...", "title": "...", "...": "..." } }
```

**Xatoliklar:** `404` — event topilmadi (yoki o'chirilgan)

---

### 5.3 Eventlarni olish — admin (o'chirilganlar bilan birga)

```
GET /api/v1/events/admin
```

🔒 **Faqat admin**

- Oddiy `/events`dan farqi: soft-delete qilingan eventlarni ham qaytaradi va **har doim barcha 3 tilni to'liq** qaytaradi (`lang` qabul qilinmaydi — yuqoridagi admin shaklga qarang). Har bir elementda qo'shimcha `deleted_at` maydoni bo'ladi (o'chirilmagan bo'lsa `null`, o'chirilgan bo'lsa sana).

**Xatoliklar:** `401` (token yo'q), `403` (admin emas)

---

### 5.4 Yangi event yaratish

```
POST /api/v1/events
```

🔒 **Faqat admin**

**Content-Type:** `multipart/form-data`

| Maydon | Turi | Majburiymi | Izoh |
|---|---|---|---|
| `eyebrow_uz` | string | ❌ yo'q | Kichik ustki matn (o'zbekcha) |
| `eyebrow_eng` | string | ❌ yo'q | Kichik ustki matn (inglizcha) |
| `eyebrow_ru` | string | ❌ yo'q | Kichik ustki matn (ruscha) |
| `title_uz` | string | ✅ ha | Sarlavha (o'zbekcha) |
| `title_eng` | string | ✅ ha | Sarlavha (inglizcha) |
| `title_ru` | string | ✅ ha | Sarlavha (ruscha) |
| `subtitle_uz` | string | ❌ yo'q | Sarlavha ostidagi matn (o'zbekcha) |
| `subtitle_eng` | string | ❌ yo'q | Sarlavha ostidagi matn (inglizcha) |
| `subtitle_ru` | string | ❌ yo'q | Sarlavha ostidagi matn (ruscha) |
| `cta_uz` | string | ❌ yo'q | Tugma matni, masalan "Mahsulotlarni ko'rish" (o'zbekcha) |
| `cta_eng` | string | ❌ yo'q | Tugma matni (inglizcha) |
| `cta_ru` | string | ❌ yo'q | Tugma matni (ruscha) |
| `category_id` | string (uuid) | ✅ ha | Mavjud kategoriya ID'si — backend tekshiradi |
| `is_root` | `"true"` / `"false"` | ❌ yo'q | Berilmasa `false` deb olinadi |
| `image` | file | ✅ ha | Event rasmi — majburiy |

**Rasm cheklovi:** maks. 3MB, formatlar `jpeg`/`png`/`webp` (categories/products bilan bir xil — [6-bo'lim](#6-fayl-yuklash-haqida-umumiy-qoidalar)ga qarang).

**Muvaffaqiyatli javob — `201 Created`:** `{ "data": <Event obyekti — public shakl, lang=uz> }`

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | `title_uz`/`title_eng`/`title_ru`dan biri bo'sh, `category_id` bo'sh/mavjud bo'lmagan kategoriyaga ishora qilyapti, `image` yuborilmagan yoki formati/hajmi noto'g'ri |
| 401 | token yo'q |
| 403 | admin emas |
| 500 | server xatosi |

---

### 5.5 Eventni yangilash

```
PUT /api/v1/events/{id}
```

🔒 **Faqat admin**

**Content-Type:** `application/json`

**Body** (barcha maydonlar ixtiyoriy — faqat yubormoqchi bo'lgan tillarni jo'nating, qolganlari o'zgarmaydi):
```json
{
  "eyebrow_uz": "Yangi eyebrow",
  "eyebrow_eng": "New eyebrow",
  "eyebrow_ru": "Новый eyebrow",
  "title_uz": "Yangi sarlavha",
  "title_eng": "New title",
  "title_ru": "Новый заголовок",
  "subtitle_uz": "Yangi subtitle",
  "subtitle_eng": "New subtitle",
  "subtitle_ru": "Новый подзаголовок",
  "cta_uz": "Yangi tugma matni",
  "cta_eng": "New button text",
  "cta_ru": "Новый текст кнопки",
  "category_id": "boshqa-uuid",
  "is_root": false
}
```

> Diqqat: bu endpoint **JSON body** qabul qiladi. Rasmni bu orqali yangilab bo'lmaydi (hozircha rasmni yangilash uchun alohida endpoint yo'q). `category_id` yuborilsa, backend uni ham mavjudligiga tekshiradi. Nomni (`title`) yangilashda `title_uz`/`title_eng`/`title_ru`dan **kamida bittasini** yuborsangiz, backend o'zgarmagan tillarni joriy qiymati bilan birga qayta tekshiradi (uchalasi ham bo'sh bo'lmasligi kerak) — shuning uchun xavfsizroq usul barcha 3 tilni birga yuborishdir.

**Javob — `200 OK`:**
```json
{ "data": null }
```

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | `title_uz`/`title_eng`/`title_ru` bo'sh string sifatida yuborilgan, yoki `category_id` mavjud bo'lmagan kategoriyaga ishora qilyapti |
| 401 | token yo'q |
| 403 | admin emas |
| 404 | event topilmadi |
| 500 | server xatosi |

---

### 5.6 Eventni o'chirish

```
DELETE /api/v1/events/{id}
```

🔒 **Faqat admin**

- Bu **soft delete** — `deleted_at` belgilanadi, yozuv bazadan o'chmaydi. O'chirilgan event oddiy `GET /events` ro'yxatida chiqmaydi, lekin `GET /events/admin` orqali (o'chirilgan holatda, `deleted_at` sana bilan) ko'rinadi.

**Javob — `200 OK`:**
```json
{ "data": "Event o'chirildi" }
```

**Xatoliklar:** `401`, `403`, `404` (event topilmadi), `500`

---

## 6. Fayl yuklash haqida umumiy qoidalar

Categories, Products va Events — barchasida rasm quyidagi qoidalarga bo'ysunadi:

- **Maksimal hajm:** 3 MB (`multipart` form umumiy hajm chegarasi ham 10MB, lekin rasm faylining o'zi 3MB dan oshmasligi kerak)
- **Ruxsat etilgan formatlar:** `image/jpeg`, `image/png`, `image/webp`
- Rasmlar **Cloudinary**'ga yuklanadi, qaytadigan URL — to'liq CDN havolasi (frontendda to'g'ridan-to'g'ri `<img src>` sifatida ishlatavering).

---

## 7. Rollar (Roles)

| Rol | Qanday beriladi | Nima qila oladi |
|---|---|---|
| `customer` | Har bir yangi `register` shu rolda yaratiladi (default) | Faqat public GET endpointlar (`/categories`, `/events`, `/auth/me`) |
| `admin` | Faqat DB orqali qo'lda beriladi, frontendda tanlash yo'q | Category/Product/Event yaratish-o'chirish-yangilash, `/categories/admin`, `/events/admin` |

Frontendda: login qilingandan keyin `GET /auth/me` chaqirib, javobdagi `role` maydoniga qarab admin panelni ko'rsatish/yashirishni belgilang.

---

## 8. Tezkor cheat-sheet

| Endpoint | Method | Auth | Rol |
|---|---|---|---|
| `/api/v1/auth/register` | POST | ❌ | — |
| `/api/v1/auth/login` | POST | ❌ | — |
| `/api/v1/auth/refresh` | POST | ❌ | — |
| `/api/v1/auth/me` | GET | ✅ | har qanday |
| `/api/v1/categories` | GET | ❌ | — |
| `/api/v1/categories/{id}` | GET | ❌ | — |
| `/api/v1/categories` | POST | ✅ | admin |
| `/api/v1/categories/{id}` | PUT | ✅ | admin |
| `/api/v1/categories/{id}` | DELETE | ✅ | admin |
| `/api/v1/categories/admin` | GET | ✅ | admin |
| `/api/v1/categories/{id}/products` | GET | ❌ | — |
| `/api/v1/products` | GET | ❌ | — |
| `/api/v1/products/{id}` | GET | ❌ | — |
| `/api/v1/products/slug/{slug}` | GET | ❌ | — |
| `/api/v1/products` | POST | ✅ | admin |
| `/api/v1/products/{id}` | PUT | ✅ | admin |
| `/api/v1/products/{id}` | DELETE | ✅ | admin |
| `/api/v1/products/admin` | GET | ✅ | admin |
| `/api/v1/events` | GET | ❌ | — |
| `/api/v1/events/{id}` | GET | ❌ | — |
| `/api/v1/events` | POST | ✅ | admin |
| `/api/v1/events/{id}` | PUT | ✅ | admin |
| `/api/v1/events/{id}` | DELETE | ✅ | admin |
| `/api/v1/events/admin` | GET | ✅ | admin |

---

## 9. Hali tayyor bo'lmagan (backendda yo'q) narsalar

Frontend ishini rejalashtirishda hisobga oling:

- ❌ Mahsulotga izoh/sharh (comments) — foydalanuvchi sotib olgandan keyin izoh qoldirishi kelajakda qo'shiladi, hozircha yo'q
- ❌ Mahsulot rasmlarini alohida yangilash (PUT productda faqat matn/raqam maydonlari o'zgaradi, `images` emas — rasmlarni o'zgartirish uchun alohida endpoint hali yo'q)
- ❌ Kategoriya ierarxiyasi (parent/child daraxti) — kategoriyada `parent_id` degan maydon umuman yo'q, barcha kategoriyalar "flat" ro'yxat
- ❌ Event rasmini alohida yangilash (PUT eventda faqat matn maydonlari o'zgaradi, rasm emas)
- ❌ Savat, buyurtma (order) — `internal/ordering` papkasi mavjud, lekin ichida hali HTTP endpoint yo'q
- ❌ Parolni tiklash / o'zgartirish, logout endpointi
