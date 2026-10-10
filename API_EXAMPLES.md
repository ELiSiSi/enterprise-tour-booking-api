# 🧪 Natours API - Test Examples & Payloads

هذا الملف يحتوي على جميع الأمثلة (Payloads) التي تم اختبارها على المشروع للتأكد من أن كل شيء يعمل بكفاءة. يمكنك استخدام هذه البيانات في **Postman** أو **Thunder Client** لاختبار المشروع بنفسك، ومعرفة سبب أي خطأ قد يظهر لك.

---

## 1. 📝 تسجيل مستخدم جديد (Signup)
**المسار (Endpoint):** `POST /api/v1/users/signup`

### ✅ البيانات الصحيحة (Valid Payload)
```json
{
  "name": "Ahmed Engineer",
  "email": "ahmed.test@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```
**النتيجة المتوقعة:** `201 Created` مع استرجاع الـ `token` وبيانات المستخدم.

### ❌ مثال لبيانات خاطئة (يتم رفضها بواسطة Zod)
```json
{
  "name": "A", 
  "email": "ahmed.test",
  "password": "pass",
  "passwordConfirm": "pass123"
}
```
**سبب الخطأ المتوقع:** 
- الاسم أقل من حرفين.
- الإيميل غير صالح (Invalid email).
- كلمة المرور أقل من 8 حروف.
- كلمتي المرور غير متطابقتين.

---

## 2. 🔑 تسجيل الدخول (Login)
**المسار (Endpoint):** `POST /api/v1/users/login`

### ✅ البيانات الصحيحة (Valid Payload)
```json
{
  "email": "ahmed.test@example.com",
  "password": "password123"
}
```
**النتيجة المتوقعة:** `200 OK` واسترجاع `access_token` و `refresh_token`.

### ❌ مثال لبيانات خاطئة (Invalid Password / Brute Force)
```json
{
  "email": "ahmed.test@example.com",
  "password": "wrong_password"
}
```
**النتيجة المتوقعة:** 
في أول 4 محاولات سيظهر خطأ: 
`Incorrect password. X attempt(s) left.`
في المحاولة الخامسة سيتم إغلاق الحساب مؤقتاً لحمايته وسيظهر:
`Account locked. Try again in 15 minute(s).`

---

## 3. 🌍 جلب الرحلات (Get All Tours)
**المسار (Endpoint):** `GET /api/v1/tours`

**الـ Headers المطلوبة:**
```json
{
  "Authorization": "Bearer <YOUR_ACCESS_TOKEN_HERE>"
}
```
**النتيجة المتوقعة:** `200 OK` واسترجاع قائمة الرحلات.

---

## 4. 🔐 الحماية والمصادقة الثنائية (MFA)
إذا قمت بتفعيل الـ MFA لحسابك، عند محاولة تسجيل الدخول ستكون الاستجابة كالتالي:
```json
{
  "ok": true,
  "data": {
    "mfa_required": true,
    "methods": ["totp"],
    "mfa_token": "temp_token_here",
    "mfa_token_expires_at": "2026-10-10T..."
  }
}
```
**الخطوة التالية (Complete MFA Login):**
**المسار (Endpoint):** `POST /api/v1/users/login/mfa`
```json
{
  "mfa_token": "temp_token_here",
  "totp_code": "123456" 
}
```
*(totp_code هو الكود المكون من 6 أرقام من تطبيق Google Authenticator)*.

---

## 💡 ملاحظات هامة لتتبع الأخطاء (Troubleshooting)
- إذا واجهت خطأ `Your account is inactive.`، فهذا يعني أن الحساب تم حذفه منطقياً (Soft Deleted).
- أي خطأ خاص بـ `Zod Validation` سيأتيك في مصفوفة توضح بالضبط أي حقل فيه المشكلة وما هو المطلوب.
- استخدم `live_test.ts` كأداة سريعة في أي وقت لتشغيل كل هذه السيناريوهات برمجياً والتأكد من سلامة النظام بضغطة زر.

---

## 💳 بيانات اختبار الدفع (Stripe Test Cards)
عند حجز رحلة والدخول على بوابة الدفع (Stripe) في وضع الـ Test Mode، استخدم البيانات الوهمية التالية لإتمام الدفع بنجاح:

- **رقم البطاقة (Card Number):** `4242 4242 4242 4242`
- **تاريخ الانتهاء (Expiry Date):** أي تاريخ في المستقبل (مثال: `12 / 28`)
- **الرقم السري (CVC):** أي 3 أرقام (مثال: `123`)
- **الرمز البريدي (ZIP Code):** أي 5 أرقام (مثال: `12345`)

استخدام أي بطاقة حقيقية في وضع الـ Test Mode سيؤدي إلى رفض العملية بظهور خطأ: `Your card was declined. Your request was in test mode, but used a non test card.`
