# SudHR — tanlov va ishga qabul (taqdimot)

Rahbariyatga ko'rsatish uchun interaktiv taqdimot: bo'sh ish o'rnidan buyruqqacha bo'lgan butun jarayon.
Bo'lim, lavozim va bo'sh o'rinlar Oliy sud telefon ro'yxatidan olingan (12.08.2026 holati). Odamlar, hujjatlar va qolgan raqamlar sun'iy. Hech qanday tizimga ulanmaydi, internet kerak emas.

Sahnalar haqiqiy saytlar ko'rinishida: SudHR (KADRSUDUZ menyusi bilan) va vacancy.sud.uz. Odamlar rasmlari chizilgan portretlar, haqiqiy suratlar emas.

## Ishga tushirish

`index.html` ni Chrome yoki Edge'da oching (ikki marta bosish yetarli). `F` yoki o'ng yuqoridagi tugma — to'liq ekran.

Ochilish posteri: taqdimot boshida chiqadi, pult, `Enter` yoki sichqoncha bilan ochiladi. **Qaytadan** yana posterga qaytaradi.

## Boshqarish

| Tugma | Vazifasi |
|---|---|
| Yashil tugma, `Enter`, `Probel`, `→` yoki pultdagi «keyingi» | Avval bosqichdagi navbatdagi harakat (animatsiya), harakatlar tugagach — keyingi bosqich |
| `Shift` + `→` / Keyingisi | Harakatlarni o'tkazib, darhol keyingi bosqich |
| `←` / Orqaga | Oldingi bosqich |
| Tepadagi raqamlar | Istalgan bosqichga o'tish |
| Qaytadan | Hammasini boshidan |

Holat brauzerda saqlanadi: sahifa yangilansa, o'sha joydan davom etadi (ochilganda bu haqda xabar chiqadi). Namoyishdan oldin **Qaytadan** ni bosing.

Prezentatsiya pulti (clicker) bilan ishlaydi: har bir bosish — navbatdagi qadam.

Ekran kichik bo'lsa (proyektor 1280×720, 1366×768), oyna o'zi biroz kichrayadi; harakat ekrandan pastda bo'lsa, oyna unga ergashib siljiydi. Tavsiya: Chrome, to'liq ekran (`F`).

## Bosqichlar

Tepadagi **1-qism / 2-qism** tugmasi bilan qismlar almashadi.

**1-qism · Tanlov va ishga qabul**

0. Kirish — SudHR login sahifasi, ERI kaliti bilan kirish; kirgach bosh sahifa (Kadrlar tarkibi) ochiladi.
1. Bo'sh o'rinlar — shtat jadvalidan bo'sh lavozimlar aniqlanadi.
2. E'lon — shtat birligidan avtomatik to'ldiriladi, E-IMZO bilan imzolanadi; e'lon SudHR'dan vacancy.sud.uz ga uchib borib tushadi.
3. vacancy.sud.uz — e'lon ochiq portalda paydo bo'ladi.
4. Ariza — nomzod OneID orqali kiradi, ma'lumot va hujjatlar davlat bazalaridan keladi; ariza inson resurslari boshqarmasining «Kiruvchi» hujjatlariga uchib tushadi.
5. Kiruvchi — talablarga muvofiqlik tekshirilgan, ariza ro'yxatga olinadi.
6. Tekshiruv — SudHR dagi XULOSA shaklida: sahifa sekin pastga tushadi, bandlar belgilanib boradi, so'ng E-IMZO bilan imzolanadi (QR).
7. Ishga qabul — buyruq, QR kodli imzo, shtat band bo'ladi, xodim kartasi ochiladi.
8. Natija — butun jarayon bir sahifada; banner 2-qismga o'tkazadi.

**2-qism · Respublika nazorati** (Oliy sud inson resurslari boshqarmasi nomidan)

1. Respublika — 14 hududni solishtirish, orqada qolgan hududga topshiriq yuborish.
2. Viloyatga kirish — viloyatdagi har bir sudning shtati va bo'sh o'rinlari.
3. Davomat — turniket qaydlari jonli, kech qolgan va sababli yo'qlar.
4. Davomat reytingi — hududlar va o'z tashkilotidagi bo'limlar bo'yicha.
5. Integratsiyalar — 16 ta tizim; xodim kartasi tizimlardan birma-bir to'ladi.
6. SMART karta — ishlab chiqilmoqda.
7. Reyting — respublika bo'yicha eng yaxshi xodimlar (taklif).
8. Yakun — ikkala qism xulosasi.

## Fayllar

| Fayl | Mazmuni |
|---|---|
| `js/data.js` | Asosiy ma'lumotlar (haqiqiy bo'lim va lavozimlar, sun'iy ismlar va raqamlar) — matnni shu yerda o'zgartirish mumkin |
| `js/scenes-1.js` | 1–4 bosqichlar |
| `js/scenes-2.js` | 1-qism, 5–9 bosqichlar |
| `js/data-2.js` | 2-qism ma'lumotlari |
| `js/scenes-3.js`, `js/scenes-4.js` | 2-qism bosqichlari |
| `js/core.js` | Navigatsiya va animatsiya yordamchilari |
| `css/app.css` | Dizayn |
