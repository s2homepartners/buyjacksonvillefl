/**
 * S2 Home Partners — Referral Program backend.
 * Paste this into an Apps Script project (either via script.google.com
 * directly, or Extensions > Apps Script inside the Sheet), then deploy
 * as a Web App. See SETUP.md in this folder for the full step-by-step.
 */

// Paste your Google Sheet's ID here — it's the long string of letters
// and numbers in the Sheet's URL, between /d/ and /edit:
// https://docs.google.com/spreadsheets/d/PASTE_THIS_PART/edit
var SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';

var NOTIFY_EMAIL = 'S2HomePartners@gmail.com';

var REFERRAL_SHEET_NAME = 'Buyer-Seller Referrals';
var PARTNER_SHEET_NAME = 'Realtor Partners';

function getSpreadsheet() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function doPost(e) {
  var params = e.parameter;
  var formType = params.formType;
  var ss = getSpreadsheet();
  var timestamp = new Date();

  if (formType === 'referral-request') {
    var sheet = ss.getSheetByName(REFERRAL_SHEET_NAME);
    sheet.appendRow([
      timestamp,
      params.name || '',
      params.email || '',
      params.phone || '',
      params.destCity || '',
      params.destState || '',
      params.buyingOrSelling || '',
      params.timeline || '',
      params.message || ''
    ]);
    sendNotification('New Referral Request', params.name, [
      ['Name', params.name],
      ['Email', params.email],
      ['Phone', params.phone],
      ['Looking to', params.buyingOrSelling],
      ['Destination', (params.destCity || '') + ', ' + (params.destState || '')],
      ['Timeline', params.timeline],
      ['Message', params.message]
    ]);
  } else if (formType === 'partner-signup') {
    var pSheet = ss.getSheetByName(PARTNER_SHEET_NAME);
    pSheet.appendRow([
      timestamp,
      params.name || '',
      params.brokerage || '',
      params.email || '',
      params.phone || '',
      params.city || '',
      params.state || '',
      params.license || '',
      params.areas || '',
      params.message || '',
      'Yes' // Display on map — change to No on any row to hide it from the map
    ]);
    sendNotification('New Referral Partner Signup', params.name, [
      ['Name', params.name],
      ['Brokerage', params.brokerage],
      ['Email', params.email],
      ['Phone', params.phone],
      ['Location', (params.city || '') + ', ' + (params.state || '')],
      ['License #', params.license],
      ['Areas Served', params.areas],
      ['Message', params.message]
    ]);
  }

  return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e.parameter && e.parameter.action === 'partners') {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(PARTNER_SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    var rows = data.slice(1); // skip header row

    var partners = rows
      .filter(function (r) {
        return r[6] && String(r[10]).toLowerCase() !== 'no';
      })
      .map(function (r) {
        return {
          name: r[1],
          brokerage: r[2],
          city: r[5],
          state: String(r[6]).trim().toUpperCase()
        };
      });

    return ContentService.createTextOutput(JSON.stringify({ partners: partners }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput('S2 Home Partners referral backend is running.');
}

function sendNotification(subject, name, fields) {
  var body = 'New submission from ' + (name || 'Unknown') + '\n\n';
  fields.forEach(function (f) {
    body += f[0] + ': ' + (f[1] || '-') + '\n';
  });
  MailApp.sendEmail(NOTIFY_EMAIL, subject + ' — S2 Home Partners', body);
}
