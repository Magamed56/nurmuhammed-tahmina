/**
 * Google Apps Script — коноктордун жоопторун Google Таблицага сактоо.
 * Приём ответов гостей (RSVP) в Google Таблицу.
 *
 * Орнотуу / Установка:
 *  1. Создайте новую Google Таблицу.
 *  2. Расширения → Apps Script. Удалите всё и вставьте этот файл. Сохраните (иконка дискеты).
 *  3. Выберите функцию setupSheet и нажмите «Выполнить» (разрешите доступ) — появится лист «Жооптор».
 *  4. Развернуть → Новое развёртывание → Тип: «Веб-приложение».
 *     Выполнять от имени: «Я». У кого есть доступ: «Все». Нажмите «Развернуть».
 *  5. Скопируйте URL веб-приложения (…/exec) и вставьте в config.js → googleScriptUrl.
 *
 * Код өзгөртүлсө / После изменения кода: Развернуть → Управление развёртываниями → ✏️ → Версия: Новая версия → Развернуть.
 */
var SHEET_NAME = "Жооптор";
// ID таблицы из её ссылки: docs.google.com/spreadsheets/d/<ID>/edit
// Если указан — ответы пишутся именно в неё, даже если скрипт создан не из этой таблицы.
var SPREADSHEET_ID = "";

var HEADERS = ["Убакыт", "Аты-жөнү", "Жооп", "Адам саны", "Каалоо"];

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents;
    var data = raw ? JSON.parse(raw) : (e && e.parameter) || {};
    var ok = appendAnswer(data);
    return ContentService.createTextOutput(JSON.stringify({ success: ok })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("RSVP backend иштеп жатат ✔").setMimeType(ContentService.MimeType.TEXT);
}

/** Текшерүү / Проверка: выберите эту функцию в редакторе и нажмите «Выполнить» — в таблице появится тестовая строка. */
function testAppend() {
  appendAnswer({ name: "Тест (редактордон)", rsvp: "yes", guests: 2, wish: "Текшерүү", timestamp: new Date().toISOString() });
}

/** Баракты даярдоо / Подготовка листа: заголовки, ширина колонок, итоги. Можно запускать повторно — данные не трогает. */
function setupSheet() {
  var sheet = getOrCreateSheet();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight("bold").setBackground("#4C463F").setFontColor("#FAF9F7");
  // Эски колонкалар (Код, Тил, Түзмөк) жана эски жыйынтык / старые колонки и старые итоги — очищаем
  sheet.getRange("F1:K" + Math.max(sheet.getLastRow(), 3)).clear();
  sheet.setColumnWidth(1, 150); sheet.setColumnWidth(2, 240); sheet.setColumnWidth(3, 220);
  sheet.setColumnWidth(4, 90); sheet.setColumnWidth(5, 340);
  sheet.setFrozenRows(1);
  // Жыйынтык / Итоги справа (G–H) — считаются скриптом после каждого ответа (формулы не нужны)
  sheet.getRange("G1:G3").setValues([["Келет (жооп)"], ["Келбейт"], ["Адам саны"]]).setFontWeight("bold");
  sheet.setColumnWidth(7, 120);
  updateTotals(sheet);
}

function appendAnswer(data) {
  var name = String(data.name || "").trim();
  var code = String(data.rsvp || "").trim();
  if (!name && !code) return false;               // бош суроо / пустой запрос — не записываем
  var sheet = getOrCreateSheet();
  sheet.appendRow([
    new Date(data.timestamp || Date.now()),
    name,
    data.rsvpLabel || getLabel(code),
    Number(data.guests || 0),
    data.wish || "",
  ]);
  updateTotals(sheet);
  return true;
}

/** Жыйынтыкты эсептөө / Пересчёт итогов: по столбцам «Жооп» и «Адам саны» (без формул — работает в любой локали). */
function updateTotals(sheet) {
  var last = sheet.getLastRow();
  var yes = 0, no = 0, people = 0;
  if (last > 1) {
    var rows = sheet.getRange(2, 3, last - 1, 2).getValues();
    for (var i = 0; i < rows.length; i++) {
      var label = String(rows[i][0] || "");
      if (label.indexOf("Келе албаймын") >= 0) no++;
      else if (label.indexOf("Келемин") >= 0) { yes++; people += Number(rows[i][1]) || 0; }
    }
  }
  sheet.getRange("H1:H3").setValues([[yes], [no], [people]]);
}

function getOrCreateSheet() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    setupSheet();
  }
  return sheet;
}

function getLabel(code) {
  return { yes: "Келемин", both: "Жубайым менен келемин", no: "Келе албаймын" }[code] || code || "";
}
