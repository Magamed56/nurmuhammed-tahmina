/* =====================================================================
   Үйлөнүү тойго чакыруу — логика (китепканасыз / без библиотек)
   ===================================================================== */
(function () {
  "use strict";
  const CFG = window.WEDDING || {};
  // Бардык варианттар бир скриптти колдонот / Все варианты оформления (/, /v2/, /v3/) используют этот скрипт:
  // пути к файлам из config.js считаются от корня сайта (папки, где лежит script.js)
  const BASE = new URL(".", (document.currentScript && document.currentScript.src) || location.href);
  const asset = (p) => (!p || /^(https?:|data:|\/)/.test(p) ? p : new URL(p, BASE).href);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const body = document.body;
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Ар бир чакыруунун өз сактагычы / Свой ключ localStorage для каждого приглашения (сайты на одном домене)
  const NS = `toy:${CFG.date || ""}:${CFG.groom || ""}:`;
  const store = {
    get(k) { try { return localStorage.getItem(NS + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(NS + k, v); } catch (e) {} },
  };

  /* ---------- Ар дайым башынан / Всегда открывать с начала ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  toTop(); addEventListener("load", toTop); addEventListener("pageshow", toTop);
  body.classList.add("locked");

  /* ---------- Тил / Язык ---------- */
  const T = {
    ky: {
      coverKicker: "Үйлөнүү тойго чакыруу", tap: "Ачуу үчүн басыңыз", heroKicker: "Үйлөнүү той", titleSuffix: "Үйлөнүү той", dear: "Урматтуу {name}!",
      kInvite: "Чакыруу", kDate: "Той салтанаты", at: "саат", calBtn: "Календарга кошуу",
      kCountdown: "Тойго чейин", countdownTitle: "Калды", days: "күн", hours: "саат", minutes: "мүнөт", seconds: "секунд", done: "Бул күн келди!",
      kVenue: "Дарегибиз", routeBtn: "Картадан кароо", kHosts: "Той ээлери",
      kNotes: "Эскертүү", notesTitle: "Маанилүү маалымат", kRsvp: "Суроо", rsvpTitle: "Тойго келесизби?", rsvpSub: "Жообуңузду алдын ала билдирип коюңуз",
      nameLabel: "Аты-жөнүңүз", namePh: "Мисалы: Айбек Асанов", nameHint: "Жубайыңыз менен келе турчу болсоңуз, анын да атын кошо жазып кетиңиз",
      yes: "Келемин", both: "Жубайым менен келемин", no: "Келе албаймын", submit: "Жөнөтүү", sending: "Жөнөтүлүүдө…",
      err: "Ката кетти. Интернетти текшерип, кайра аракет кылыңыз.", thanks: "Рахмат!", thanksName: "Рахмат, {name}!",
      received: "Жообуңуз кабыл алынды.<br>Сизди тойдо күтөбүз.", receivedNo: "Жообуңуз кабыл алынды.<br>Кийинки жолу сөзсүз көрүшөбүз!",
      guestsLabel: "Канча адам келесиз?", wishLabel: "Каалоо (милдеттүү эмес)", wishPh: "Жаш үй-бүлөгө бир-эки жылуу сөз…", change: "Жоопту өзгөртүү",
      yourAnswer: "Сиздин жооп", people: "адам", cta: "Жооп берүү",
      kWishes: "Каалоолор", wishesTitle: "Конокторубуздун жылуу сөздөрү", wishHint: "Каалооңуз ушул сайттагы «Каалоолор» бөлүмүндө көрүнөт",
      labels: { yes: "Келемин", both: "Жубайым менен келемин", no: "Келе албаймын" },
      wa: (g, b) => `Саламатсызбы! ${g} менен ${b} үйлөнүү тоюна жооп 💍`, waName: "Аты-жөнү", waAnswer: "Жооп", calTitle: (g, b) => `${g} & ${b} — үйлөнүү той`,
      months: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
      weekdays: ["Жекшемби", "Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума", "Ишемби"],
      dow: ["Дүй", "Шей", "Шар", "Бей", "Жум", "Ише", "Жек"],
      dateLong: (d, m, y) => `${d}-${m} ${y}-жыл`,
    },
    ru: {
      coverKicker: "Приглашение на свадьбу", tap: "Нажмите, чтобы открыть", heroKicker: "Свадьба", titleSuffix: "Свадьба", dear: "Дорогие {name}!",
      kInvite: "Приглашение", kDate: "Торжество", at: "в", calBtn: "Добавить в календарь",
      kCountdown: "До торжества", countdownTitle: "Осталось", days: "дней", hours: "часов", minutes: "минут", seconds: "секунд", done: "Этот день настал!",
      kVenue: "Адрес", routeBtn: "Открыть карту", kHosts: "Хозяева торжества",
      kNotes: "Важно", notesTitle: "Полезная информация", kRsvp: "Ответ", rsvpTitle: "Вы придёте?", rsvpSub: "Пожалуйста, ответьте заранее",
      nameLabel: "Ваше имя и фамилия", namePh: "Например: Айбек Асанов", nameHint: "Если придёте с супругом(ой), укажите и его/её имя",
      yes: "Приду", both: "Приду с супругом(ой)", no: "К сожалению, не смогу", submit: "Отправить", sending: "Отправляем…",
      err: "Ошибка. Проверьте интернет и попробуйте ещё раз.", thanks: "Спасибо!", thanksName: "Спасибо, {name}!",
      received: "Ваш ответ принят.<br>Ждём вас на торжестве.", receivedNo: "Ваш ответ принят.<br>Обязательно увидимся в другой раз!",
      guestsLabel: "Сколько человек придёт?", wishLabel: "Пожелание (необязательно)", wishPh: "Пара тёплых слов молодой семье…", change: "Изменить ответ",
      yourAnswer: "Ваш ответ", people: "чел.", cta: "Ответить",
      kWishes: "Пожелания", wishesTitle: "Тёплые слова гостей", wishHint: "Ваше пожелание появится на сайте в разделе «Пожелания»",
      labels: { yes: "Приду", both: "Приду с супругом(ой)", no: "Не смогу" },
      wa: (g, b) => `Здравствуйте! Ответ на приглашение на свадьбу ${g} и ${b} 💍`, waName: "Имя", waAnswer: "Ответ", calTitle: (g, b) => `${g} & ${b} — свадьба`,
      months: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
      weekdays: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
      dow: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      dateLong: (d, m, y) => `${d} ${m} ${y} года`,
    },
  };
  const MONTHS_NOM = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  let LANG = "ky";
  try { const saved = localStorage.getItem("lang"); if (saved === "ru" || saved === "ky") LANG = saved; } catch (e) {}
  const t = (k) => (T[LANG][k] !== undefined ? T[LANG][k] : T.ky[k]);
  // Орусча тексттер config.ru ичинде / Русские тексты лежат в config.ru
  const cfgL = (k) => (LANG === "ru" && CFG.ru && CFG.ru[k] !== undefined && CFG.ru[k] !== "" ? CFG.ru[k] : CFG[k]);

  /* ---------- Күн / Дата ---------- */
  const [Y, M, D] = (CFG.date || "2026-11-07").split("-").map(Number);
  const [hh, mm] = (CFG.timeStart || "17:00").split(":").map(Number);
  const eventDate = new Date(Y, M - 1, D, hh, mm, 0);
  const pad2 = (n) => String(n).padStart(2, "0");
  const initial = (s) => Array.from(String(s || "").trim())[0] || "";

  let values = {};
  // Шаблондогу {groom}, {timeStart} ж.б. алмаштыруу / подстановки в текстах
  const fill = (s) => String(s || "").replace(/\{(\w+)\}/g, (_, k) => (values[k] !== undefined ? values[k] : CFG[k] !== undefined ? CFG[k] : `{${k}}`));
  function computeValues() {
    values = {
      groom: CFG.groom, bride: CFG.bride, brideGenitive: CFG.brideGenitive,
      groomInitial: initial(CFG.groom), brideInitial: initial(CFG.bride),
      dateDay: pad2(D), dateMonth: pad2(M), dateYear: String(Y), dateShort: `${pad2(D)}.${pad2(M)}.${Y}`,
      monthName: MONTHS_NOM[M - 1], dateLong: t("dateLong")(D, t("months")[M - 1], Y),
      weekday: t("weekdays")[eventDate.getDay()],
      timeStart: CFG.timeStart, timeEnd: CFG.timeEnd,
      timeRange: CFG.timeEnd ? `${CFG.timeStart} — ${CFG.timeEnd}` : CFG.timeStart,
      venueName: cfgL("venueName"),
      addressLine: [cfgL("region"), cfgL("venueAddress")].filter(Boolean).join(", "),
      inviteTitle: cfgL("inviteTitle"), hostsText: cfgL("hostsText"), closingText: cfgL("closingText"),
    };
    values.inviteText = fill(cfgL("inviteText"));
  }
  function fillValues() {
    $$("[data-cfg]").forEach((el) => {
      const v = values[el.dataset.cfg];
      if (el.dataset.cfg === "addressLine") { el.textContent = v || ""; el.hidden = !v; return; }
      if (v !== undefined && v !== null && v !== "") el.textContent = v;
    });
    document.title = `${CFG.groom} & ${CFG.bride} — ${t("titleSuffix")}`;
    document.documentElement.lang = LANG;
  }
  computeValues(); fillValues();

  /* ---------- Оймолор / Орнаменты ---------- */
  // Түндүктүн нурлары / Лучи тюндюка
  (function rays() {
    const g = $("#rays-g"); if (!g) return;
    let html = "";
    for (let i = 0; i < 40; i++) {
      const a = (i * 9 * Math.PI) / 180, r1 = 52, r2 = i % 2 ? 66 : 80;
      html += `<line x1="${(100 + r1 * Math.sin(a)).toFixed(2)}" y1="${(100 - r1 * Math.cos(a)).toFixed(2)}" x2="${(100 + r2 * Math.sin(a)).toFixed(2)}" y2="${(100 - r2 * Math.cos(a)).toFixed(2)}"/>`;
    }
    g.innerHTML = html;
  })();
  $$(".card--orn").forEach((c) => ["tl", "tr", "bl", "br"].forEach((p) => {
    c.insertAdjacentHTML("beforeend", `<svg class="card__corner card__corner--${p}" aria-hidden="true"><use href="#corner"/></svg>`);
  }));

  /* ---------- Сүрөт / Фото в арке ---------- */
  const heroPhoto = $("#hero-photo");
  if (CFG.heroImage && heroPhoto) { heroPhoto.style.setProperty("--hero-img", `url("${asset(CFG.heroImage)}")`); heroPhoto.hidden = false; }

  /* ---------- Жеке кайрылуу: ?g=Аты / Персональное обращение ---------- */
  const GUEST = (new URLSearchParams(location.search).get("g") || "").trim().slice(0, 60);
  function applyGuest() {
    ["#guest", "#intro-guest"].forEach((s) => {
      const el = $(s); if (!el) return;
      el.hidden = !GUEST; el.textContent = GUEST ? t("dear").replace("{name}", GUEST) : "";
    });
    const inp = $("#rsvp-form input[name=name]"); if (GUEST && inp && !inp.value) inp.value = GUEST;
  }
  applyGuest();

  /* ---------- Сөз-сөз / Появление текста по словам ---------- */
  const WORD_ELS = ".lead, .hosts__text, .footer__text";
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/); el.textContent = "";
    words.forEach((w, i) => { const s = document.createElement("span"); s.className = "word"; s.style.setProperty("--w", i); s.textContent = w; el.appendChild(s); el.appendChild(document.createTextNode(" ")); });
  }

  /* ---------- Той ээлери / Хозяева ---------- */
  function renderHosts() {
    const box = $("#hosts-list");
    const list = CFG.hosts && CFG.hosts.length ? CFG.hosts : CFG.hostFather || CFG.hostMother ? [{ father: CFG.hostFather, mother: CFG.hostMother }] : [];
    box.innerHTML = list.map((h) => {
      const names = [h.father, h.mother].filter(Boolean).map((n) => `<span>${esc(n)}</span>`).join("<i>&amp;</i>");
      return `<div class="host"><svg class="orn" aria-hidden="true"><use href="#horn"/></svg>${h.label ? `<p class="host__label">${esc(h.label)}</p>` : ""}<p class="host__names">${names}</p></div>`;
    }).join("");
    box.style.gridTemplateColumns = list.length === 1 ? "minmax(0, 300px)" : "";
    box.style.justifyContent = "center";
  }

  /* ---------- Эскертүүлөр / Заметки ---------- */
  const ICONS = ["clock", "flower", "camera", "heart", "gift", "music", "dress", "pin", "cal", "rings", "letter"];
  function renderNotes() {
    const notes = cfgL("notes") || [];
    $("#notes-sec").hidden = !notes.length;
    $("#notes").innerHTML = notes.map((n) => {
      const icon = ICONS.includes(n.icon) ? `<svg><use href="#i-${n.icon}"/></svg>` : esc(n.icon || "✨");
      return `<div class="note card"><div class="note__icon" aria-hidden="true">${icon}</div><p>${esc(fill(n.text))}</p></div>`;
    }).join("");
  }

  /* ---------- Календарь ---------- */
  function buildCalendar() {
    const first = new Date(Y, M - 1, 1);
    const daysIn = new Date(Y, M, 0).getDate();
    let offset = first.getDay() - 1; if (offset < 0) offset = 6; // дүйшөмбүдөн башталат / с понедельника
    let html = `<div class="cal__month">${MONTHS_NOM[M - 1]} ${Y}</div><div class="cal__grid">`;
    t("dow").forEach((d) => (html += `<div class="dow">${d}</div>`));
    for (let i = 0; i < offset; i++) html += "<div></div>";
    for (let d = 1; d <= daysIn; d++) {
      const dow = (offset + d - 1) % 7;
      if (d === D) {
        html += `<div class="ev">${d}<svg viewBox="0 0 52 48" aria-hidden="true"><path class="circ" d="M27 5 C 40 4, 49 13, 48 25 C 47 37, 36 44, 25 43 C 13 42, 4 34, 5 23 C 6 12, 16 5, 30 6"/><path class="hrt" d="M44 10 c-3.2-2.2-5.4-4-5.4-6.2 a2.4 2.4 0 0 1 5.4-1.1 a2.4 2.4 0 0 1 5.4 1.1 c0 2.2-2.2 4-5.4 6.2z"/></svg></div>`;
      } else html += `<div class="${dow >= 5 ? "wknd" : ""}">${d}</div>`;
    }
    $("#calendar").innerHTML = html + "</div>";
  }

  // Календарга кошуу / Добавить в календарь (Google Calendar, на iPhone — .ics)
  function calendarLink() {
    const a = $("#cal-btn"); if (!a) return;
    const f = (d) => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;
    const end = CFG.timeEnd ? new Date(Y, M - 1, D, ...CFG.timeEnd.split(":").map(Number), 0) : new Date(eventDate.getTime() + 5 * 3600e3);
    const where = values.addressLine ? `${values.venueName}, ${values.addressLine}` : values.venueName || "";
    const p = new URLSearchParams({ action: "TEMPLATE", text: t("calTitle")(CFG.groom, CFG.bride), dates: `${f(eventDate)}/${f(end)}`, details: location.href.split("#")[0], location: where });
    a.href = `https://calendar.google.com/calendar/render?${p}`;
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) { a.href = asset("assets/toy.ics"); a.removeAttribute("target"); }
  }

  /* ---------- Карта ---------- */
  (function map() {
    const coords = (CFG.coords || "").replace(/\s+/g, "");
    const query = coords || CFG.mapQuery || [CFG.region, CFG.venueAddress].filter(Boolean).join(" ");
    const frame = $("#map");
    if (CFG.mapEmbedUrl || query) {
      frame.src = CFG.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${coords ? 17 : 16}&output=embed&hl=ru`;
      frame.hidden = false; $("#map-empty").hidden = true;
    }
    const search = ((CFG.ru && CFG.ru.venueName) || CFG.venueName || "").replace(/[«»"]/g, "").trim();
    $("#route-btn").href = CFG.routeUrl
      || (coords ? `https://www.google.com/maps/search/?api=1&query=${coords}`
      : query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      : `https://2gis.kg/search/${encodeURIComponent(search)}`);
  })();

  function renderAll() {
    computeValues(); fillValues(); applyGuest(); renderHosts(); renderNotes(); buildCalendar(); calendarLink();
    $$(WORD_ELS).forEach(splitWords);
    $$(".reveal").forEach((r) => Array.from(r.children).forEach((c, i) => c.style.setProperty("--n", i)));
  }
  renderAll();
  $$(".arch__inner > *").forEach((c, i) => c.style.setProperty("--n", i));

  /* ---------- Тойго чейин / Обратный отсчёт ---------- */
  (function countdown() {
    const box = $("#countdown");
    const u = { days: $('[data-unit="days"]'), hours: $('[data-unit="hours"]'), minutes: $('[data-unit="minutes"]'), seconds: $('[data-unit="seconds"]') };
    function set(el, v) {
      const s = pad2(v);
      if (el.textContent !== s) { el.textContent = s; el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
    }
    let rolling = false, done = false;
    function parts() { const s = Math.max(0, Math.floor((eventDate - new Date()) / 1000)); return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60]; }
    function show(v) { set(u.days, v[0]); set(u.hours, v[1]); set(u.minutes, v[2]); set(u.seconds, v[3]); }
    function tick() {
      if (eventDate - new Date() <= 0) { done = true; box.innerHTML = `<div class="cd--done">${esc(t("done"))}</div>`; return; }
      if (!rolling) show(parts());
      setTimeout(tick, 1000 - (Date.now() % 1000));
    }
    tick();
    // Сандар «айланып» чыгат / Цифры раскручиваются при показе
    window.__rollCountdown = () => {
      if (rolling || done || REDUCED) return; rolling = true; const t0 = performance.now(), target = parts();
      (function step(now) {
        const k = Math.min(1, (now - t0) / 1500), e = 1 - Math.pow(1 - k, 3);
        show(target.map((v) => Math.round(v * e)));
        if (k < 1) requestAnimationFrame(step); else { rolling = false; show(parts()); }
      })(t0);
    };
  })();

  /* ---------- Скролл-анимация / Появление при прокрутке ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) { e.target.classList.remove("in"); return; }
      if (e.intersectionRatio < 0.12 || e.target.classList.contains("in")) return;
      e.target.classList.add("in");
      if (e.target.closest(".sec--countdown") && window.__rollCountdown) setTimeout(window.__rollCountdown, 250);
    });
  }, { threshold: [0, 0.12], rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  let sTick = false;
  addEventListener("scroll", () => {
    if (sTick) return; sTick = true;
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--sp", (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)).toFixed(4));
      sTick = false;
    });
  }, { passive: true });
  $$(".btn").forEach((b) => b.addEventListener("pointerdown", (e) => {
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const sp = document.createElement("span"); sp.className = "ripple";
    sp.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(sp); setTimeout(() => sp.remove(), 800);
  }));
  const hint = $(".scroll-hint");
  if (hint) hint.addEventListener("click", (e) => { e.preventDefault(); $("#invite").scrollIntoView({ behavior: "smooth" }); });

  /* ---------- Алтын чаң / Золотая пыль ---------- */
  const rootCss = getComputedStyle(document.documentElement);
  const DUST_RGB = rootCss.getPropertyValue("--dust-rgb").trim() || "247,232,196";
  const DUST_SPEED = parseFloat(rootCss.getPropertyValue("--dust-speed")) || 1;
  function dust(canvas, n) {
    if (REDUCED || !canvas) return { start() {}, stop() {} };
    const ctx = canvas.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = 0, on = false, ps = [];
    function resize() { W = canvas.width = canvas.clientWidth * dpr; H = canvas.height = canvas.clientHeight * dpr; }
    function seed() {
      ps = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H, r: (0.6 + Math.random() * 1.7) * dpr,
        vy: -(0.1 + Math.random() * 0.3) * dpr * DUST_SPEED, vx: (Math.random() - 0.5) * 0.15 * dpr * DUST_SPEED, t: Math.random() * 6.3, ts: 0.01 + Math.random() * 0.03,
      }));
    }
    function draw() {
      if (!on) return;
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p) => {
        p.t += p.ts; p.y += p.vy; p.x += p.vx + Math.sin(p.t) * 0.15 * dpr * DUST_SPEED;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        const a = 0.2 + 0.55 * (0.5 + 0.5 * Math.sin(p.t * 2));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = `rgba(${DUST_RGB},${a})`; ctx.fill();
        if (p.r > 1.7 * dpr) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, 6.283); ctx.fillStyle = `rgba(${DUST_RGB},${a * 0.12})`; ctx.fill(); }
      });
      raf = requestAnimationFrame(draw);
    }
    addEventListener("resize", () => { resize(); seed(); });
    return {
      start() { if (on) return; if (!W) { resize(); seed(); } on = true; draw(); },
      stop() { on = false; cancelAnimationFrame(raf); },
    };
  }
  const introDust = dust($("#dust"), Math.min(70, Math.floor(innerWidth / 8)));
  const heroDust = dust($("#hero-dust"), Math.min(46, Math.floor(innerWidth / 12)));
  introDust.start();

  /* ---------- Учкундар / Конфетти и искры ---------- */
  const burst = (function () {
    const canvas = $("#fx"); if (REDUCED || !canvas) return () => {};
    const ctx = canvas.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2);
    const COLORS = (getComputedStyle(document.documentElement).getPropertyValue("--confetti").trim() || "#e7cd92,#c9a464,#f7e8c4,#9c7840,#8a2e45,#e6b9c0").split(",").map((c) => c.trim());
    let parts = [], raf = 0;
    function resize() { canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; }
    addEventListener("resize", resize); resize();
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.09 * dpr; p.vx *= 0.985; p.vy *= 0.985; p.a += p.va; p.life -= 0.009;
        if (p.life <= 0 || p.y > canvas.height + 40) { parts.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.min(1, p.life * 1.6); ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 6.283); ctx.fill(); }
        else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2 * (0.5 + 0.5 * Math.abs(Math.sin(p.a * 2))));
        ctx.restore();
      }
      raf = parts.length ? requestAnimationFrame(draw) : 0;
    }
    return (x, y, n = 90) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.283, v = (2 + Math.random() * 7) * dpr;
        parts.push({ x: x * dpr, y: y * dpr, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3 * dpr, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3,
          s: (4 + Math.random() * 6) * dpr, c: COLORS[(Math.random() * COLORS.length) | 0], round: Math.random() < 0.35, life: 1 });
      }
      if (!raf) raf = requestAnimationFrame(draw);
    };
  })();

  /* ---------- Гүл желекчелери / Лепестки (если в оформлении есть <canvas id="petals">) ---------- */
  function startPetals() {
    const canvas = $("#petals"); if (!canvas || REDUCED || canvas.dataset.on) return;
    canvas.dataset.on = "1";
    const ctx = canvas.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2);
    const COLORS = (rootCss.getPropertyValue("--petal-colors").trim() || "#f3c9c4,#eab3b0,#f7dcd6,#e9c4bd").split(",").map((c) => c.trim());
    let W = 0, H = 0;
    const resize = () => { W = canvas.width = innerWidth * dpr; H = canvas.height = innerHeight * dpr; };
    addEventListener("resize", resize); resize();
    const N = Math.min(20, Math.max(10, Math.floor(innerWidth / 32)));
    const make = (init) => ({
      x: Math.random() * W, y: init ? Math.random() * H : -20 * dpr, r: (5 + Math.random() * 7) * dpr,
      vy: (0.3 + Math.random() * 0.55) * dpr, vx: (Math.random() - 0.5) * 0.4 * dpr, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.03,
      sw: Math.random() * 6.28, flip: Math.random() * 6.28, c: COLORS[(Math.random() * COLORS.length) | 0], o: 0.45 + Math.random() * 0.4,
    });
    const ps = Array.from({ length: N }, () => make(true));
    let wind = 0;
    addEventListener("scroll", () => { wind = Math.min(2.5, wind + 0.25); }, { passive: true });
    (function draw() {
      ctx.clearRect(0, 0, W, H); wind *= 0.95;
      for (const p of ps) {
        p.sw += 0.02 + wind * 0.01; p.flip += 0.03; p.y += p.vy * (1 + wind); p.a += p.va * (1 + wind);
        p.x += p.vx + Math.sin(p.sw) * (0.4 + wind * 0.3) * dpr;
        if (p.y > H + 30 || p.x < -40 || p.x > W + 40) Object.assign(p, make(false));
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.flip))); ctx.globalAlpha = p.o;
        const g = ctx.createRadialGradient(-p.r * 0.3, -p.r * 0.4, 0, 0, 0, p.r * 1.1);
        g.addColorStop(0, "#fff7f4"); g.addColorStop(1, p.c); ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(0, -p.r);
        ctx.bezierCurveTo(p.r, -p.r, p.r, p.r * 0.6, 0, p.r);
        ctx.bezierCurveTo(-p.r, p.r * 0.6, -p.r, -p.r, 0, -p.r);
        ctx.fill(); ctx.restore();
      }
      requestAnimationFrame(draw);
    })();
  }

  /* ---------- Музыка ---------- */
  const audio = $("#bg-music"), musicBtn = $("#music-btn");
  if (CFG.music) audio.src = asset(CFG.music);
  audio.volume = 0;
  let fadeTimer = null;
  function fadeTo(target, ms = 1500) {
    clearInterval(fadeTimer);
    const start = audio.volume, steps = 30; let i = 0;
    fadeTimer = setInterval(() => {
      i++; audio.volume = Math.max(0, Math.min(1, start + (target - start) * (i / steps)));
      if (i >= steps) { clearInterval(fadeTimer); if (target === 0) audio.pause(); }
    }, ms / steps);
  }
  function setPlaying(on) { musicBtn.classList.toggle("is-playing", on); musicBtn.setAttribute("aria-pressed", on ? "true" : "false"); }
  let userPaused = false;
  // Браузер үндү бөгөттөсө (мисалы, мукаба сыдыруу менен ачылса) — кийинки басууда кайра коёбуз.
  // Если браузер не дал включить звук (например, обложку открыли свайпом — это не «нажатие»),
  // музыка стартует от следующего касания: отпускания пальца после свайпа, тапа или клавиши.
  const GESTURES = ["touchend", "pointerup", "click", "keydown"];
  let armed = false;
  function playOnNextGesture() {
    if (armed) return; armed = true;
    const go = (e) => {
      if (e && e.target && e.target.closest && e.target.closest("#music-btn")) return; // кнопку музыки обрабатывает её обработчик
      armed = false; GESTURES.forEach((ev) => removeEventListener(ev, go, true));
      if (!userPaused && audio.paused) play();
    };
    GESTURES.forEach((ev) => addEventListener(ev, go, { capture: true, passive: true }));
  }
  function play() {
    if (!audio.src) return;
    const p = audio.play();
    if (p && p.then) p.then(() => { fadeTo(0.7); setPlaying(true); }).catch(() => { setPlaying(false); playOnNextGesture(); });
    else { fadeTo(0.7); setPlaying(true); }
  }
  function pause() { fadeTo(0, 700); setPlaying(false); }
  musicBtn.addEventListener("click", () => {
    if (audio.paused || !musicBtn.classList.contains("is-playing")) { userPaused = false; play(); } else { userPaused = true; pause(); }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !audio.paused) audio.pause();
    else if (!document.hidden && musicBtn.classList.contains("is-playing")) audio.play().catch(() => {});
  });

  /* ---------- Мукаба: эшиктер ачылат / Обложка: двери открываются ---------- */
  const intro = $("#intro");
  // Ар бир варианттын өз убактысы / тайминги обложки задаются в data-unlock / data-hide у #intro
  const UNLOCK = Number(intro.dataset.unlock || 450), HIDE = Number(intro.dataset.hide || 1500);
  function openInvite() {
    if (intro.classList.contains("is-open")) return;
    intro.classList.add("is-open");
    play();
    playOnNextGesture(); // свайп/колесо не считаются нажатием — страхуемся следующим касанием
    const r = ($(".seal__disc") || $("#open-btn")).getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 70);
    setTimeout(() => { body.classList.remove("locked"); body.classList.add("opened"); heroDust.start(); startPetals(); }, UNLOCK);
    setTimeout(() => musicBtn.classList.add("is-visible"), HIDE - 200);
    setTimeout(() => { intro.classList.add("is-hidden"); introDust.stop(); }, HIDE);
    removeEventListener("wheel", onWheel); removeEventListener("keydown", onKey);
  }
  const onWheel = (e) => { if (e.deltaY > 0) openInvite(); };
  const onKey = (e) => { if (["ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) openInvite(); };
  let touchY = null;
  intro.addEventListener("click", openInvite);
  intro.addEventListener("touchstart", (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  intro.addEventListener("touchmove", (e) => { if (touchY !== null && touchY - e.touches[0].clientY > 12) openInvite(); }, { passive: true });
  addEventListener("wheel", onWheel, { passive: true });
  addEventListener("keydown", onKey);
  // Башкы экран көрүнбөсө чаң токтойт / Пыль на главном экране только когда он виден
  new IntersectionObserver((en) => en.forEach((e) => (e.isIntersecting && body.classList.contains("opened") ? heroDust.start() : heroDust.stop()))).observe($("#hero"));

  /* ---------- Каалоолор / Пожелания гостей на сайте (из Google Таблицы, колонка «Сайтта») ---------- */
  const wishesSec = $("#wishes-sec"), wishesBox = $("#wishes");
  let wishes = [];
  function renderWishes() {
    if (!wishesSec) return;
    wishesSec.hidden = !wishes.length;
    wishesBox.innerHTML = wishes.map((w) => `<figure class="wish"><svg class="wish__q" aria-hidden="true"><use href="#i-quote"/></svg><blockquote>${esc(w.wish)}</blockquote><figcaption>${esc(w.name)}</figcaption></figure>`).join("");
    wishesBox.scrollLeft = 0;
  }
  // JSONP: Apps Script отдаёт пожелания как вызов функции — работает в любом браузере, без CORS
  function loadWishes() {
    if (!wishesSec || !CFG.googleScriptUrl) return;
    const cb = `__wishes${Date.now()}`, s = document.createElement("script");
    const done = () => { delete window[cb]; s.remove(); };
    window[cb] = (data) => {
      done();
      const mine = wishes.filter((w) => w.mine);
      wishes = mine.concat(((data && data.wishes) || []).filter((w) => w && w.wish && !mine.some((m) => m.name === w.name)));
      renderWishes();
    };
    s.onerror = done;
    s.src = `${CFG.googleScriptUrl}${CFG.googleScriptUrl.includes("?") ? "&" : "?"}action=wishes&callback=${cb}`;
    document.head.appendChild(s);
  }
  // Гостьтун өз каалоосу дароо көрүнөт / Своё пожелание гость видит сразу после отправки
  function addOwnWish(prevName, name, wish) {
    if (!wishesSec || !CFG.googleScriptUrl) return;
    wishes = wishes.filter((w) => w.name !== name && w.name !== prevName);
    if (wish) wishes.unshift({ name, wish, mine: true });
    renderWishes();
  }
  // Лента сама листается, пока её не трогают / Auto-advance while visible and untouched
  if (wishesBox) {
    let hold = 0, visible = false;
    ["pointerdown", "touchstart", "wheel"].forEach((ev) => wishesBox.addEventListener(ev, () => (hold = Date.now() + 9000), { passive: true }));
    new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(wishesBox);
    setInterval(() => {
      if (!visible || REDUCED || Date.now() < hold || wishesBox.children.length < 2) return;
      const step = wishesBox.children[0].getBoundingClientRect().width + 14;
      const atEnd = wishesBox.scrollLeft + wishesBox.clientWidth >= wishesBox.scrollWidth - 6;
      wishesBox.scrollTo({ left: atEnd ? 0 : wishesBox.scrollLeft + step, behavior: "smooth" });
    }, 4800);
  }
  loadWishes();

  /* ---------- Суроо (RSVP) ---------- */
  function recordSheet(payload) {
    if (!CFG.googleScriptUrl) return Promise.resolve(false);
    return fetch(CFG.googleScriptUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) }).then(() => true).catch(() => false);
  }
  const tgReady = () => !!(CFG.telegram && CFG.telegram.token && CFG.telegram.chatId);
  async function sendTelegram(text) {
    if (!tgReady()) return false;
    // chatId: бир же бир нече id үтүр менен / один или несколько id через запятую, либо id группы/канала
    const ids = String(CFG.telegram.chatId).split(/[,\s]+/).filter(Boolean);
    const results = await Promise.all(ids.map((id) =>
      fetch(`https://api.telegram.org/bot${CFG.telegram.token}/sendMessage`, { method: "POST", body: new URLSearchParams({ chat_id: id, text }) }).then((r) => r.ok).catch(() => false)));
    return results.some(Boolean);
  }

  const form = $("#rsvp-form"), note = $("#form-note"), submitBtn = $("#rsvp-submit");
  const guestsInput = form.guests, guestsVal = $("#guests-val");
  const MAXG = 8;
  function setGuests(n) {
    n = Math.max(1, Math.min(MAXG, n));
    guestsInput.value = String(n); guestsVal.textContent = String(n);
    $('[data-step="-1"]').disabled = n <= 1; $('[data-step="1"]').disabled = n >= MAXG;
  }
  $$(".stepper__btn").forEach((b) => b.addEventListener("click", () => setGuests(Number(guestsInput.value) + Number(b.dataset.step))));
  // «Келе албаймын» болсо адам саны жашырылат, «жубайым менен» болсо 2ден кем эмес
  function syncGuests() {
    const a = form.attend.value;
    $("#guests-field").hidden = a === "no";
    if (a === "both" && Number(guestsInput.value) < 2) setGuests(2);
  }
  $$("input[name=attend]", form).forEach((r) => r.addEventListener("change", syncGuests));
  setGuests(1); syncGuests();

  let lastAnswer = null;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameField = form.name.closest(".field");
    const name = form.name.value.trim().slice(0, 80);
    if (!name) { nameField.classList.remove("is-error"); void nameField.offsetWidth; nameField.classList.add("is-error"); form.name.focus(); return; }
    nameField.classList.remove("is-error");
    const attend = form.attend.value;
    const guests = attend === "no" ? 0 : Number(guestsInput.value || 1);
    const wish = (form.wish.value || "").trim().slice(0, 300);
    // Ошол эле жооп экинчи жолу жөнөтүлбөйт / тот же ответ повторно не отправляется
    const same = lastAnswer && lastAnswer.name === name && lastAnswer.attend === attend && lastAnswer.guests === guests && lastAnswer.wish === wish;
    if (same && lastAnswer.sent) { showSuccess(); return; }
    const changed = !!(lastAnswer && lastAnswer.sent);
    const d = new Date(), stamp = `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    const answerLine = attend === "no" ? `❌ ${T.ky.labels.no}` : `✅ ${T.ky.labels[attend]} · ${guests} адам`;
    const text = [`${changed ? "🔄 Жооп өзгөртүлдү" : "💌 Жаңы жооп"} · ${CFG.groom} & ${CFG.bride}`, `👤 ${name}`, answerLine, wish ? `💬 ${wish}` : null, `🕒 ${stamp}`, attend === "no" ? "#келбейм" : "#келем"].filter(Boolean).join("\n");
    const prev = lastAnswer;
    lastAnswer = { name, attend, guests, wish, sent: true };
    // Таблицага жазуу фондо / запись в таблицу идёт параллельно уведомлению
    const sheet = recordSheet({ name, rsvp: attend, rsvpLabel: T.ky.labels[attend], guests, wish, changed, prevName: changed && prev ? prev.name : "", timestamp: d.toISOString() });
    const ok = () => { addOwnWish(prev && prev.name, name, wish); showSuccess(); };
    const fail = () => { lastAnswer = prev; submitBtn.disabled = false; note.textContent = t("err"); };

    submitBtn.disabled = true; note.textContent = t("sending");
    if (tgReady()) {
      if (await sendTelegram(text)) { ok(); return; }
      if (!CFG.googleScriptUrl && !CFG.whatsapp) { fail(); return; }
    }
    // Таблица: если интернет пропал — гость видит ошибку и может отправить ещё раз (ответ не теряется молча)
    if (CFG.googleScriptUrl) {
      if (await sheet) { ok(); return; }
      if (!CFG.whatsapp) { fail(); return; }
    }
    if (CFG.whatsapp) {
      const wa = [t("wa")(CFG.groom, CFG.bride), `${t("waName")}: ${name}`, `${t("waAnswer")}: ${t("labels")[attend]}${guests ? " · " + guests + " " + t("people") : ""}`, wish ? `💬 ${wish}` : null].filter(Boolean).join("\n");
      showSuccess();
      setTimeout(() => { location.href = `https://wa.me/${String(CFG.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(wa)}`; }, 500);
      return;
    }
    if (!tgReady() && !CFG.googleScriptUrl) console.warn("RSVP: config.js ичинде telegram.chatId / googleScriptUrl / whatsapp толтурулган эмес — жооп эч жакка кетпейт.");
    showSuccess();
  });
  function renderSuccess(a) {
    $("#thanks-title").textContent = a && a.name ? t("thanksName").replace("{name}", a.name.split(/\s+/)[0]) : t("thanks");
    $("#thanks-text").innerHTML = a && a.attend === "no" ? t("receivedNo") : t("received");
    $("#answer-echo").textContent = a ? `${t("yourAnswer")}: ${t("labels")[a.attend]}${a.guests ? " · " + a.guests + " " + t("people") : ""}` : "";
  }
  function showSuccess(silent) {
    store.set("rsvp", JSON.stringify({ name: lastAnswer.name, attend: lastAnswer.attend, guests: lastAnswer.guests, wish: lastAnswer.wish }));
    renderSuccess(lastAnswer);
    form.hidden = true; $("#rsvp-success").hidden = false;
    submitBtn.disabled = false; note.textContent = "";
    updateCta();
    if (!silent) { const r = $(".form-card").getBoundingClientRect(); burst(innerWidth / 2, Math.min(innerHeight * 0.6, Math.max(80, r.top + 80)), 120); }
  }
  // Конок мурун жооп берген болсо / Гость уже отвечал с этого телефона
  try {
    const saved = JSON.parse(store.get("rsvp") || "null");
    if (saved && saved.name) {
      lastAnswer = Object.assign({ sent: true }, saved);
      form.name.value = saved.name; form.attend.value = saved.attend; if (saved.guests) setGuests(saved.guests); form.wish.value = saved.wish || ""; syncGuests();
      showSuccess(true);
    }
  } catch (e) {}
  $("#change-btn").addEventListener("click", () => { $("#rsvp-success").hidden = true; form.hidden = false; form.name.focus(); updateCta(); });

  /* ---------- «Жооп берүү» баскычы / Плавающая кнопка ответа ---------- */
  const cta = $("#cta");
  const seen = { hero: true, rsvp: false, footer: false };
  function updateCta() {
    const on = !seen.hero && !seen.rsvp && !seen.footer && body.classList.contains("opened") && $("#rsvp-success").hidden;
    cta.classList.toggle("is-on", on); cta.setAttribute("aria-hidden", on ? "false" : "true"); cta.tabIndex = on ? 0 : -1;
  }
  const ctaIo = new IntersectionObserver((en) => { en.forEach((e) => (seen[e.target.dataset.cta] = e.isIntersecting)); updateCta(); });
  [["hero", "#hero"], ["rsvp", "#rsvp"], ["footer", ".footer"]].forEach(([k, s]) => { const el = $(s); el.dataset.cta = k; ctaIo.observe(el); });
  cta.addEventListener("click", (e) => { e.preventDefault(); $("#rsvp").scrollIntoView({ behavior: "smooth" }); });

  /* ---------- Тилди алмаштыруу / Переключение языка ---------- */
  function applyLang(lang, first) {
    LANG = lang;
    try { localStorage.setItem("lang", lang); } catch (e) {}
    $$("[data-i18n]").forEach((el) => { const v = t(el.dataset.i18n); if (typeof v === "string") el.textContent = v; });
    $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$("#lang button").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === lang));
    if (first) return;
    renderAll();
    if (!$("#rsvp-success").hidden) renderSuccess(lastAnswer);
    if (body.classList.contains("opened")) $$(".reveal.in").forEach((r) => { r.classList.remove("in"); void r.offsetWidth; r.classList.add("in"); });
  }
  $$("#lang button").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (b.dataset.lang !== LANG) applyLang(b.dataset.lang); }));
  applyLang(LANG, LANG === "ky");
})();
