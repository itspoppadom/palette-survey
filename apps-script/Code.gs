/**
 * Palette survey - Google Apps Script backend.
 *
 * Paste this into Extensions > Apps Script of the Google Sheet that should
 * collect the answers, then Deploy > New deployment > Web app
 * (Execute as: Me, Who has access: Anyone). See README.md.
 *
 * Each submission becomes one row in the "Responses" tab. New questions
 * automatically get a new column, so you can change the survey later
 * without touching this script.
 */

const SHEET_NAME = 'Responses';
const MAX_CELL = 5000; // trim very long answers

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000); // avoid two people writing the header row at once
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Honeypot: a hidden field only bots fill in.
    if (data.website) return json_({ ok: true });
    delete data.website;

    data.received_at = new Date();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    let headers = sh.getLastRow() > 0
      ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].filter(String)
      : [];

    // Add any new keys as new columns (received_at first on a fresh sheet).
    const keys = Object.keys(data);
    if (headers.length === 0) {
      headers = ['received_at'].concat(keys.filter(k => k !== 'received_at'));
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
      sh.setFrozenRows(1);
    } else {
      const extra = keys.filter(k => headers.indexOf(k) === -1);
      if (extra.length) {
        sh.getRange(1, headers.length + 1, 1, extra.length).setValues([extra]).setFontWeight('bold');
        headers = headers.concat(extra);
      }
    }

    const row = headers.map(h => clean_(data[h]));
    sh.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Opening the web-app URL in a browser shows this - a quick "is it live?" check.
function doGet() {
  return json_({ ok: true, message: 'Palette survey endpoint is running.' });
}

function clean_(v) {
  if (v === undefined || v === null) return '';
  if (v instanceof Date) return v;
  if (Array.isArray(v)) v = v.join('; ');
  v = String(v).slice(0, MAX_CELL);
  // Stop answers being treated as spreadsheet formulas (e.g. "=HYPERLINK(...)").
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run this once from the editor to check the sheet is writable. */
function testWrite() {
  const fake = { postData: { contents: JSON.stringify({ respondent: 'TEST - delete me', vision_type: 'Not sure', favourite: 'Palette A = okabe' }) } };
  Logger.log(doPost(fake).getContent());
}
