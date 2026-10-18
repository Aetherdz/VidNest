# VidNest

## العربية أولاً

**VidNest** تطبيق أندرويد لتنزيل الوسائط، عربي أولاً واتجاه RTL كامل.
الصم الهادئ: بدون إعلانات ولا متتبعات ولا إيموجي.

**جرّب نسخة الويب:** [vidnest-web.onrender.com](https://vidnest-web.onrender.com) — الصق رابط وسائط عاماً، اختر الجودة، ونزّل الملف من المتصفح مباشرة. (استضافة مجانية: أول زيارة بعد خمول قد تأخذ حتى دقيقة للاستيقاظ.)

**ما هو:** الصق رابطاً أو شاركه إلى التطبيق، اختر الجودة، يُنزَّل الملف مباشرة إلى
مجلد `Movies` أو `Music` على الجهاز، ثم شغّله من المشغّل المدمج.

**المزايا:**
- التقاط الروابط من زر المشاركة (`ACTION_SEND` بنص عادي).
- محرك تنزيل على الجهاز عبر `yt-dlp` و`ffmpeg`.
- اختيار الجودة أو الصيغة مع تقدير الحجم قبل البدء.
- تنزيل في الخلفية (خدمة أمامية) مع إشعارات وإدارة الطابور.
- نشر الملف في مكتبة الوسائط (MediaStore) ليظهر في تطبيقات المشاهدة.
- مشغّل مدمج: إيماءات عمودية للصوت والسطوع، وأفقية للتنقل، ووضع صورة داخل صورة.
- استئناف التشغيل من آخر موضع.
- واجهة عربية وإنجليزية كاملة، بدون أي محتوى إعلاني.

**البناء:**

```bash
tools/smart_build.sh compile   # أسرع فحص لـ Kotlin
tools/smart_build.sh debug     # حزمة APK للتطوير
tools/smart_build.sh release   # حزمة APK موقّعة (R8 + تصغير)
tools/smart_build.sh test      # اختبارات الوحدة
tools/smart_build.sh send      # الإصدار مع التسليم عبر تيليجرام (أقل من 50 ميغابايت)
```

**المتطلبات:** أندرويد 8.0 (API 26) أو أحدث، Kotlin، AGP 8.9، Gradle 8.13.

**الخصوصية والأمان:** لا إعلانات ولا متتبعات ولا تحليلات. التطبيق يلتقط نصوص المشاركة
فقط، وخدمة المشغّل لا تسلّم الجلسة إلا لتطبيقنا أو لأنظمة موثوقة.

**التصميم:** `zaikabdou` — بصمة المصمم الدائمة في هذا المشروع.

---

## English

**VidNest** is an Arabic-first Android media downloader with full RTL support.
Quiet by design: no ads, no trackers, no emojis.

**Try the web companion:** [vidnest-web.onrender.com](https://vidnest-web.onrender.com) — paste a public media link, pick a quality, and download from the browser. (Free-tier hosting: the first visit after idle can take up to a minute to wake.)

**What it is:** paste a link or share one into the app, pick a quality, and the
file lands in the device's `Movies` / `Music` folder, ready to play in the
built-in player.

**Features:**
- Link capture from the share sheet (`ACTION_SEND`, plain text).
- On-device download engine (`yt-dlp` + `ffmpeg`).
- Quality/format picker with a size estimate before you commit.
- Background downloads (foreground service) with notifications and a queue.
- MediaStore publishing so files show up in the system library.
- Built-in player: vertical gestures for volume/brightness, horizontal to seek,
  picture-in-picture.
- Resume from last position.
- Complete Arabic and English UI.

**Build:**

```bash
tools/smart_build.sh compile   # fastest Kotlin check
tools/smart_build.sh debug     # debug APK
tools/smart_build.sh release   # signed release APK (R8 + shrinking)
tools/smart_build.sh test      # JVM unit tests
tools/smart_build.sh send      # release + delivery when <= 50 MB
```

**Requirements:** Android 8.0 (API 26) or newer, Kotlin, AGP 8.9, Gradle 8.13.

**Privacy and security:** no ads, no trackers, no analytics. The app captures
shared text only, and the playback service hands its session exclusively to this
app and to trusted system controllers.

**Design:** `zaikabdou` — the permanent designer signature on this project.

---

Design tokens, component inventory and motion rules live in `design/BRIEF.md`.
Workspace rules and the build/delivery contract live in `AGENTS.md`.
