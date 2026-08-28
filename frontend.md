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

- Muvaffaqiyatli bo'lsa → `data` to'ldiriladi, `error` bo'lmaydi.
- Xatolik bo'lsa → `error` maydonida matn bo'ladi, `data` bo'lmaydi (HTTP status kodiga qarang, pastda jadval bor).

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
| 401 | refresh token yaroqsiz yoki muddati o'tgan → foydalanuvchini qayta login sahifasiga yo'naltiring |

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

### Category obyekti (response shakli)

```json
{
  "id": "uuid",
  "name": "Elektronika",
  "parent_id": null,
  "created_at": "2026-08-18T10:00:00Z",
  "updated_at": "2026-08-18T10:00:00Z"
}
```

> **Muhim:** `parent_id` maydoni DTO'da bor, lekin hozirgi backend logikasida hech qachon to'ldirilmaydi — har doim `null`/mavjud emas bo'lib qaytadi. Ya'ni **kategoriyalar ierarxiyasi (parent/child daraxti) hozircha backendda ishlamaydi**, barcha kategoriyalar "flat" (tekis) ro'yxat sifatida keladi. Rasm URL'i (`image_url`) response'da yo'qligiga ham e'tibor bering — bu quyida alohida ko'rsatilgan.

Yuqoridagi namunada ko'rinmasa-da, category yaratishda rasm yuklanadi, lekin hozirgi `CreateCategoryResponse` javobida **`image_url` maydoni yo'q** (backendda saqlanadi, lekin frontendga hali qaytarilmayapti). Kategoriya rasmini ko'rsatish kerak bo'lsa, hozircha buni backend jamoasiga bildirish kerak.

---

### 3.1 Kategoriyalar ro'yxatini olish (public)

```
GET /api/v1/categories?search=<matn>
```

- Auth talab qilinmaydi.
- `search` — ixtiyoriy query parametr, nom bo'yicha qidirish uchun.
- Faqat **o'chirilmagan** (`deleted_at IS NULL`) kategoriyalarni qaytaradi.

**Javob — `200 OK`:**
```json
{
  "data": [
    { "id": "uuid", "name": "Elektronika", "image_url": "url", "created_at": "...", "updated_at": "..." }
  ]
}
```

---

### 3.2 Bitta kategoriyani olish

```
GET /api/v1/categories/{id}
```

- Auth talab qilinmaydi.

**Javob — `200 OK`:**
```json
{ "data": { "id": "uuid", "name": "Elektronika", "created_at": "...", "updated_at": "..." } }
```

---

### 3.3 Kategoriyalarni olish — admin (o'chirilganlar bilan birga)

```
GET /api/v1/categories/admin?search=<matn>
```

🔒 **Faqat admin** (`Authorization: Bearer <access_token>`, foydalanuvchi roli `admin` bo'lishi shart)

- Oddiy `/categories`dan farqi: soft-delete qilingan (o'chirilgan) kategoriyalarni ham qaytaradi. Admin panelda "o'chirilgan kategoriyalar" bo'limi uchun ishlating.

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
| `name` | string | ✅ ha | Kategoriya nomi |
| `image` | file | ✅ ha | Kategoriya rasmi — **majburiy**, bo'lmasa 400 xato qaytadi |

**Rasm cheklovlari (categories va products uchun bir xil):**
- Maksimal hajm: **3 MB**
- Ruxsat etilgan formatlar: `image/jpeg`, `image/png`, `image/webp`
- Bulardan tashqarisi (masalan gif, boshqa hajm) → `400` xato

**Muvaffaqiyatli javob — `201 Created`:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Elektronika",
    "created_at": "2026-08-18T10:00:00Z",
    "updated_at": "2026-08-18T10:00:00Z"
  }
}
```

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | `name` bo'sh, `image` yuborilmagan/noto'g'ri format/3MB dan katta |
| 401 | token yo'q |
| 403 | admin emas |
| 409 | shu nomdagi kategoriya allaqachon mavjud |

---

### 3.5 Kategoriyani yangilash

```
PUT /api/v1/categories/{id}
```

🔒 **Faqat admin**

**Content-Type:** `application/json`

**Body:**
```json
{
  "name": "Yangi nom"
}
```

> Diqqat: bu endpoint **JSON body** qabul qiladi (rasm yangilash uchun `multipart/form-data` emas!). Hozircha faqat `name` maydonini yangilash mumkin — rasmni yangilash uchun alohida endpoint yo'q.

**Javob — `200 OK`:**
```json
{ "data": null }
```

**Xatoliklar:** `401`, `403`, `500` (backendda 400/404 mapping hozircha to'liq ulanmagan — bo'sh nom yoki topilmagan ID kelsa ham xatolik matni `error` maydonida keladi, lekin status kodi 500 bo'lishi mumkin — frontendda `error` matnini ham ko'rsating).

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

Gullar do'koni mahsuloti — narx, chegirma, rasmlar (5 tagacha), Instagram video, buket xususiyatlari (rang, poya soni, qadoqlash, saqlanish muddati) va h.k. bilan.

### Product obyekti (response shakli)

```json
{
  "id": "uuid",
  "name": "51 ta qizil atirgul",
  "description": "Premium Ekvador atirgullaridan yig'ilgan buket",
  "images": [
    "https://res.cloudinary.com/.../product-images/....jpg",
    "https://res.cloudinary.com/.../product-images/....jpg"
  ],
  "video_url_youtube": "https://www.youtube.com/watch?v=xxxxxxx",
  "video_url_instagram": "https://www.instagram.com/reel/xxxxxxx/",
  "category_id": "uuid",
  "price_amount": 15000000,
  "price_currency": "UZS",
  "discount_amount": 12000000,
  "final_price_amount": 12000000,
  "slug": "51-ta-qizil-atirgul",
  "is_available": true,
  "rating": 4.5,
  "stock": 12,
  "sold_count": 34,
  "flower_types": ["rose"],
  "color": "qizil",
  "stem_count": 51,
  "packaging_type": "box",
  "freshness_lifespan": 5,
  "care_instructions": "Har kuni suvini almashtiring",
  "occasions": ["tug'ilgan kun", "yubiley"],
  "allow_custom_card": null,
  "compatible_addons": ["shokolad qutisi"],
  "created_at": "2026-08-18T10:00:00Z",
  "updated_at": "2026-08-18T10:00:00Z"
}
```

Muhim izohlar:
- **`images`** — Cloudinay CDN URL'lari ro'yxati, **eng ko'pi bilan 5 ta**. Bo'sh bo'lishi ham mumkin (`[]`) — hozircha rasm majburiy emas.
- **`video_url_youtube`** / **`video_url_instagram`** — ikkalasi ham ixtiyoriy va bir-biridan mustaqil (bittasi, ikkalasi ham yoki hech biri bo'lmasligi mumkin). YouTube havolasi va Instagram video (reel/post) havolasi frontendda mos `<iframe>`/embed orqali ko'rsatiladi. Backend bu URL'larni tekshirmaydi va o'zgartirmaydi, xom string sifatida saqlaydi/qaytaradi. Berilmagan bo'lsa bo'sh string (`""`) qaytadi, `null` emas.
- **`price_amount` / `discount_amount` / `final_price_amount`** — hammasi eng kichik pul birligida (tiyin). `discount_amount` bo'lmasa, javobda bu maydon umuman ko'rinmaydi (`omitempty`) va `final_price_amount` = `price_amount` bilan teng bo'ladi. `discount_amount` bo'lsa, u har doim `price_amount`dan kichik bo'ladi (backend buni yaratish/yangilashda tekshiradi) va **narxni ko'rsatishda `final_price_amount`dan foydalaning** — u chegirma bor-yo'qligidan qat'iy nazar "hozir to'lanadigan narx"ni bildiradi.
- **`slug`** — URL uchun (masalan `/product/51-ta-qizil-atirgul`). Yaratishda yubormasangiz, backend `name`dan avtomatik hosil qiladi. Har bir mahsulotda **unikal** bo'lishi shart — band bo'lgan slug yuborilsa `409` qaytadi.
- **`rating`** — 1 dan 5 gacha, default `1`. Hozircha foydalanuvchi sharhlaridan avtomatik hisoblanmaydi — admin qo'lda kiritadi (izoh/sharh tizimi hali yo'q, pastga qarang).
- **`stock`** / **`sold_count`** — ombordagi son va sotilganlar soni. `is_available` bilan bir xil narsa emas: `stock=0` bo'lsa ham `is_available` alohida `true`/`false` bo'lishi mumkin — frontendda ikkalasini alohida hisobga oling ("tugadi" belgisi uchun `is_available`ni ishlating).
- **`flower_types`**, **`occasions`**, **`compatible_addons`** — tag ro'yxatlari (JSON massiv). Bo'lmasa `[]` bo'lib qaytadi, hech qachon `null` emas.
- **`packaging_type`** — enum: `"bucket"`, `"box"`, `"vase"`.
- **`freshness_lifespan`** — butun son, kunlarda, `1` dan `7` gacha, default `1`.
- **`care_instructions`** — ixtiyoriy, berilmasa `null`.
- **`allow_custom_card`** — hozircha **doim `null`** qaytadi. Bu — buyurtmaga tabrik kartochkasi qo'shish imkoniyati, keyinroq qo'shiladi. Frontendda hozircha bu maydonga tayanmang.
- **Sharhlar/izohlar (comments)** — hali backendda yo'q, product obyektida ham yo'q. Sotib olgan foydalanuvchilar tomonidan izoh yozish funksiyasi kelajakda alohida endpoint sifatida qo'shiladi.
- `category_id` — **backend create/update paytida bu ID chindan mavjud kategoriyaga tegishli ekanligini tekshiradi** (events bilan bir xil qoida) — mavjud bo'lmagan `category_id` yuborilsa `400`/`404` qaytishi mumkin (pastga qarang).

---

### 4.1 Mahsulotlar ro'yxatini olish (public)

```
GET /api/v1/products?search=<matn>&category_id=<uuid>&page=<son>&page_size=<son>
```

- Auth talab qilinmaydi.
- `search` — ixtiyoriy, nom bo'yicha qidirish (`ILIKE`).
- `category_id` — ixtiyoriy, faqat shu kategoriyaga tegishli mahsulotlarni qaytaradi. Ikkalasini birga ham berish mumkin.
- `page` — ixtiyoriy, sahifa raqami, **1 dan boshlanadi**. Berilmasa yoki `1`dan kichik bo'lsa `1` deb olinadi.
- `page_size` — ixtiyoriy, sahifadagi elementlar soni. Berilmasa `20`. Maksimal `100` — undan katta qiymat yuborilsa `100`ga qisqartiriladi.
- Faqat **o'chirilmagan** (`deleted_at IS NULL`) mahsulotlarni qaytaradi. `is_available=false` bo'lgan mahsulotlar ham shu ro'yxatda keladi (yashirilmaydi) — "tugagan" holatini frontendda `is_available` orqali ko'rsating.

**Javob — `200 OK`:**
```json
{
  "data": {
    "items": [ <Product obyekti>, ... ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 42,
      "total_pages": 3
    }
  }
}
```

> Diqqat: bu **ro'yxat qaytaradigan barcha `/products` endpointlarida bir xil shakl** (pastdagi 4.2 va 4.5 ham shu). Eski (pagination'siz) formatdan farqi: `data` endi to'g'ridan-to'g'ri massiv emas, balki `items` + `pagination` bo'lgan obyekt. Mahsulotlar ro'yxatini chizishda `data.items`ni, "keyingi sahifa" tugmasi uchun `data.pagination.total_pages`ni ishlating.

---

### 4.2 Kategoriya bo'yicha mahsulotlarni olish (public)

```
GET /api/v1/categories/{id}/products?search=<matn>&page=<son>&page_size=<son>
```

- Auth talab qilinmaydi.
- Xuddi `GET /products?category_id={id}` bilan bir xil natija — kategoriya sahifasida (masalan "Atirgullar" kategoriyasi) qulay bo'lishi uchun alohida yo'l sifatida ham ochilgan.
- `page` / `page_size` — 4.1 bilan bir xil qoidalar.

**Javob — `200 OK`:** 4.1dagi bilan bir xil `{ "data": { "items": [...], "pagination": {...} } }` shakli.

---

### 4.3 Bitta mahsulotni olish (ID bo'yicha)

```
GET /api/v1/products/{id}
```

- Auth talab qilinmaydi.

**Javob — `200 OK`:** `{ "data": <Product obyekti> }`

**Xatoliklar:** `404` — mahsulot topilmadi (yoki o'chirilgan)

---

### 4.4 Bitta mahsulotni olish (slug bo'yicha)

```
GET /api/v1/products/slug/{slug}
```

- Auth talab qilinmaydi. Mahsulot sahifasi (`/product/51-ta-qizil-atirgul`) uchun SEO-friendly URL'da shundan foydalaning.

**Javob — `200 OK`:** `{ "data": <Product obyekti> }`

**Xatoliklar:** `404` — mahsulot topilmadi

---

### 4.5 Mahsulotlarni olish — admin (o'chirilganlar bilan birga)

```
GET /api/v1/products/admin?search=<matn>&category_id=<uuid>&page=<son>&page_size=<son>
```

🔒 **Faqat admin**

- Oddiy `/products`dan farqi: soft-delete qilingan mahsulotlarni ham qaytaradi. Har bir elementda qo'shimcha `deleted_at` maydoni bo'ladi (o'chirilmagan bo'lsa `null`).
- `page` / `page_size` — 4.1 bilan bir xil qoidalar. Javob shakli ham bir xil: `{ "data": { "items": [...], "pagination": {...} } }`.

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
| `name` | string | ✅ ha | Mahsulot nomi |
| `description` | string | ❌ yo'q | Tavsif |
| `category_id` | string (uuid) | ✅ ha | Mavjud kategoriya ID'si — backend tekshiradi |
| `amount` | integer | ✅ ha | Narx, **tiyinda** (eng kichik pul birligi) |
| `currency` | string | ✅ ha | Valyuta kodi, masalan `"UZS"` |
| `discount_amount` | integer | ❌ yo'q | Chegirma narxi, tiyinda. Berilsa `amount`dan kichik va bir xil valyutada bo'lishi shart |
| `slug` | string | ❌ yo'q | Bo'sh qoldirilsa `name`dan avtomatik hosil qilinadi |
| `video_url_youtube` | string | ❌ yo'q | YouTube video havolasi |
| `video_url_instagram` | string | ❌ yo'q | Instagram video havolasi |
| `is_available` | `"true"`/`"false"` | ❌ yo'q | Berilmasa `true` deb olinadi |
| `rating` | number | ❌ yo'q | 1–5, berilmasa `1` |
| `stock` | integer | ❌ yo'q | Berilmasa `0` |
| `flower_types` | string | ❌ yo'q | Vergul bilan ajratilgan (masalan `"rose,tulip"`) |
| `color` | string | ❌ yo'q | Rangi |
| `stem_count` | integer | ❌ yo'q | Buketdagi gullar soni |
| `packaging_type` | string | ✅ ha | `"bucket"` \| `"box"` \| `"vase"` |
| `freshness_lifespan` | integer | ❌ yo'q | 1–7 kun, berilmasa `1` |
| `care_instructions` | string | ❌ yo'q | Parvarish ko'rsatmasi |
| `occasions` | string | ❌ yo'q | Vergul bilan ajratilgan tag'lar (masalan `"tug'ilgan kun,to'y"`) |
| `compatible_addons` | string | ❌ yo'q | Vergul bilan ajratilgan (masalan `"shokolad qutisi,otkritka"`) |
| `images` | file (bir nechta) | ❌ yo'q | Bir nechta faylni **bir xil `images` maydon nomi bilan** yuboring; eng ko'pi bilan 5 ta |

> Ko'p faylni bitta form-data maydonida yuborish: `FormData.append('images', file1); FormData.append('images', file2); ...` (brauzer/`fetch`da bir nechta marta shu nomda `append` qiling — array belgisi `images[]` shart emas, backend `images` nomidagi barcha fayllarni oladi).

**Rasm cheklovi:** har bir rasm — maks. 3MB, formatlar: `jpeg`/`png`/`webp` (categorydagi bilan bir xil).

**Muvaffaqiyatli javob — `201 Created`:** `{ "data": <Product obyekti> }`

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | `name`/`category_id`/`packaging_type` bo'sh yoki noto'g'ri, `amount`/`discount_amount` noto'g'ri yoki chegirma asosiy narxdan katta, `rating`/`freshness_lifespan` diapazondan tashqari, 5 tadan ortiq rasm, rasm formati/hajmi noto'g'ri |
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
  "name": "Yangi nom",
  "description": "Yangi tavsif",
  "video_url_youtube": "https://www.youtube.com/watch?v=yyyyyyy",
  "video_url_instagram": "https://www.instagram.com/reel/yyyyyyy/",
  "category_id": "boshqa-uuid",
  "amount": 16000000,
  "currency": "UZS",
  "discount_amount": 13000000,
  "clear_discount": false,
  "slug": "yangi-slug",
  "is_available": true,
  "rating": 4.8,
  "stock": 20,
  "sold_count": 40,
  "flower_types": ["rose", "peony"],
  "color": "pushti",
  "stem_count": 25,
  "packaging_type": "vase",
  "freshness_lifespan": 6,
  "care_instructions": "Sovuq joyda saqlang",
  "clear_care_instructions": false,
  "occasions": ["yubiley"],
  "compatible_addons": ["shokolad qutisi"]
}
```

> Diqqat: bu endpoint **JSON body** qabul qiladi (rasm yangilash uchun `multipart/form-data` emas — hozircha rasmlarni yangilash uchun alohida endpoint yo'q). `category_id` yuborilsa, backend uni ham mavjudligiga tekshiradi.
>
> Ikkita maxsus bayroq bor: `clear_discount: true` — chegirmani butunlay o'chiradi (`discount_amount`ni yubormasdan); `clear_care_instructions: true` — parvarish ko'rsatmasini `null` qiladi. Bu ikkisi berilmasa, mos `*_amount`/`care_instructions` maydoni yuborilgan taqdirdagina o'zgaradi.

**Javob — `200 OK`:** `{ "data": null }`

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | validatsiya xatosi (bo'sh nom, noto'g'ri narx/chegirma, noto'g'ri enum qiymati va h.k.) |
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

### Event obyekti (response shakli)

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

- `image` — Cloudinary'ga yuklangan rasmning to'liq CDN URL'i (local `/images/...` fayl yo'li emas — bu maydonga to'g'ridan-to'g'ri backenddan qaytgan URL keladi, frontendda `<img src>` sifatida shuni ishlating).
- `category_id` — event qaysi kategoriyaga tegishli ekanligi. **Create va update paytida backend bu ID chindan mavjud kategoriyaga tegishli ekanligini tekshiradi** — mavjud bo'lmagan/noto'g'ri `category_id` yuborilsa `400` xato qaytadi.
- `is_root` — `true` bo'lsa, `GET /events` va `GET /events/admin` ro'yxatlarida **birinchi bo'lib** chiqadi (backendda `ORDER BY is_root DESC, created_at DESC`). Bir nechta event `is_root: true` bo'lishi mumkin — ular orasida eng yangisi birinchi keladi.

---

### 5.1 Eventlar ro'yxatini olish (public)

```
GET /api/v1/events
```

- Auth talab qilinmaydi.
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
GET /api/v1/events/{id}
```

- Auth talab qilinmaydi.

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

- Oddiy `/events`dan farqi: soft-delete qilingan eventlarni ham qaytaradi. Har bir elementda qo'shimcha `deleted_at` maydoni bo'ladi (o'chirilmagan bo'lsa `null`, o'chirilgan bo'lsa sana).

**Javob — `200 OK`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "eyebrow": "...", "title": "...", "subtitle": "...", "cta": "...",
      "image": "...", "category_id": "uuid", "is_root": false,
      "created_at": "...", "updated_at": "...",
      "deleted_at": null
    }
  ]
}
```

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
| `eyebrow` | string | ❌ yo'q | Kichik ustki matn |
| `title` | string | ✅ ha | Sarlavha |
| `subtitle` | string | ❌ yo'q | Sarlavha ostidagi matn |
| `cta` | string | ❌ yo'q | Tugma matni (masalan "Mahsulotlarni ko'rish") |
| `category_id` | string (uuid) | ✅ ha | Mavjud kategoriya ID'si — backend tekshiradi |
| `is_root` | `"true"` / `"false"` | ❌ yo'q | Berilmasa `false` deb olinadi |
| `image` | file | ✅ ha | Event rasmi — majburiy |

**Rasm cheklovi:** maks. 3MB, formatlar `jpeg`/`png`/`webp` (categories/products bilan bir xil — [5-bo'lim](#6-fayl-yuklash-haqida-umumiy-qoidalar)ga qarang).

**Muvaffaqiyatli javob — `201 Created`:**
```json
{
  "data": {
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
}
```

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | `title` bo'sh, `category_id` bo'sh/mavjud bo'lmagan kategoriyaga ishora qilyapti, `image` yuborilmagan yoki formati/hajmi noto'g'ri |
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

**Body** (barcha maydonlar ixtiyoriy — faqat yubormoqchi bo'lgan maydonlarni jo'nating, qolganlari o'zgarmaydi):
```json
{
  "eyebrow": "Yangi eyebrow",
  "title": "Yangi sarlavha",
  "subtitle": "Yangi subtitle",
  "cta": "Yangi tugma matni",
  "category_id": "boshqa-uuid",
  "is_root": false
}
```

> Diqqat: bu endpoint **JSON body** qabul qiladi. Rasmni bu orqali yangilab bo'lmaydi (hozircha rasmni yangilash uchun alohida endpoint yo'q). `category_id` yuborilsa, backend uni ham mavjudligiga tekshiradi.

**Javob — `200 OK`:**
```json
{ "data": null }
```

**Xatoliklar:**
| Status | Sabab |
|---|---|
| 400 | `title` bo'sh string sifatida yuborilgan, yoki `category_id` mavjud bo'lmagan kategoriyaga ishora qilyapti |
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
- ❌ `allow_custom_card` (buyurtmaga tabrik kartochkasi) — product obyektida maydon bor, lekin har doim `null`, hali to'liq funksiya emas
- ❌ Mahsulot rasmlarini alohida yangilash (PUT productda faqat matn/raqam maydonlari o'zgaradi, `images` emas — rasmlarni o'zgartirish uchun alohida endpoint hali yo'q)
- ❌ Kategoriya ierarxiyasi (parent/child daraxti) — `parent_id` maydoni bor, lekin ishlamaydi
- ❌ Category rasm URL'i response'da yo'q
- ❌ Event rasmini alohida yangilash (PUT eventda faqat matn maydonlari o'zgaradi, rasm emas)
- ❌ Savat, buyurtma (order) — `internal/ordering` papkasi mavjud, lekin ichida hali HTTP endpoint yo'q
- ❌ Parolni tiklash / o'zgartirish, logout endpointi
