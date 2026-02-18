# دليل الدراسة الشامل: نظام إدارة جمعية طلاب الحاسوب (CSA Portal)
# Comprehensive Code Study Guide

---

# 1. مقدمة (Introduction)
هذا الدليل يشرح آلية عمل النظام من الألف إلى الياء، مع تتبع كل سطر في الملفات الأساسية. الهدف هو أن تفهم كيف تتصل الواجهة الأمامية (Frontend) بالخلفية (Backend)، وكيف يتم تخزين البيانات وتأمينها.

---

# 2. هيكلية قاعدة البيانات (Database Schema)
**الملف:** `server/prisma/schema.prisma`

هذا الملف هو "مخطط" قاعدة البيانات. يستخدم Prisma لتعريف الجداول والعلاقات.

## 2.1 النماذج الأساسية (Core Models)

### `model Event` (الفعاليات)
```prisma
model Event {
  id          String   @id @default(uuid()) // مفتاح أساسي فريد
  title       String   // العنوان
  // ... حقول الوصف والتاريخ
  type        String   // نوع الفعالية (ورشة، مؤتمر، إلخ)
  isCompleted Boolean  // هل انتهت الفعالية؟
}
```
*   **الشرح:** يخزن بيانات كل فعالية. الحقل `isCompleted` يستخدم لفرز الفعاليات (قادمة/سابقة).

### `model DeanConfig` (إعدادات العميد الأمنية)
```prisma
model DeanConfig {
  id               String   @id // دائماً تكون قيمته "config" (سجل واحد فقط)
  masterKey        String   // كلمة المرور الرئيسية (مشفرة بـ bcrypt)
  securityQuestion String   // سؤال الأمان لاستعادة الحساب
  securityAnswer   String   // إجابة السؤال
  backupCode       String   // رمز الطوارئ
}
```
*   **الشرح:** هذا الجدول يحتوي على سجل *واحد فقط* يخزن بيانات دخول العميد. كلمة المرور `masterKey` لا تخزن كنص عادي، بل كـ "Hash" مشفر.

### `model AccessKey` (مفاتيح الدخول للمسؤولين)
```prisma
model AccessKey {
  id          String   @id @default(uuid())
  token       String   @unique // المفتاح الفعلي (مثل CSA-PRES-...)
  role        String   // الصلاحية الممنوحة (President, Media Head, etc)
  isUsed      Boolean  @default(false) // هل تم استخدامه؟
  expiresAt   DateTime // متى تنتهي صلاحيته
}
```
*   **الشرح:** عندما يولد العميد مفتاحاً جديداً، يتم تخزينه هنا. عندما يستخدمه المسؤول للدخول، يتحقق النظام من وجوده وصلاحيته.

---

# 3. الخادم والواجهة البرمجية (Backend API)
**الملف:** `server/src/index.ts`

هذا هو "عقل" النظام. مبني بـ Express.js.

## 3.1 الإعدادات والتحميل (Setup)
```typescript
import express from 'express';
// ... import others

const app = express();
app.use(express.json()); // يسمح بقراءة البيانات بصيغة JSON
app.use(cors());         // يسمح للفرونت إند بالاتصال بالسيرفر
```

## 3.2 وسيط المصادقة (Auth Middleware)
هذه دوال تعمل *قبل* الوصول للرابط المطلوب، للتأكد من هوية المستخدم.

### `verifyDeanToken` (التحقق من العميد)
```typescript
const verifyDeanToken = async (req, res, next) => {
    // 1. جلب التوكن من الهيدر (Authorization: Bearer XYZ)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // 2. فك تشفير التوكن للتأكد من صحته
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. التأكد أن الجلسة مسجلة في قاعدة البيانات ولم تنتهي
        const session = await prisma.deanSession.findUnique({ 
            where: { token } 
        });

        if (!session || !session.isActive) throw new Error();
        next(); // السماح بالمرور
    } catch {
        res.status(403).json({ error: 'Invalid Token' });
    }
};
```

## 3.3 تسجيل دخول العميد (Dean Login API)
**الرابط:** `POST /api/auth/dean/login`

```typescript
app.post('/api/auth/dean/login', async (req, res) => {
    const { masterKey } = req.body; // المفتاح المرسل من المستخدم

    // 1. جلب الهاش المخزن من قاعدة البيانات
    const config = await prisma.deanConfig.findFirst({ where: { id: 'config' } });
    
    // 2. مقارنة المفتاح المرسل مع الهاش (bcrypt.compare)
    const isValid = await bcrypt.compare(masterKey, config.masterKey);
    if (!isValid) return res.status(401).json({ error: 'Invalid Key' });

    // 3. إنشاء توكن جديد (JWT)
    const token = jwt.sign({ type: 'dean' }, JWT_SECRET);

    // 4. حفظ الجلسة في قاعدة البيانات
    await prisma.deanSession.create({
        data: { token, deviceInfo: req.headers['user-agent'] }
    });

    // 5. إرسال التوكن للمستخدم
    res.json({ token });
});
```

---

# 4. خدمة الاتصال (Frontend API Service)
**الملف:** `services/api.ts`

هذا الملف هو "الجسر" بين المتصفح والسيرفر. يحتوي على دوال جاهزة لكل عملية.

## 4.1 دالة الاتصال العامة (`apiFetch`)
```typescript
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    // إرسال الطلب إلى الرابط الكامل (http://localhost:3001/api/...)
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    // إذا فشل الطلب، ارمِ خطأ
    if (!res.ok) throw new Error(`API Error ${res.status}`);

    // إرجاع النتيجة
    return res.json();
}
```

## 4.2 توليد المفاتيح (Generate Keys)
هذه الدالة تستدعيها لوحة العميد لإنشاء مفتاح جديد.
```typescript
createAccessKey: (role: string, expiresInDays: number) => 
    apiFetch('/api/dean/access-keys', {
        method: 'POST',
        headers: authHeaders(getDeanToken()), // ترسل توكن العميد للتحقق
        body: JSON.stringify({ role, expiresInDays }),
    }),
```

---

# 5. الصفحات الرئيسية (Key Pages)

## 5.1 لوحة العميد (`pages/DeanDashboard.tsx`)
تستخدم `useEffect` لتحميل البيانات عند فتح الصفحة:

```typescript
useEffect(() => {
    // 1. طلب قائمة المفاتيح من السيرفر
    api.dean.getAccessKeys().then(keys => setAccessKeys(keys));
    
    // 2. طلب قائمة الجلسات النشطة
    api.dean.getSessions().then(data => setSessions(data));
}, []);
```

وعند الضغط على "توليد مفتاح":
```typescript
const generateKey = async () => {
    // استدعاء الـ API لإنشاء المفتاح في السيرفر
    const newKey = await api.dean.createAccessKey(selectedRole, 1);
    
    // تحديث القائمة في الواجهة
    state.setAccessKeys([newKey, ...state.accessKeys]);
};
```

---

# 6. البداية بالبيانات (Seeding)
**الملف:** `server/prisma/seed.ts`

هذا السكربت يملأ قاعدة البيانات لأول مرة.
1. يمسح البيانات القديمة (`deleteMany`).
2. ينشئ إعدادات العميد (`deanConfig`) مع تشفير المفتاح الأساسي.
3. يضيف بيانات افتراضية (أعضاء، أخبار، فعاليات).
4. **ملاحظة هامة:** لا يقوم بإنشاء مفاتيح وصول (Access Keys) تلقائياً، بل يترك ذلك للعميد عبر لوحة التحكم.

---

# كيف تدرس هذا النظام؟
1. **ابدأ من قاعدة البيانات:** افهم الجداول في `schema.prisma`.
2. **تتبع دورة حياة الطلب:**
    - اضغط زر في المتصفح (`DeanDashboard.tsx`)
    - انتقل للدالة في `api.ts`
    - انظر كيف يستقبلها السيرفر في `index.ts`
    - شاهد كيف يتعامل مع الداتا بيز عبر `prisma`
3. **جرب التغيير:** حاول إضافة حقل جديد (مثلاً "رقم هاتف" للعضو) وتتبع التغيير في كل الطبقات.
