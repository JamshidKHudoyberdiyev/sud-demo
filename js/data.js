// Departments, positions and vacancies are the real ones of the Supreme Court (phone list as of 12.08.2026).
// People, documents and the remaining numbers are synthetic.
const DATA = {
  org: "O'zbekiston Respublikasi Oliy sudi",
  // name: full name (ERI key, F.I.O); short: how SudHR shows the user; role + dept: the profile card lines
  hr: {
    name: "Xamraqulov Shavkat",
    short: "SH.S.XAMRAQULOV",
    role: "Boshqarma boshlig'i",
    dept: "Inson resurslari boshqarmasi",
    post: "Inson resurslari boshqarmasi boshlig'i",
    ini: "SX",
  },

  // staff table of the court (no judge positions: they are never put up for vacancy)
  staff: [
    { dept: "Malaka hay'ati bo'limi", pos: "Bo'lim boshlig'i", person: "Karimova Nodira" },
    { dept: "Malaka hay'ati bo'limi", pos: "Katta konsultant", person: null, target: true },
    { dept: "Rais kotibiyati", pos: "Bosh konsultant", person: "Yusupov Akmal" },
    { dept: "Rais kotibiyati", pos: "Katta konsultant", person: null },
    { dept: "Jamoatchilik bilan hamkorlik markazi", pos: "Bosh konsultant", person: "Ismoilov Rustam" },
    { dept: "Jamoatchilik bilan hamkorlik markazi", pos: "Katta konsultant", person: null },
    { dept: "Sudlarda ijro intizomini nazorat qilish bo'limi", pos: "Bo'lim boshlig'i", person: "Alieva Malika" },
    { dept: "Sudlarda ijro intizomini nazorat qilish bo'limi", pos: "Katta konsultant", person: null },
    { dept: "Axborot resurslarini boshqarish va kiberxavfsizlikni ta'minlash bo'limi", pos: "Bo'lim boshlig'i", person: "Tursunov Bobur" },
    { dept: "Axborot resurslarini boshqarish va kiberxavfsizlikni ta'minlash bo'limi", pos: "Katta konsultant", person: null },
    { dept: "Odil sudlov sohasidagi qonunchilikni tahlil qilish departamenti", pos: "Departament boshlig'i", person: "Nurmatov Otabek" },
    { dept: "Odil sudlov sohasidagi qonunchilikni tahlil qilish departamenti", pos: "Departament boshlig'i o'rinbosari", person: null },
  ],
  // counted from the phone list: 250 positions, 8 of them marked vacant
  kpi: { total: 250, busy: 242, vacant: 8, announced: 5 },

  vacancy: {
    no: "E/14",
    date: "30.10.2026",
    until: "14.11.2026",
    pos: "Katta konsultant",
    dept: "Malaka hay'ati bo'limi",
    type: "Tashqi tanlov",
    rate: "1,0 shtat birligi",
    term: "30.10.2026 — 14.11.2026",
    reqs: ["Oliy yuridik ma'lumot", "Kamida 1 yil ish staji", "Kompyuter savodxonligi", "Davlat tilini bilish"],
  },

  portal: [
    { org: "O'zbekiston Respublikasi Oliy sudi", pos: "Katta konsultant", dept: "Rais kotibiyati", no: "E/13", date: "29.10.2026", until: "12.11.2026" },
    { org: "O'zbekiston Respublikasi Oliy sudi", pos: "Katta konsultant", dept: "Jamoatchilik bilan hamkorlik markazi", no: "E/12", date: "28.10.2026", until: "11.11.2026" },
    { org: "O'zbekiston Respublikasi Oliy sudi", pos: "Katta konsultant", dept: "Sudlarda ijro intizomini nazorat qilish bo'limi", no: "E/11", date: "27.10.2026", until: "10.11.2026" },
    { org: "O'zbekiston Respublikasi Oliy sudi", pos: "Katta konsultant", dept: "Axborot resurslarini boshqarish va kiberxavfsizlikni ta'minlash bo'limi", no: "E/10", date: "26.10.2026", until: "09.11.2026" },
    { org: "O'zbekiston Respublikasi Oliy sudi", pos: "Departament boshlig'i o'rinbosari", dept: "Odil sudlov sohasidagi qonunchilikni tahlil qilish departamenti", no: "E/9", date: "24.10.2026", until: "07.11.2026" },
  ],
  portalTotal: 14,
  regions: [
    ["Barchasi", 128],
    ["Toshkent sh.", 21],
    ["Toshkent vil.", 14],
    ["Samarqand", 11],
    ["Farg'ona", 10],
    ["Andijon", 9],
    ["Buxoro", 8],
  ],

  candidate: {
    name: "Rahimov Jasur Akmalovich",
    short: "Rahimov J.A.",
    ini: "RJ",
    pin: "31203970123456",
    birth: "12.03.1997",
    passport: "AD 1234567",
    address: "Toshkent sh., Chilonzor tumani, Bunyodkor ko'chasi, 12-uy",
    edu: "Toshkent davlat yuridik universiteti, 2019",
    exp: "4 yil 2 oy",
    appNo: "A/14",
  },
  docs: [
    { t: "Obyektivka", s: "Profilingiz asosida avtomatik tuzildi — kadrlar xodimi aynan shu ko'rinishni ko'radi", ic: "file" },
    { t: "Pasport nusxasi", s: "Yuklandi · PDF", ic: "upload" },
  ],

  inbox: [
    { name: "Ergasheva Dilnoza Rustamovna", ini: "ED", pos: "Katta konsultant", date: "28.10.2026", st: "Ko'rib chiqilmoqda" },
    { name: "Qodirov Bekzod Anvarovich", ini: "QB", pos: "Katta konsultant", date: "27.10.2026", st: "Ro'yxatga olindi" },
    { name: "Sobirova Zarina Ilhomovna", ini: "SZ", pos: "Katta konsultant", date: "25.10.2026", st: "Ro'yxatga olindi" },
  ],

  // complex check: the same state sources the HR system queries in "Shaxsiy ma'lumotni tekshirish"
  checks: [
    { sys: "DPM", t: "Pasport ma'lumotlari", r: "Haqiqiy", ic: "id" },
    { sys: "IIV", t: "Sudlanganlik", r: "Mavjud emas", ic: "scale" },
    { sys: "Narkologiya", t: "Narkologik hisob", r: "Ro'yxatda yo'q", ic: "pill" },
    { sys: "Psixonevrologiya", t: "Psixonevrologik hisob", r: "Ro'yxatda yo'q", ic: "pulse" },
    { sys: "Soliq qo'mitasi", t: "Soliq qarzdorligi", r: "Qarzdorlik yo'q", ic: "wallet" },
    { sys: "MIB", t: "Ijro ishlari", r: "Ijro ishi yo'q", ic: "gavel" },
    { sys: "OTM reyestri", t: "Diplom", r: "Tasdiqlandi", ic: "grad" },
    { sys: "Mehnat vazirligi", t: "Ish tarixi", r: "4 yil 2 oy", ic: "briefcase" },
  ],

  order: { no: "412-K", date: "30.10.2026", start: "3-noyabr 2026", tabel: "TV-0587" },
  // the winner is hired by the regional court: the order, the staff position and the employee card are its own;
  // staff numbers are the court's row in DATA2.courts (294 positions, 275 filled)
  hire: { org: "Toshkent viloyat sudi", dept: "Devonxona", hrDept: "Kadrlar bo'limi", kpi: { busy: 275, vacant: 19 } },
};
