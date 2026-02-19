<![CDATA[# 📘 الدليل الشامل لمشروع بوابة جمعية الحاسوب (CSA Portal)
## من الصفر إلى النشر — شرح كل ملف وكل سطر

> هذا الدليل مكتوب على نمط كتب أكاديمية حسوب. يشرح المشروع بالكامل لشخص يريد فهمه وتنفيذه من الصفر.

---

# الفصل الأول: نظرة عامة على المشروع

## 1.1 ما هو هذا المشروع؟

بوابة جمعية الحاسوب (CSA Portal) هي **منصة ويب متكاملة** مبنية بمعمارية Full-Stack حديثة. تُمكّن جمعية طلابية من:

- عرض **الأخبار والأحداث** للزوار بدون تسجيل دخول
- إدارة **الأعضاء والمحتوى** من لوحة تحكم محمية
- **تخصيص الهوية البصرية** (ألوان، خطوط، أنماط خلفية، أيقونات)
- **نشر المشروع** على Railway أو أي خادم Docker

## 1.2 المعمارية العامة

```
┌─────────────────────────────────────────────────────┐
│                    المتصفح (Client)                   │
│  React 19 + TypeScript + Tailwind CSS + Lucide Icons │
│                                                       │
│  index.html → index.tsx → App.tsx → Pages/Components  │
└───────────────┬───────────────────────────────────────┘
                │ HTTP (fetch API)
                ▼
┌─────────────────────────────────────────────────────┐
│               الخادم (Server)                         │
│  Express 5 + TypeScript + tsx Runtime                 │
│                                                       │
│  server/src/index.ts → API Routes → Prisma ORM       │
└───────────────┬───────────────────────────────────────┘
                │ SQL Queries
                ▼
┌─────────────────────────────────────────────────────┐
│             قاعدة البيانات                             │
│              SQLite (ملف واحد)                         │
│                                                       │
│  server/prisma/schema.prisma → data/csa.db            │
└─────────────────────────────────────────────────────┘
```

## 1.3 التقنيات المستخدمة

| الطبقة | التقنية | الإصدار | الغرض |
|--------|---------|---------|-------|
| الواجهة | React | 19.2 | بناء واجهة المستخدم التفاعلية |
| اللغة | TypeScript | 5.9 | أنواع بيانات آمنة |
| التنسيق | Tailwind CSS | 3.4 | تنسيق سريع بالأصناف |
| الأيقونات | Lucide React | 0.564 | مكتبة أيقونات حديثة |
| الخادم | Express | 5.2 | معالجة طلبات HTTP |
| قاعدة البيانات | SQLite + Prisma | 5.10 | تخزين البيانات |
| المصادقة | JWT | 9.0 | رموز الجلسات |
| التشفير | bcrypt | 6.0 | تشفير كلمات المرور |
| الذكاء الاصطناعي | Google Gemini | 1.41 | توليد محتوى ذكي |
| البناء | Vite | 6.0 | تجميع وتحزيم سريع |
| النشر | Docker + Railway | — | حاويات سحابية |

## 1.4 هيكل المجلدات

```
csa-portal/
├── 📄 index.html            ← صفحة HTML الوحيدة (SPA)
├── 📄 index.tsx              ← نقطة دخول React
├── 📄 App.tsx                ← المكوّن الجذري (التوجيه + الحالة)
├── 📄 types.ts               ← تعريفات TypeScript
├── 📄 constants.ts           ← البيانات الثابتة والترجمات
│
├── 📂 components/            ← مكوّنات مشتركة
│   ├── Navbar.tsx            ← شريط التنقل العلوي
│   ├── Footer.tsx            ← التذييل
│   └── ThemeManager.tsx      ← محرر الهوية البصرية
│
├── 📂 pages/                 ← صفحات التطبيق
│   ├── Home.tsx              ← الصفحة الرئيسية (الأخبار)
│   ├── About.tsx             ← عن الجمعية
│   ├── Events.tsx            ← الفعاليات
│   ├── Team.tsx              ← فريق العمل
│   ├── Contact.tsx           ← تواصل معنا
│   ├── Admin.tsx             ← لوحة تحكم المسؤولين
│   └── DeanDashboard.tsx     ← لوحة تحكم العميد
│
├── 📂 services/              ← خدمات الاتصال
│   ├── api.ts                ← عميل API المركزي
│   ├── settingsService.ts    ← حفظ الإعدادات محلياً
│   └── geminiService.ts      ← خدمة الذكاء الاصطناعي
│
├── 📂 utils/                 ← أدوات مساعدة
│   ├── styleEngine.ts        ← محرك الأنماط البصرية
│   └── themes.ts             ← ثيمات جاهزة
│
├── 📂 server/                ← الخادم الخلفي
│   ├── src/index.ts          ← نقطة دخول Express
│   ├── prisma/schema.prisma  ← مخطط قاعدة البيانات
│   └── .env                  ← متغيرات البيئة
│
├── 📄 package.json           ← التبعيات والأوامر
├── 📄 vite.config.ts         ← إعدادات أداة البناء
├── 📄 tsconfig.json          ← إعدادات TypeScript
├── 📄 tailwind.config.js     ← إعدادات Tailwind
├── 📄 postcss.config.js      ← إعدادات PostCSS
├── 📄 Dockerfile             ← حاوية Docker
├── 📄 docker-compose.yml     ← تشغيل بـ Docker Compose
└── 📄 .gitignore             ← ملفات مستثناة من Git
```

---

# الفصل الثاني: ملفات الإعداد والتهيئة

## 2.1 ملف `package.json` — قلب المشروع

هذا الملف يُعرّف المشروع ويحدد كل شيء: الاسم، الإصدار، التبعيات، وأوامر التشغيل.

```json
{
  "name": "csa---computer-science-association-portal",
  "private": true,
  "version": "0.0.0",
  "type": "module",
```

- **`"type": "module"`**: يُخبر Node.js أن هذا المشروع يستخدم **ES Modules** (أي `import/export`) بدلاً من CommonJS (`require`). هذا ضروري لأن Vite وExpress 5 يحتاجان ESM.

### الأوامر (Scripts)

```json
"scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "npx tsx server/src/index.ts",
    "server": "ts-node server/src/index.ts",
    "db:generate": "prisma generate --schema=server/prisma/schema.prisma",
    "db:push": "prisma db push --schema=server/prisma/schema.prisma",
    "db:studio": "prisma studio --schema=server/prisma/schema.prisma",
    "db:seed": "npx ts-node server/prisma/seed.ts"
}
```

| الأمر | الشرح |
|-------|-------|
| `npm run dev` | يشغل خادم التطوير (Vite) على المنفذ 3000 مع Hot Reload |
| `npm run build` | يُجمّع الواجهة الأمامية في مجلد `dist/` للإنتاج |
| `npm start` | يشغل الخادم الخلفي (Express) باستخدام `tsx` |
| `npm run db:generate` | يُولّد عميل Prisma من ملف المخطط |
| `npm run db:push` | يُنشئ/يُحدث جداول قاعدة البيانات |
| `npm run db:studio` | يفتح واجهة رسومية لتصفح قاعدة البيانات |

### التبعيات الرئيسية (dependencies)

```json
"dependencies": {
    "@google/genai": "^1.41.0",        // 🤖 Gemini AI SDK
    "@prisma/client": "^5.10.0",       // 🗄️ عميل قاعدة البيانات
    "bcrypt": "^6.0.0",                // 🔒 تشفير كلمات المرور
    "cors": "^2.8.6",                  // 🌐 السماح بالطلبات من نطاقات مختلفة
    "dotenv": "^17.3.1",               // 📋 تحميل متغيرات البيئة من ملف .env
    "express": "^5.2.1",               // 🖥️ إطار عمل الخادم
    "helmet": "^8.1.0",                // 🛡️ رؤوس أمان HTTP
    "jsonwebtoken": "^9.0.3",          // 🎫 رموز JWT للمصادقة
    "lucide-react": "^0.564.0",        // ✨ مكتبة أيقونات
    "morgan": "^1.10.1",               // 📝 سجل طلبات HTTP
    "multer": "^2.0.2",               // 📁 رفع الملفات
    "prisma": "^5.10.0",               // 🛠️ أداة Prisma CLI
    "react": "^19.2.4",                // ⚛️ مكتبة React
    "react-dom": "^19.2.4",            // 🌳 ربط React بالـ DOM
    "tsx": "^4.21.0"                   // 🚀 تشغيل TypeScript مباشرة
}
```

> **لماذا `tsx` وليس `ts-node`؟** لأن `tsx` أسرع ويدعم ESM بشكل أصلي بدون إعدادات إضافية. هذا مهم جداً داخل Docker.

---

## 2.2 ملف `vite.config.ts` — إعدادات أداة البناء

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    // تحميل متغيرات البيئة حسب الوضع (development/production)
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],          // تفعيل دعم React (JSX/TSX)
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),  // اختصار المسارات
            },
        },
        server: {
            port: 3000,              // منفذ خادم التطوير
            host: true,              // السماح بالوصول من عناوين خارجية
        },
        define: {
            // إتاحة مفتاح Gemini API للواجهة الأمامية
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
        }
    };
});
```

### شرح تفصيلي:

1. **`loadEnv(mode, ...)`**: يقرأ ملفات `.env` و `.env.local` ويُتيح المتغيرات.
2. **`plugins: [react()]`**: يُفعّل تحويل JSX/TSX إلى JavaScript عادي.
3. **`alias: { '@': ... }`**: يسمح بكتابة `import X from '@/utils'` بدلاً من مسارات نسبية طويلة.
4. **`define`**: يستبدل `process.env.GEMINI_API_KEY` بالقيمة الفعلية وقت البناء (لأن المتصفح لا يملك `process.env`).

---

## 2.3 ملف `tsconfig.json` — إعدادات TypeScript

```json
{
    "compilerOptions": {
        "target": "ES2022",                    // الكود الناتج يستهدف ES2022
        "lib": ["ES2022", "DOM", "DOM.Iterable"], // مكتبات الأنواع المتاحة
        "module": "ESNext",                    // نظام الوحدات: ESM
        "skipLibCheck": true,                  // تخطي فحص أنواع المكتبات (أسرع)
        "moduleResolution": "bundler",         // طريقة حل الوحدات (لـ Vite)
        "allowImportingTsExtensions": true,    // السماح بـ .ts في مسارات الاستيراد
        "resolveJsonModule": true,             // السماح باستيراد ملفات JSON
        "isolatedModules": true,               // كل ملف وحدة مستقلة
        "noEmit": true,                        // لا تُنتج ملفات JS (Vite يتولى ذلك)
        "jsx": "react-jsx",                    // استخدام JSX Transform الجديد
        "strict": true,                        // تفعيل كل فحوصات الصرامة
        "esModuleInterop": true                // توافق بين CommonJS و ESM
    },
    "include": ["server", "prisma"],           // المجلدات المشمولة
    "exclude": ["src", "dist", "node_modules"] // المجلدات المستثناة
}
```

> **ملاحظة مهمة**: Vite لا يستخدم `tsconfig.json` للبناء (يستخدم esbuild مباشرة). هذا الملف أساساً لمحرر الكود (VS Code) ولأدوات فحص الأنواع.

---

## 2.4 ملف `tailwind.config.js` — إعدادات التنسيق

```javascript
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",   // فحص كل ملفات المشروع
  ],
  darkMode: 'class',             // الوضع الداكن بإضافة class="dark"
  theme: {
    extend: {
      colors: {
        brand: {                 // ألوان العلامة التجارية (ديناميكية)
          50: 'rgb(var(--brand-50))',
          500: 'rgb(var(--brand-500))',
          // ... المزيد
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],     // الخط الإنجليزي
        arabic: ['Tajawal', 'sans-serif'], // الخط العربي
      }
    }
  }
}
```

### لماذا المتغيرات CSS بدلاً من ألوان ثابتة؟

لأن الألوان **تتغير ديناميكياً** حسب إعدادات الأدمن. عندما يُغير الأدمن اللون الأساسي إلى أحمر مثلاً، يُحدّث JavaScript متغيرات CSS:

```javascript
document.documentElement.style.setProperty('--brand-500', '239 68 68');
```

وTailwind يقرأ هذه المتغيرات تلقائياً.

---

## 2.5 ملف `index.html` — نقطة الدخول

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- PWA Support -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <link rel="manifest" href="/manifest.json">

  <title>CSA - Computer Science Association</title>

  <!-- Error Overlay: يعرض الأخطاء مباشرة على الشاشة -->
  <script>
    window.onerror = function(msg, url, line) {
      // يُنشئ div أحمر يعرض الخطأ — مفيد جداً للتصحيح
    };
  </script>

  <!-- Tailwind CDN (للتطوير فقط) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- خطوط Google: Tajawal للعربية و Inter للإنجليزية -->
  <link href="https://fonts.googleapis.com/css2?family=Tajawal&family=Inter" rel="stylesheet">

  <!-- QR Code Scanner -->
  <script src="https://unpkg.com/html5-qrcode"></script>

  <!-- إعدادات Tailwind الديناميكية -->
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              500: 'rgb(var(--brand-500) / <alpha-value>)',
              // الألوان تُقرأ من متغيرات CSS
            }
          }
        }
      }
    }
  </script>

  <!-- المتغيرات الافتراضية -->
  <style>
    :root {
      --brand-500: 14 165 233;  /* اللون الأزرق الافتراضي */
      --brand-900: 12 74 110;
    }
  </style>
</head>
<body>
  <div id="root"></div>                    <!-- React يُركّب هنا -->
  <script type="module" src="/index.tsx"></script>  <!-- نقطة الدخول -->
</body>
</html>
```

### النقاط المهمة:

1. **Error Overlay**: يعرض أي خطأ JavaScript كشريط أحمر — يوفر ساعات تصحيح
2. **PWA Support**: `manifest.json` يجعل التطبيق قابلاً للتثبيت على الهاتف
3. **`type="module"`**: ضروري لاستخدام ESM imports
4. **متغيرات CSS**: الألوان الافتراضية تُحدد هنا وتُعاد كتابتها ديناميكياً

---

# الفصل الثالث: نقطة الدخول والمكوّن الجذري

## 3.1 ملف `index.tsx` — نقطة دخول React

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 1. ابحث عن العنصر الجذري في HTML
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

// 2. أنشئ جذر React 19 وارسم التطبيق
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### ما يحدث خطوة بخطوة:

1. React يبحث عن `<div id="root">` في HTML
2. يُنشئ "جذر" React 19 (الطريقة الجديدة بدلاً من `ReactDOM.render`)
3. يرسم مكوّن `<App />` داخله
4. `StrictMode` يُفعّل تحذيرات إضافية أثناء التطوير فقط

## 3.2 ملف `types.ts` — تعريفات الأنواع

هذا الملف يُعرّف **شكل البيانات** في كل أنحاء التطبيق. كل واجهة (interface) تصف كائناً محدداً:

### أنواع اللغة

```typescript
export type Language = 'en' | 'ar';  // التطبيق ثنائي اللغة

export interface Translation {
  [key: string]: { en: string; ar: string; };  // كل ترجمة لها مفتاح
}
```

### نموذج العضو

```typescript
export interface Member {
  id: string;         // معرف فريد (UUID)
  name: string;       // الاسم
  role: string;       // المنصب (مثل "Content Creator")
  roleAr: string;     // المنصب بالعربية
  office: string;     // المكتب (مثل "Media Office")
  officeAr: string;   // المكتب بالعربية
  category: MemberRole; // المستوى: executive | head | member
  term: string;       // الفترة: "2024-2025"
  image?: string;     // صورة اختيارية
  email?: string;     // بريد اختياري
}
```

> **`?` (Optional)**: يعني أن الحقل يمكن أن يكون موجوداً أو `undefined`

### نموذج الإعدادات

```typescript
export interface AppSettings {
  siteNameEn: string;          // اسم الموقع بالإنجليزية
  siteNameAr: string;          // اسم الموقع بالعربية
  primaryColor: string;        // اللون الأساسي (#hex)
  secondaryColor: string;      // اللون الثانوي
  backgroundPattern?: BackgroundPattern;  // نمط الخلفية
  borderRadius?: string;       // حجم الحواف المدورة
  animationSpeed?: string;     // سرعة الحركات
  fontStyle?: string;          // نوع الخط
  iconStyle?: string;          // نمط الأيقونات (90+ نمط)
}
```

### أنواع الأمان

```typescript
export type AdminRole = 'President' | 'Vice President'
                      | 'General Secretary' | 'Media Head';

export interface AccessKey {
  token: string;        // مفتاح الوصول المُولّد
  role: AdminRole;      // الصلاحية
  expiresAt: string;    // تاريخ الانتهاء
  isUsed: boolean;      // هل استُخدم؟
}

export interface DeanSecurityConfig {
  masterKey: string;        // المفتاح الرئيسي (56 حرف)
  securityQuestion: string; // سؤال الأمان
  securityAnswer: string;   // الإجابة (مُشفرة)
  backupCode: string;       // كود احتياطي
}
```

---

# الفصل الرابع: طبقة الخدمات (Services)

## 4.1 ملف `services/api.ts` — عميل API المركزي

هذا هو أهم ملف في الواجهة الأمامية. كل اتصال بالخادم يمر عبره.

### إعداد العنوان الأساسي

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

- في التطوير: يتصل بـ `localhost:3001`
- في الإنتاج: يقرأ `VITE_API_URL` من متغيرات البيئة
- على Railway: يتم ضبطه تلقائياً لأن الواجهة والخادم على نفس النطاق

### إدارة الرموز (Tokens)

```typescript
const DEAN_TOKEN_KEY = 'csa_dean_token';
const ADMIN_TOKEN_KEY = 'csa_admin_token';

export const getDeanToken = (): string | null =>
    localStorage.getItem(DEAN_TOKEN_KEY);
export const setDeanToken = (token: string) =>
    localStorage.setItem(DEAN_TOKEN_KEY, token);
export const clearDeanToken = () =>
    localStorage.removeItem(DEAN_TOKEN_KEY);
```

الرموز تُخزن في `localStorage` — تبقى حتى بعد إغلاق المتصفح.

### دالة `apiFetch` — القلب النابض

```typescript
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    // 1. فصل الرؤوس عن باقي الخيارات
    const { headers: optHeaders, ...restOptions } = options;

    // 2. إرسال الطلب مع دمج الرؤوس بشكل صحيح
    const res = await fetch(`${API_BASE}${path}`, {
        ...restOptions,
        headers: {
            'Content-Type': 'application/json',    // دائماً JSON
            ...(optHeaders as Record<string, string>),  // رؤوس إضافية (مثل Authorization)
        },
    });

    // 3. معالجة الأخطاء
    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error || `API Error ${res.status}`);
    }

    return res.json();  // 4. إرجاع البيانات كـ JSON
}
```

> **ملاحظة حرجة**: ترتيب الدمج مهم جداً! `...restOptions` يجب أن يأتي **قبل** `headers` وليس بعده، وإلا سيكتب فوق `Content-Type`. هذا كان سبب خطأ تزامن الثيمات.

### واجهة API العامة (بدون مصادقة)

```typescript
export const api = {
    getEvents:   () => apiFetch<any[]>('/api/events'),
    getMembers:  () => apiFetch<any[]>('/api/members'),
    getNews:     () => apiFetch<any[]>('/api/news'),
    getTimeline: () => apiFetch<any[]>('/api/timeline'),
    getSettings: () => apiFetch<any>('/api/settings'),
```

أي مستخدم يستطيع قراءة هذه البيانات — لا تحتاج تسجيل دخول.

### عمليات تحتاج صلاحيات العميد (Dean)

```typescript
    deanLogin: async (masterKey: string) => {
        const result = await apiFetch<{ token: string }>('/api/auth/dean/login', {
            method: 'POST',
            body: JSON.stringify({ masterKey }),
        });
        setDeanToken(result.token);  // تخزين الرمز تلقائياً
        return result;
    },

    // إنشاء/تحديث/حذف المحتوى — يحتاج رمز Dean
    createEvent: (data: any) => apiFetch('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: authHeaders(getDeanToken() || getAdminToken()),
    }),
```

---

## 4.2 ملف `services/settingsService.ts` — التخزين المحلي

```typescript
const STORAGE_KEY = 'csa_app_settings';

export const saveSettings = async (settings: AppSettings): Promise<boolean> => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        return false;
    }
};

export const loadSettings = async (): Promise<AppSettings | null> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
};
```

هذه الخدمة تُخزن نسخة من الإعدادات **محلياً** في المتصفح لتحميل أسرع. الإعدادات الحقيقية تأتي دائماً من الخادم.

---

## 4.3 ملف `services/geminiService.ts` — الذكاء الاصطناعي

```typescript
import { GoogleGenAI } from "@google/genai";

// تهيئة كسولة — لا تُنشئ العميل إلا عند الحاجة
let ai: GoogleGenAI | null = null;

const getAIClient = () => {
    if (ai) return ai;
    const apiKey = getApiKey();
    if (!apiKey) {
        console.warn("Gemini API Key is missing. AI features disabled.");
        return null;
    }
    ai = new GoogleGenAI({ apiKey });
    return ai;
};

export const generateContentHelper = async (
    prompt: string,
    language: 'en' | 'ar'
): Promise<string> => {
    const client = getAIClient();
    if (!client) return 'يرجى تكوين مفتاح API...';

    const systemInstruction = language === 'ar'
        ? 'أنت مساعد ذكي لجمعية طلابية...'
        : 'You are an AI assistant for a CS Association...';

    const response = await client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { systemInstruction, temperature: 0.7 }
    });

    return response.text || '';
};
```

### كيف يُستخدم؟

في لوحة التحكم، يضغط الأدمن "AI Magic" فيُرسل موضوع المنشور إلى Gemini ويحصل على نص مكتوب بشكل احترافي.

---

# الفصل الخامس: قاعدة البيانات (Prisma + SQLite)

## 5.1 ملف `server/prisma/schema.prisma`

هذا الملف يُعرّف **هيكل قاعدة البيانات** بالكامل:

### الإعدادات الأساسية

```prisma
generator client {
  provider = "prisma-client-js"   // يُولّد عميل TypeScript
}

datasource db {
  provider = "sqlite"             // قاعدة بيانات ملف واحد
  url      = env("DATABASE_URL")  // المسار من متغيرات البيئة
}
```

### نموذج الحدث (Event)

```prisma
model Event {
  id            String   @id @default(uuid())   // معرف UUID تلقائي
  title         String                            // العنوان بالإنجليزية
  titleAr       String                            // العنوان بالعربية
  description   String
  descriptionAr String
  date          String                            // التاريخ كنص
  time          String
  location      String
  locationAr    String
  image         String?                           // رابط الصورة (اختياري)
  type          String   @default("Event")
  isOnline      Boolean  @default(false)
  meetingLink   String?                           // رابط Zoom/Meet
  isCompleted   Boolean  @default(false)
  createdAt     DateTime @default(now())          // تاريخ الإنشاء تلقائي
  updatedAt     DateTime @updatedAt               // تاريخ آخر تحديث تلقائي
}
```

### نموذج الإعدادات (AppSetting)

```prisma
model AppSetting {
  id                String  @id @default("main")  // سجل واحد فقط
  siteNameEn        String  @default("CS Student Association")
  primaryColor      String  @default("#0284c7")
  backgroundPattern String  @default("none")
  borderRadius      String  @default("xl")
  fontStyle         String  @default("cairo")
  iconStyle         String?
}
```

> **`@id @default("main")`**: يعني أن هناك **سجل واحد فقط** للإعدادات. عند التحديث، نبحث عن السجل بمعرف "main" ونُحدّثه.

### نماذج الأمان

```prisma
model DeanConfig {
  id               String   @id @default("config")  // سجل واحد فقط
  masterKey        String                             // المفتاح الرئيسي (مُشفر بـ bcrypt)
  securityQuestion String
  securityAnswer   String                             // مُشفر بـ bcrypt
  backupCode       String                             // مُشفر بـ bcrypt
}

model DeanSession {
  id          String   @id @default(uuid())
  token       String   @unique          // رمز JWT فريد
  isActive    Boolean  @default(true)
  expiresAt   DateTime                  // تاريخ انتهاء الجلسة
}

model AccessKey {
  id          String   @id @default(uuid())
  token       String   @unique          // مفتاح الوصول المُولّد
  role        String                    // الصلاحية (President, Media Head, ...)
  isUsed      Boolean  @default(false)  // يُستخدم مرة واحدة فقط
  expiresAt   DateTime                  // صالح لـ 24 ساعة
}
```

---

# الفصل السادس: الخادم الخلفي (Express API)

## 6.1 ملف `server/src/index.ts` — نقطة الدخول

هذا الملف (~720 سطر) يحتوي على **كل شيء**: الإعداد، المصادقة، والمسارات.

### الاستيرادات والإعداد

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';

// تحميل متغيرات البيئة
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// إنشاء DATABASE_URL تلقائياً إن لم يوجد
if (!process.env.DATABASE_URL) {
    const dbPath = path.resolve(__dirname, '../../data/csa.db');
    process.env.DATABASE_URL = `file:${dbPath}`;
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'csa-portal-secret-key';
```

### الوسائط (Middleware)

```typescript
app.use(cors());                               // السماح بالطلبات من أي نطاق
app.use(helmet({ contentSecurityPolicy: false })); // رؤوس أمان HTTP
app.use(morgan('dev'));                          // سجل الطلبات
app.use(express.json({ limit: '10mb' }));        // تحليل JSON (حد 10 ميجا)
app.use(express.urlencoded({ extended: true })); // تحليل بيانات النماذج
```

### التحقق من المصادقة

```typescript
// التحقق من رمز العميد
const verifyDean = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token required' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // تحقق من أن الجلسة نشطة في قاعدة البيانات
        const session = await prisma.deanSession.findFirst({
            where: { token, isActive: true }
        });
        if (!session) return res.status(401).json({ error: 'Session expired' });

        (req as any).dean = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
```

### المسارات العامة (بدون مصادقة)

```typescript
// ─── Health Check ─────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'CSA Portal API is running' });
});

// ─── الأحداث ──────────────────────────────────
app.get('/api/events', async (_req, res) => {
    const events = await prisma.event.findMany({
        orderBy: { date: 'desc' }
    });
    res.json(events);
});

// ─── الأعضاء ──────────────────────────────────
app.get('/api/members', async (_req, res) => {
    const members = await prisma.member.findMany();
    res.json(members);
});

// ─── الإعدادات ────────────────────────────────
app.get('/api/settings', async (_req, res) => {
    let settings = await prisma.appSetting.findFirst();
    if (!settings) {
        settings = await prisma.appSetting.create({ data: {} });
    }
    res.json(settings);
});
```

### مصادقة العميد (Dean Auth)

```typescript
app.post('/api/auth/dean/login', async (req, res) => {
    const { masterKey } = req.body;
    const config = await prisma.deanConfig.findUnique({
        where: { id: 'config' }
    });

    if (!config) {
        // أول تسجيل دخول — إنشاء الإعدادات الأمنية
        const hashedKey = await bcrypt.hash(masterKey, 10);
        await prisma.deanConfig.create({
            data: { masterKey: hashedKey, ... }
        });
    }

    // التحقق من المفتاح
    const valid = await bcrypt.compare(masterKey, config.masterKey);
    if (!valid) return res.status(401).json({ error: 'Invalid master key' });

    // إنشاء رمز JWT وجلسة
    const token = jwt.sign({ role: 'dean' }, JWT_SECRET, { expiresIn: '24h' });
    await prisma.deanSession.create({
        data: { token, deviceInfo: req.headers['user-agent'], ... }
    });

    res.json({ token, expiresAt: ... });
});
```

### العمليات المحمية (تحتاج مصادقة)

```typescript
// إنشاء حدث جديد — يحتاج Dean أو Admin
app.post('/api/admin/events', verifyAnyAuth, async (req, res) => {
    const event = await prisma.event.create({ data: req.body });
    res.status(201).json(event);
});

// تحديث الإعدادات — يحتاج Dean أو Admin
app.put('/api/admin/settings', verifyAnyAuth, async (req, res) => {
    const settings = await prisma.appSetting.upsert({
        where: { id: 'main' },
        update: req.body,
        create: { ...req.body, id: 'main' },
    });
    res.json(settings);
});
```

### تقديم الواجهة الأمامية (Production)

```typescript
// API 404 Handler
app.use('/api/{*path}', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Serve React Frontend
const distPath = path.resolve(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));       // ملفات ثابتة (JS, CSS, صور)
    app.get('{*path}', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));  // SPA Fallback
    });
}
```

> **لماذا `{*path}` بدلاً من `*`؟** لأن Express 5 يستخدم إصداراً جديداً من `path-to-regexp` يتطلب أسماء صريحة للمجموعات.

---

# الفصل السابع: Docker والنشر

## 7.1 ملف `Dockerfile`

```dockerfile
# 1. صورة Node.js خفيفة
FROM node:20-slim

# 2. تثبيت OpenSSL (ضروري لـ Prisma على Linux)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 3. مجلد العمل
WORKDIR /app

# 4. نسخ ملفات التبعيات أولاً (للاستفادة من Docker cache)
COPY package*.json ./
RUN npm ci

# 5. نسخ باقي الملفات
COPY . .

# 6. إصلاح نهايات الأسطر (Windows → Linux)
RUN sed -i 's/\r$//' server/prisma/schema.prisma

# 7. إعداد قاعدة البيانات
ENV DATABASE_URL="file:/app/data/csa.db"
RUN mkdir -p /app/data
RUN npx prisma generate --schema=server/prisma/schema.prisma
RUN npx prisma db push --schema=server/prisma/schema.prisma --skip-generate

# 8. بناء الواجهة الأمامية
RUN npm run build

# 9. المنفذ والأمر
EXPOSE 3001
CMD ["npx", "tsx", "server/src/index.ts"]
```

### لماذا هذا الترتيب؟

- **الخطوات 4-5**: نسخ `package*.json` أولاً يعني أن Docker يُخزّن (cache) طبقة `npm ci`. إذا لم تتغير التبعيات، لن يُعيد التثبيت.
- **الخطوة 6**: على Windows، الملفات تنتهي بـ `\r\n`. Prisma على Linux لا يقبل `\r`.
- **`npm ci`** بدلاً من `npm install`: يُثبّت التبعيات بدقة من `package-lock.json` — مضمون ومتطابق.

## 7.2 ملف `docker-compose.yml`

```yaml
version: '3.8'
services:
  csa-portal:
    build: .
    container_name: csa-portal
    restart: always                    # إعادة التشغيل التلقائية
    ports:
      - "3000:3001"                    # ربط المنفذ 3000 بالمنفذ الداخلي 3001
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=file:/app/data/dev.db
      - JWT_SECRET=csa-secret-key-change-me
    volumes:
      - ./csa_data:/app/data           # البيانات تبقى حتى بعد إعادة بناء الحاوية
      - ./csa_uploads:/app/server/uploads
```

### الأحجام (Volumes):

- **`csa_data`**: يحفظ ملف قاعدة البيانات SQLite خارج الحاوية — لا تضيع البيانات عند إعادة البناء
- **`csa_uploads`**: يحفظ الملفات المرفوعة (صور، ملفات)

---

# الفصل الثامن: تشغيل المشروع من الصفر

## 8.1 المتطلبات

- Node.js 20 أو أحدث
- Git
- (اختياري) Docker

## 8.2 التشغيل المحلي

```bash
# 1. استنساخ المشروع
git clone https://github.com/ahmedabbas358/csa-portal-iua.git
cd csa-portal-iua

# 2. تثبيت التبعيات
npm install

# 3. إعداد متغيرات البيئة
echo "DATABASE_URL=file:./data/dev.db" > server/.env
echo "JWT_SECRET=my-secret-key" >> server/.env
echo "VITE_API_URL=http://localhost:3001" > .env

# 4. إعداد قاعدة البيانات
npx prisma generate --schema=server/prisma/schema.prisma
npx prisma db push --schema=server/prisma/schema.prisma

# 5. تشغيل الخادم (في نافذة طرفية منفصلة)
npm start

# 6. تشغيل خادم التطوير (في نافذة أخرى)
npm run dev
```

الآن:
- الواجهة الأمامية: `http://localhost:3000`
- الخادم: `http://localhost:3001`
- API: `http://localhost:3001/api/health`

## 8.3 التشغيل بـ Docker

```bash
# بناء وتشغيل
docker compose up --build

# الوصول
open http://localhost:3000
```

## 8.4 النشر على Railway

1. ارفع المشروع على GitHub
2. أنشئ مشروعاً جديداً على [railway.app](https://railway.app)
3. اربطه بمستودع GitHub
4. أضف المتغيرات في **Variables**:
   - `PORT=3001`
   - `JWT_SECRET=your-strong-secret`
   - `NODE_ENV=production`
5. Railway سيكتشف Dockerfile تلقائياً ويبني وينشر

## 8.5 أول تسجيل دخول

عند أول زيارة للوحة تحكم العميد:

1. اذهب إلى `/dean`
2. أدخل المفتاح الرئيسي: `CSA_MASTER_KEY_2024_AFRICA_UNI_SECURE_ACCESS_V1_X99_AB7_KL2`
3. النظام سيُنشئ حساب العميد تلقائياً ويشفّر المفتاح
4. من لوحة العميد يمكنك إنشاء مفاتيح وصول للمسؤولين

---

# الفصل التاسع: تدفق البيانات الكامل

## 9.1 كيف تُحمّل الصفحة

```
1. المستخدم يفتح الموقع
2. index.html يُحمّل → يُحمّل index.tsx
3. index.tsx يُركّب <App />
4. App.tsx يستدعي init():
   ├── api.getSettings()   → GET /api/settings   → يُحدّث الألوان والثيمات
   ├── api.getEvents()     → GET /api/events     → يملأ قائمة الأحداث
   ├── api.getMembers()    → GET /api/members    → يملأ قائمة الأعضاء
   ├── api.getNews()       → GET /api/news       → يملأ قائمة الأخبار
   └── api.getTimeline()   → GET /api/timeline   → يملأ الجدول الزمني
5. React يرسم الصفحة المطلوبة
```

## 9.2 كيف يُحدّث الأدمن إعدادات الثيم

```
1. الأدمن يفتح لوحة التحكم → تبويب "الإعدادات"
2. يُغير اللون الأساسي إلى أحمر
3. يضغط "حفظ"
4. Admin.tsx يستدعي:
   api.updateSettings(newSettings)
   → PUT /api/admin/settings
   → headers: { Authorization: Bearer TOKEN, Content-Type: application/json }
   → body: { primaryColor: '#ef4444', ... }
5. الخادم يُحدّث AppSetting في قاعدة البيانات
6. يُرجع الإعدادات المحدثة
7. App.tsx يستلم الاستجابة ويُحدّث:
   ├── CSS Variables: --brand-500 = 239 68 68
   ├── State: settings.primaryColor = '#ef4444'
   └── localStorage: نسخة محلية للتحميل السريع
8. كل المستخدمين الآخرين: عند تحديث الصفحة يحصلون على الإعدادات الجديدة
```

---

# الفصل العاشر: الأمان ونظام الصلاحيات

## 10.1 مستويات الوصول

```
┌─── الزائر (بدون تسجيل دخول) ───────────────────┐
│  قراءة: الأخبار، الأحداث، الأعضاء، الإعدادات    │
│  كتابة: لا شيء                                    │
└──────────────────────────────────────────────────┘
         ▲
┌─── المسؤول (Admin - مفتاح وصول مؤقت) ──────────┐
│  قراءة: كل ما سبق                                │
│  كتابة: إنشاء/تعديل/حذف المحتوى، تحديث الإعدادات │
│  ممنوع: إنشاء مفاتيح وصول، تغيير كلمة المرور     │
└──────────────────────────────────────────────────┘
         ▲
┌─── العميد (Dean - المفتاح الرئيسي) ─────────────┐
│  كل صلاحيات المسؤول                               │
│  + إنشاء مفاتيح وصول للمسؤولين                    │
│  + إدارة الجلسات النشطة                            │
│  + تغيير المفتاح الرئيسي وسؤال الأمان              │
│  + العمليات الحساسة (إعادة تعيين، نسخ احتياطي)     │
└──────────────────────────────────────────────────┘
```

## 10.2 تدفق المصادقة

```
العميد يُسجل الدخول:
  masterKey → bcrypt.compare() → jwt.sign() → token

العميد يُنشئ مفتاح وصول:
  role + crypto.randomBytes(32) → AccessKey (صالح 24 ساعة، يُستخدم مرة واحدة)

المسؤول يستخدم المفتاح:
  accessKey token → التحقق من الصلاحية → jwt.sign() → AdminSession
```

---

# خاتمة

هذا المشروع يُوضح كيف تُبنى تطبيقات ويب حقيقية بمعمارية Full-Stack حديثة. يغطي:

✅ **React 19** مع إدارة حالة بـ `useState/useEffect`
✅ **Express 5** مع Middleware ومصادقة JWT
✅ **Prisma ORM** مع SQLite لبساطة النشر
✅ **Docker** لتوحيد بيئة التشغيل
✅ **Railway** للنشر السحابي المجاني
✅ **نظام ثيمات ديناميكي** بمتغيرات CSS
✅ **نظام أمان متعدد المستويات** بمفاتيح وصول مؤقتة
✅ **دعم ثنائي اللغة** (عربي/إنجليزي)
✅ **ذكاء اصطناعي** مع Google Gemini
✅ **PWA** قابل للتثبيت على الهاتف

> لأي سؤال أو استفسار، راجع الكود المصدري على GitHub أو افتح Issue.
]]>
