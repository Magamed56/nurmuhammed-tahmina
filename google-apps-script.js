/**
 * Google Apps Script — коноктордун жооптору жана каалоолору Google Таблицада.
 * Ответы гостей (RSVP) и пожелания: запись в Google Таблицу + выдача пожеланий для сайта.
 *
 * Орнотуу / Установка (≈5 минут):
 *  1. Создайте новую Google Таблицу (например «Той — Нурмухаммед & Тахмина»).
 *  2. Расширения → Apps Script. Удалите всё и вставьте этот файл. Сохраните (иконка дискеты).
 *  3. Вверху выберите функцию setupSheet и нажмите «Выполнить» (разрешите доступ) — появится лист «Жооптор».
 *  4. Развернуть → Новое развёртывание → ⚙ Тип: «Веб-приложение».
 *     Выполнять от имени: «Я». У кого есть доступ: «Все». Нажмите «Развернуть».
 *  5. Скопируйте URL веб-приложения (…/exec) и вставьте в config.js → googleScriptUrl.
 *
 * Колонка «Сайтта» — галочка: показывать пожелание на сайте. Снимите её, чтобы скрыть пожелание.
 * Если гость меняет ответ, его строка обновляется (а не добавляется новая) — итоги считаются верно.
 *
 * Код өзгөртүлсө / После изменения кода: Развернуть → Управление развёртываниями → ✏️ → Версия: Новая версия → Развернуть.
 */
var SHEET_NAME = "Жооптор";
// ID таблицы из её ссылки docs.google.com/spreadsheets/d/<ID>/edit — нужен, только если скрипт создан не из таблицы
var SPREADSHEET_ID = "";

var HEADERS = ["Убакыт", "Аты-жөнү", "Жооп", "Адам саны", "Каалоо", "Сайтта"];
var COL = { time: 1, name: 2, answer: 3, guests: 4, wish: 5, show: 6 };
var TOTALS_COL = 8; // H–I: итоги

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var raw = e && e.postData && e.postData.contents;
    var data = raw ? JSON.parse(raw) : (e && e.parameter) || {};
    var ok = saveAnswer(data);
    return json({ success: ok });
  } catch (err) {
    return json({ success: false, message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** ?action=wishes&callback=fn — пожелания для сайта (JSONP); без параметров — проверка, что скрипт работает. */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action !== "wishes") return ContentService.createTextOutput("RSVP backend иштеп жатат ✔").setMimeType(ContentService.MimeType.TEXT);
  var out = { wishes: getWishes(60) };
  var cb = String(p.callback || "").replace(/[^\w$.]/g, "");
  if (cb) return ContentService.createTextOutput(cb + "(" + JSON.stringify(out) + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  return json(out);
}

function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** Текшерүү / Проверка: выберите эту функцию и нажмите «Выполнить» — появится тестовая строка (потом удалите её). */
function testAppend() {
  saveAnswer({ name: "Тест (редактордон)", rsvp: "yes", guests: 2, wish: "Бактылуу болгула!", timestamp: new Date().toISOString() });
}

/** Баракты даярдоо / Подготовка листа: заголовки, ширина колонок, итоги. Можно запускать повторно — данные не трогает. */
function setupSheet() {
  var sheet = getOrCreateSheet();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight("bold").setBackground("#9E5A61").setFontColor("#FFFDFA");
  sheet.setColumnWidth(COL.time, 140); sheet.setColumnWidth(COL.name, 230); sheet.setColumnWidth(COL.answer, 200);
  sheet.setColumnWidth(COL.guests, 90); sheet.setColumnWidth(COL.wish, 340); sheet.setColumnWidth(COL.show, 70);
  sheet.getRange(1, COL.wish, sheet.getMaxRows(), 1).setWrap(true);
  sheet.setFrozenRows(1);
  sheet.getRange(1, TOTALS_COL, 3, 1).setValues([["Келет (жооп)"], ["Келбейт"], ["Адам саны"]]).setFontWeight("bold");
  sheet.setColumnWidth(TOTALS_COL, 120);
  updateTotals(sheet);
}

function saveAnswer(data) {
  var name = String(data.name || "").trim().slice(0, 80);
  var code = String(data.rsvp || "").trim();
  if (!name || !code) return false;                     // бош суроо / пустой запрос — не записываем
  var wish = String(data.wish || "").trim().slice(0, 300);
  var row = [new Date(data.timestamp || Date.now()), name, data.rsvpLabel || getLabel(code), Number(data.guests || 0), wish];
  var sheet = getOrCreateSheet();
  var at = data.changed ? findRowByName(sheet, String(data.prevName || name).trim()) : 0;  // гость изменил ответ — обновляем его строку
  if (!at) { sheet.appendRow(row); at = sheet.getLastRow(); }
  else sheet.getRange(at, 1, 1, row.length).setValues([row]);
  var show = sheet.getRange(at, COL.show);
  if (wish) { if (show.getValue() === "") show.insertCheckboxes().check(); }
  else show.clearDataValidations().clearContent();
  updateTotals(sheet);
  return true;
}

function findRowByName(sheet, name) {
  var last = sheet.getLastRow(); if (last < 2) return 0;
  var names = sheet.getRange(2, COL.name, last - 1, 1).getValues(), key = name.toLowerCase();
  for (var i = names.length - 1; i >= 0; i--) if (String(names[i][0]).trim().toLowerCase() === key) return i + 2;
  return 0;
}

/** Каалоолор / Пожелания с галочкой «Сайтта», новые сверху. */
function getWishes(limit) {
  var sheet = getOrCreateSheet(), last = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues(), out = [];
  for (var i = rows.length - 1; i >= 0 && out.length < limit; i--) {
    var r = rows[i], wish = String(r[COL.wish - 1] || "").trim();
    if (wish && r[COL.show - 1] === true) out.push({ name: String(r[COL.name - 1] || "").trim(), wish: wish });
  }
  return out;
}

/** Жыйынтык / Итоги: по столбцам «Жооп» и «Адам саны» (без формул — работает в любой локали). */
function updateTotals(sheet) {
  var last = sheet.getLastRow(), yes = 0, no = 0, people = 0;
  if (last > 1) {
    var rows = sheet.getRange(2, COL.answer, last - 1, 2).getValues();
    for (var i = 0; i < rows.length; i++) {
      var label = String(rows[i][0] || "");
      if (label.indexOf("Келе албаймын") >= 0) no++;
      else if (label.indexOf("Келемин") >= 0) { yes++; people += Number(rows[i][1]) || 0; }
    }
  }
  sheet.getRange(1, TOTALS_COL + 1, 3, 1).setValues([[yes], [no], [people]]);
}

function getOrCreateSheet() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function getLabel(code) {
  return { yes: "Келемин", both: "Жубайым менен келемин", no: "Келе албаймын" }[code] || code || "";
}
