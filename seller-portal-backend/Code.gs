/**
 * S2 Home Partners — Seller Portal nightly updater (Google Apps Script, bound to the "Seller Portal" Sheet).
 *
 * Every night it:
 *   1. files new ShowingTime feedback emails into the Feedback tab,
 *   2. pulls the latest 30- and 15-year mortgage rates (Freddie Mac, via FRED),
 *   3. reads each listing's newest Flexmls export from the Drive folder (comps + ZIP stats),
 *   4. builds one report per listing and saves it to Firestore, where only that listing's sellers can read it.
 *
 * See SETUP.md for the one-time setup. Run setup() once, then everything runs on its own.
 */

var TABS = {
  Listings: ['Listing ID', 'Show In Portal', 'Address', 'ZIP', 'Status', 'List Price', 'List Date', 'MLS #', 'Beds', 'Baths', 'Sq Ft', 'Seller Emails', 'Photo URL', 'Listing Link', 'Agent Note'],
  Marketing: ['Listing ID', 'Step', 'Status', 'Date', 'Notes'],
  Feedback: ['Listing ID', 'Date', 'Showing Agent', 'Interest', 'Price Opinion', 'Comments', 'Source'],
  'Weekly Stats': ['Listing ID', 'Week Of', 'Showings', 'Zillow Views', 'Zillow Saves', 'Realtor Views', 'Realtor Saves', 'Homes Views', 'Homes Saves'],
  Settings: ['Setting', 'Value']
};

var DEFAULT_MARKETING = [
  'Pricing strategy & market analysis',
  'Pre-listing prep & staging advice',
  'Professional photography',
  'Video & drone tour',
  'Live on MLS (sent to Zillow, Realtor.com, Homes.com)',
  'Social media launch (Facebook, Instagram, TikTok, YouTube)',
  'Email to local agent network',
  'Just Listed mailers to the neighborhood',
  'Open house',
  'Two-week price & feedback review'
];

var FEEDBACK_QUERY = 'from:showingtime newer_than:7d -label:portal-imported -label:portal-unmatched';

/* ------------------------------------------------------------------ menu & setup */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Seller Portal')
    .addItem('Update portal now', 'nightlyUpdate')
    .addItem('Add marketing plan for selected listing', 'addMarketingPlanForSelection')
    .addSeparator()
    .addItem('Run setup (first time only)', 'setup')
    .addToUi();
}

/** Creates the tabs, the Drive folder for Flexmls exports, and the nightly trigger. Safe to run again. */
function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(TABS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, TABS[name].length).setValues([TABS[name]]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
  });
  var first = ss.getSheetByName('Sheet1');
  if (first && first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);

  var settings = ss.getSheetByName('Settings');
  if (settings.getLastRow() < 2) settings.getRange(2, 1, 1, 2).setValues([['Market Note', 'Write a short note about the market here. It shows on every seller\'s page.']]);

  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('EXPORTS_FOLDER_ID')) {
    var folder = DriveApp.createFolder('Seller Portal - Flexmls Exports');
    props.setProperty('EXPORTS_FOLDER_ID', folder.getId());
  }

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'nightlyUpdate') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('nightlyUpdate').timeBased().everyDays(1).atHour(5).create();

  var folderUrl = DriveApp.getFolderById(props.getProperty('EXPORTS_FOLDER_ID')).getUrl();
  var ready = props.getProperty('SERVICE_ACCOUNT_JSON') ? 'The Firebase key is saved.' : 'Next: add the Firebase key (see SETUP.md, step 4).';
  // A toast and the execution log, not a pop-up: a pop-up would leave the run waiting when started from the editor.
  Logger.log('Seller Portal is set up. Flexmls exports folder: ' + folderUrl + ' . Updates every morning around 5 AM. ' + ready);
  ss.toast('Updates every morning around 5 AM. ' + ready, 'Seller Portal is set up', 15);
}

/** Adds the standard marketing checklist for the listing in the selected row of the Listings tab. */
function addMarketingPlanForSelection() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getActiveSheet();
  var ui = SpreadsheetApp.getUi();
  if (sh.getName() !== 'Listings' || sh.getActiveRange().getRow() < 2) return ui.alert('Click a listing row on the Listings tab first.');
  var id = String(sh.getRange(sh.getActiveRange().getRow(), 1).getValue()).trim();
  if (!id) return ui.alert('That row has no Listing ID.');
  var m = ss.getSheetByName('Marketing');
  m.getRange(m.getLastRow() + 1, 1, DEFAULT_MARKETING.length, 5)
    .setValues(DEFAULT_MARKETING.map(function (step) { return [id, step, 'Planned', '', '']; }));
  ui.alert('Added ' + DEFAULT_MARKETING.length + ' marketing steps for ' + id + ' on the Marketing tab. Change each Status to "In Progress" or "Done" as you go.');
}

/* ------------------------------------------------------------------ nightly update */

function nightlyUpdate() {
  var ss = SpreadsheetApp.getActive();
  var listings = readTable_(ss, 'Listings').filter(function (l) { return l['Listing ID']; });

  importShowingTimeFeedback_(ss, listings);

  var marketing = readTable_(ss, 'Marketing');
  var feedback = readTable_(ss, 'Feedback');
  var stats = readTable_(ss, 'Weekly Stats');
  var settings = {};
  readTable_(ss, 'Settings').forEach(function (r) { settings[r.Setting] = r.Value; });

  var market = fetchRates_();
  market.note = settings['Market Note'] && !/^Write a short note/.test(settings['Market Note']) ? String(settings['Market Note']) : '';

  var zipTrends = fetchZipTrends_(listings.map(function (l) { return String(l.ZIP || '').trim(); }));
  var photosFolder = ensureFolder_('PHOTOS_FOLDER_ID', 'Seller Portal - Photos');
  recordFolderLinks_(ss, photosFolder);

  var sellers = {};
  var log = [];
  listings.forEach(function (l) {
    var id = cleanId_(l['Listing ID']);
    var emails = String(l['Seller Emails'] || '').split(/[,;\s]+/).map(function (e) { return e.trim().toLowerCase(); }).filter(function (e) { return /@/.test(e); });
    if (/^n/i.test(String(l['Show In Portal'])) || !emails.length) {
      firestore_('delete', 'listings/' + id);
      log.push(id + ': hidden');
      return;
    }
    var report = buildReport_(id, l, marketing, feedback, stats, market, zipTrends, photosFolder);
    firestore_('patch', 'listings/' + id, {
      sellerEmails: { arrayValue: { values: emails.map(function (e) { return { stringValue: e }; }) } },
      report: { stringValue: JSON.stringify(report) },
      updatedAt: { timestampValue: new Date().toISOString() }
    });
    emails.forEach(function (e) { (sellers[e] = sellers[e] || []).push(id); });
    log.push(id + ': updated (' + emails.length + ' seller' + (emails.length > 1 ? 's' : '') + ', ' + report.comps.active.length + ' active comps)');
  });

  Object.keys(sellers).forEach(function (email) {
    firestore_('patch', 'sellers/' + email, {
      listingIds: { arrayValue: { values: sellers[email].map(function (id) { return { stringValue: id }; }) } }
    });
  });
  Logger.log(log.join('\n'));
}

function buildReport_(id, l, marketing, feedback, stats, market, zipTrends, photosFolder) {
  var zip = String(l.ZIP || '').trim();
  var address = String(l.Address || '');
  var mls = String(l['MLS #'] || '').trim();

  // The newest Flexmls export: comps + ZIP stats, and the seller's own row (status, price, list date, DOM...).
  var exp = loadExport_(id, zip);
  var comps = analyzeComps_(exp.rows, { address: address, mls: mls, sqft: toNum_(l['Sq Ft']) });
  var own = comps.own || {};

  // Sheet values win when filled in; otherwise the export fills them, so nothing has to be typed.
  var pickVal = function (sheetVal, exportVal) { return sheetVal !== '' && sheetVal !== null && sheetVal !== undefined ? sheetVal : exportVal; };
  var price = toNum_(pickVal(l['List Price'], own.price));
  var sqft = toNum_(pickVal(l['Sq Ft'], own.sqft));
  var listDate = toDate_(pickVal(l['List Date'], own.listDate));
  var status = String(pickVal(l.Status, own.status) || 'Active');

  // Days on market: the MLS figure from the export plus days since the export, else counted from the list date.
  var dom = null;
  if (own.dom !== null && own.dom !== undefined && exp.asOfMs) {
    dom = own.dom + (/active|coming/i.test(status) ? Math.max(0, Math.floor((Date.now() - exp.asOfMs) / 864e5)) : 0);
  } else if (listDate) {
    dom = Math.max(0, Math.floor((Date.now() - listDate.getTime()) / 864e5));
  }

  var photos = listingPhotos_(photosFolder, id);
  var sheetPhoto = String(l['Photo URL'] || '').trim();
  if (sheetPhoto) photos.unshift(sheetPhoto);
  else if (!photos.length && own.photo) photos.push(String(own.photo));

  var listing = {
    id: id,
    address: address,
    zip: zip,
    status: status,
    price: price,
    listDate: listDate ? isoDate_(listDate) : '',
    daysOnMarket: dom,
    mls: mls || String(own.mls || ''),
    beds: toNum_(pickVal(l.Beds, own.beds)),
    baths: toNum_(pickVal(l.Baths, own.baths)),
    sqft: sqft,
    pricePerSqft: price && sqft ? price / sqft : null,
    photo: photos[0] || '',
    photos: photos.slice(0, 40),
    link: String(l['Listing Link'] || ''),
    agentNote: String(l['Agent Note'] || '')
  };
  comps.compare.yourPricePerSqft = listing.pricePerSqft;

  var mine = function (rows) { return rows.filter(function (r) { return cleanId_(r['Listing ID']) === id; }); };

  var plan = mine(marketing).filter(function (r) { return r.Step; }).map(function (r) {
    return { step: String(r.Step), status: String(r.Status || 'Planned'), date: r.Date ? isoDate_(toDate_(r.Date)) : '', notes: String(r.Notes || '') };
  });

  var fb = mine(feedback).map(function (r) {
    return { date: r.Date ? isoDate_(toDate_(r.Date)) : '', agent: String(r['Showing Agent'] || ''), interest: String(r.Interest || ''), price: String(r['Price Opinion'] || ''), comments: String(r.Comments || '') };
  }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });

  var keys = ['showings', 'zillowViews', 'zillowSaves', 'realtorViews', 'realtorSaves', 'homesViews', 'homesSaves'];
  var cols = ['Showings', 'Zillow Views', 'Zillow Saves', 'Realtor Views', 'Realtor Saves', 'Homes Views', 'Homes Saves'];
  var totals = {};
  keys.forEach(function (k) { totals[k] = 0; });
  var weeks = mine(stats).map(function (r) {
    var w = { week: r['Week Of'] ? isoDate_(toDate_(r['Week Of'])) : '' };
    keys.forEach(function (k, i) { w[k] = toNum_(r[cols[i]]); totals[k] += w[k] || 0; });
    return w;
  }).sort(function (a, b) { return a.week < b.week ? -1 : 1; });

  return {
    updatedAt: new Date().toISOString(),
    listing: listing,
    marketing: plan,
    feedback: fb,
    exposure: { weeks: weeks, totals: totals },
    comps: { asOf: exp.asOf, active: comps.active, pending: comps.pending, sold: comps.sold },
    compare: comps.compare,
    zip: comps.zip,
    zipTrends: zipTrends[zip] || null,
    market: market
  };
}

/* ------------------------------------------------------------------ Flexmls exports */

/** Newest CSV (or Google Sheet) in the exports folder named after the Listing ID, else after the ZIP. */
function loadExport_(id, zip) {
  var folderId = PropertiesService.getScriptProperties().getProperty('EXPORTS_FOLDER_ID');
  if (!folderId) return { rows: [], asOf: '' };
  var best = { id: null, zip: null };
  var files = DriveApp.getFolderById(folderId).getFiles();
  while (files.hasNext()) {
    var f = files.next();
    var name = f.getName().toLowerCase();
    var slot = name.indexOf(id.toLowerCase()) === 0 ? 'id' : (zip && name.indexOf(zip) === 0 ? 'zip' : null);
    if (slot && (!best[slot] || f.getLastUpdated() > best[slot].getLastUpdated())) best[slot] = f;
  }
  var file = best.id || best.zip;
  if (!file) return { rows: [], asOf: '' };

  var grid;
  if (file.getMimeType() === MimeType.GOOGLE_SHEETS) grid = SpreadsheetApp.openById(file.getId()).getSheets()[0].getDataRange().getValues();
  else grid = Utilities.parseCsv(file.getBlob().getDataAsString());
  if (!grid.length) return { rows: [], asOf: '' };

  var head = grid[0].map(normalize_);
  var rows = grid.slice(1).filter(function (r) { return r.join('').trim(); }).map(function (r) {
    var o = {};
    head.forEach(function (h, i) { o[h] = r[i]; });
    return o;
  });
  return { rows: rows, asOf: isoDate_(file.getLastUpdated()), asOfMs: file.getLastUpdated().getTime() };
}

// Flexmls column names vary by export view; each field accepts any of these (lowercase, letters/digits only).
var FIELDS = {
  address: ['address', 'fulladdress', 'streetaddress', 'addressfull', 'addr', 'propertyaddress'],
  streetNumber: ['streetnumber', 'streetno', 'stnumber'],
  streetName: ['streetname', 'stname'],
  status: ['status', 'listingstatus', 'standardstatus', 'mlsstatus'],
  price: ['listprice', 'currentprice', 'currentlistprice', 'price', 'askingprice'],
  soldPrice: ['soldprice', 'closeprice', 'closedprice', 'saleprice', 'sellingprice'],
  beds: ['beds', 'bedrooms', 'bedstotal', 'totalbedrooms', 'br', 'bdrms'],
  baths: ['baths', 'bathrooms', 'bathstotal', 'totalbaths', 'bathroomstotal', 'ba'],
  sqft: ['sqft', 'livingarea', 'heatedsqft', 'sqftheated', 'heatedarea', 'sqftliving', 'livingsqft', 'approxsqft', 'squarefeet', 'totalsqft', 'buildingareatotal'],
  dom: ['dom', 'daysonmarket', 'cdom', 'cumulativedaysonmarket', 'adom'],
  closeDate: ['closedate', 'solddate', 'closingdate', 'closeddate', 'saledate'],
  newConstruction: ['newconstruction', 'newconstructionyn', 'propertycondition', 'constructionstatus', 'newconstructionyesno'],
  mls: ['mls', 'mlsnumber', 'mlsno', 'mlsid', 'listingid', 'listnumber', 'listingnumber', 'mlslistingnumber'],
  listDate: ['listdate', 'listingdate', 'listingcontractdate', 'onmarketdate', 'datelisted', 'originallistdate'],
  photo: ['photourl', 'primaryphoto', 'primaryphotourl', 'mainphoto', 'photo', 'imageurl', 'picture', 'photo1']
};

function pick_(row, field) {
  var names = FIELDS[field];
  for (var i = 0; i < names.length; i++) if (row[names[i]] !== undefined && row[names[i]] !== '') return row[names[i]];
  return '';
}

/**
 * listing = { address, mls, sqft } for the seller's home. Returns comps (excluding the seller's home), ZIP stats,
 * a $/sq ft comparison, and `own`: the seller's own row from the export (status, price, list date, DOM, photo...).
 */
function analyzeComps_(rows, listing) {
  var now = Date.now();
  var ownMls = normalize_(listing.mls);
  var ownStreet = normalize_(String(listing.address || '').split(',')[0]);
  var ownRow = null;
  var all = rows.map(function (r) {
    var sqft = toNum_(pick_(r, 'sqft'));
    var price = toNum_(pick_(r, 'price'));
    var sold = toNum_(pick_(r, 'soldPrice'));
    var address = String(pick_(r, 'address') || (pick_(r, 'streetNumber') + ' ' + pick_(r, 'streetName'))).trim();
    var status = String(pick_(r, 'status'));
    var close = toDate_(pick_(r, 'closeDate'));
    var mls = String(pick_(r, 'mls')).trim();
    // The seller's own home (matched by MLS # or street address): counted in ZIP totals, never shown as its own competition.
    var isOwn = (ownMls && normalize_(mls) === ownMls) || (ownStreet && normalize_(address.split(',')[0]) === ownStreet);
    if (isOwn && !ownRow) {
      var listed = toDate_(pick_(r, 'listDate'));
      ownRow = {
        status: status, price: price, sqft: sqft, mls: mls,
        beds: toNum_(pick_(r, 'beds')), baths: toNum_(pick_(r, 'baths')),
        dom: toNum_(pick_(r, 'dom')), listDate: listed || '', photo: String(pick_(r, 'photo') || '')
      };
    }
    return {
      address: address,
      group: /sold|closed/i.test(status) ? 'sold' : /pend|contract|contingent|under/i.test(status) ? 'pending' : /active|coming|new/i.test(status) ? 'active' : '',
      price: price,
      soldPrice: sold,
      beds: toNum_(pick_(r, 'beds')),
      baths: toNum_(pick_(r, 'baths')),
      sqft: sqft,
      pricePerSqft: sqft ? ((sold || price) / sqft) : null,
      dom: toNum_(pick_(r, 'dom')),
      closeDate: close ? isoDate_(close) : '',
      closeMs: close ? close.getTime() : null,
      newConstruction: /^(y|yes|true|new)/i.test(String(pick_(r, 'newConstruction')).trim()),
      own: isOwn
    };
  }).filter(function (c) { return c.address && c.group; });

  var group = function (g) { return all.filter(function (c) { return c.group === g; }); };
  var active = group('active'), pending = group('pending'), sold = group('sold');
  var others = function (list) { return list.filter(function (c) { return !c.own; }); };
  var recentSold = sold.filter(function (c) { return !c.closeMs || now - c.closeMs <= 90 * 864e5; });

  var bySimilarity = function (a, b) {
    if (!listing.sqft) return 0;
    return Math.abs((a.sqft || 0) - listing.sqft) - Math.abs((b.sqft || 0) - listing.sqft);
  };
  var top = function (list, n) {
    return others(list).sort(bySimilarity).slice(0, n).map(function (c) { delete c.group; delete c.closeMs; delete c.own; return c; });
  };

  var withRatio = recentSold.filter(function (c) { return c.soldPrice && c.price; });
  var zip = {
    active: rows.length ? active.length : null,
    newConstructionActive: rows.length ? active.filter(function (c) { return c.newConstruction; }).length : null,
    pending: rows.length ? pending.length : null,
    soldLast90: rows.length ? recentSold.length : null,
    monthsOfSupply: recentSold.length ? active.length / (recentSold.length / 3) : null,
    medianSoldPrice: median_(recentSold.map(function (c) { return c.soldPrice; })),
    medianSoldPricePerSqft: median_(recentSold.map(function (c) { return c.pricePerSqft; })),
    medianDom: median_(recentSold.map(function (c) { return c.dom; })),
    saleToList: withRatio.length ? median_(withRatio.map(function (c) { return (c.soldPrice / c.price) * 100; })) : null
  };
  var compare = {
    yourPricePerSqft: null, // filled in by buildReport_ once the listing's price and size are known
    activeMedianPricePerSqft: median_(others(active).map(function (c) { return c.pricePerSqft; })),
    soldMedianPricePerSqft: zip.medianSoldPricePerSqft
  };
  return { active: top(active, 6), pending: top(pending, 6), sold: top(recentSold.sort(function (a, b) { return (b.closeMs || 0) - (a.closeMs || 0); }).slice(0, 12), 6), zip: zip, compare: compare, own: ownRow };
}

/* ------------------------------------------------------------------ Realtor.com ZIP trends */

var RDC_ZIP_URL = 'https://econdata.s3-us-west-2.amazonaws.com/Reports/Core/RDC_Inventory_Core_Metrics_Zip.csv';

/**
 * Realtor.com's free monthly ZIP-level market data (listing side: inventory, list prices, days on market,
 * price cuts, pendings, with month-over-month and year-over-year change). Returns { '32097': {...}, ... }.
 */
function fetchZipTrends_(zips) {
  var wanted = {};
  zips.forEach(function (z) { if (/^\d{5}$/.test(z)) wanted[z] = true; });
  if (!Object.keys(wanted).length) return {};
  try {
    var res = UrlFetchApp.fetch(RDC_ZIP_URL, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) { Logger.log('Realtor.com ZIP data unavailable: HTTP ' + res.getResponseCode()); return {}; }
    return parseZipTrends_(res.getContentText(), wanted);
  } catch (e) {
    Logger.log('Realtor.com ZIP data unavailable: ' + e);
    return {};
  }
}

/** Pulls only the wanted ZIPs out of the (large) CSV without parsing every row. */
function parseZipTrends_(text, wanted) {
  var lines = text.split('\n');
  var head = Utilities.parseCsv(lines[0])[0];
  var out = {};
  for (var i = 1; i < lines.length; i++) {
    var m = lines[i].match(/^\d{6},(\d{5}),/);
    if (!m || !wanted[m[1]]) continue;
    var cells = Utilities.parseCsv(lines[i])[0];
    var r = {};
    head.forEach(function (h, j) { r[h] = cells[j]; });
    var n = function (k) { var v = parseFloat(r[k]); return isNaN(v) ? null : v; };
    var ym = String(r.month_date_yyyymm);
    out[m[1]] = {
      month: ym.slice(0, 4) + '-' + ym.slice(4, 6) + '-01',
      area: String(r.zip_name || ''),
      medianListPrice: n('median_listing_price'), medianListPriceYoY: n('median_listing_price_yy'),
      pricePerSqft: n('median_listing_price_per_square_foot'), pricePerSqftYoY: n('median_listing_price_per_square_foot_yy'),
      activeListings: n('active_listing_count'), activeListingsYoY: n('active_listing_count_yy'), activeListingsMoM: n('active_listing_count_mm'),
      medianDom: n('median_days_on_market'), medianDomYoY: n('median_days_on_market_yy'),
      newListings: n('new_listing_count'), newListingsYoY: n('new_listing_count_yy'),
      pendingListings: n('pending_listing_count'), pendingRatio: n('pending_ratio'),
      priceReducedShare: n('price_reduced_share'), priceReducedShareYoY: n('price_reduced_share_yy')
    };
  }
  return out;
}

/* ------------------------------------------------------------------ listing photos (Drive) */

/** Returns the saved folder, creating it (and remembering its ID) the first time. */
function ensureFolder_(propKey, name) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(propKey);
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { /* deleted: make a new one */ } }
  var folder = DriveApp.createFolder(name);
  props.setProperty(propKey, folder.getId());
  return folder;
}

/** Photos in the Photos folder whose names start with the Listing ID (e.g. "TEST1 01 front.jpg"), in name order. */
function listingPhotos_(folder, id) {
  var found = [];
  var files = folder.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    if (!/^image\//.test(f.getMimeType()) || f.getName().toLowerCase().indexOf(id.toLowerCase()) !== 0) continue;
    // Sellers need to see the photo without a Google login.
    if (f.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK) f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    found.push({ name: f.getName(), url: 'https://drive.google.com/thumbnail?id=' + f.getId() + '&sz=w1600' });
  }
  return found.sort(function (a, b) { return a.name < b.name ? -1 : 1; }).map(function (p) { return p.url; });
}

/** Keeps links to the Drive folders on the Settings tab so they're easy to find. */
function recordFolderLinks_(ss, photosFolder) {
  var sh = ss.getSheetByName('Settings');
  if (!sh) return;
  var props = PropertiesService.getScriptProperties();
  var links = { 'Photos Folder': photosFolder.getUrl() };
  var exportsId = props.getProperty('EXPORTS_FOLDER_ID');
  if (exportsId) { try { links['Flexmls Exports Folder'] = DriveApp.getFolderById(exportsId).getUrl(); } catch (e) {} }
  var rows = sh.getDataRange().getValues();
  Object.keys(links).forEach(function (key) {
    for (var i = 1; i < rows.length; i++) if (rows[i][0] === key) { sh.getRange(i + 1, 2).setValue(links[key]); return; }
    sh.appendRow([key, links[key]]);
  });
}

/* ------------------------------------------------------------------ ShowingTime feedback */

/** Files new ShowingTime emails into the Feedback tab, matched to a listing by street number + street name. */
function importShowingTimeFeedback_(ss, listings) {
  var sheet = ss.getSheetByName('Feedback');
  var done = labelFor_('portal-imported'), unmatched = labelFor_('portal-unmatched');
  var keys = listings.map(function (l) {
    var m = String(l.Address || '').match(/^\s*(\d+)\s+([A-Za-z0-9]+)/);
    return m ? { id: cleanId_(l['Listing ID']), number: m[1], word: m[2].toLowerCase() } : null;
  }).filter(Boolean);

  GmailApp.search(FEEDBACK_QUERY, 0, 50).forEach(function (thread) {
    var matchedAny = false;
    thread.getMessages().forEach(function (msg) {
      var subject = msg.getSubject();
      if (!/feedback/i.test(subject + ' ' + msg.getPlainBody().slice(0, 500))) return;
      var text = (subject + '\n' + msg.getPlainBody());
      var lower = text.toLowerCase();
      var hit = keys.filter(function (k) { return lower.indexOf(k.number + ' ' + k.word) !== -1; })[0];
      if (!hit) return;
      matchedAny = true;
      var grab = function (re) { var m = text.match(re); return m ? m[1].trim().slice(0, 200) : ''; };
      var comments = msg.getPlainBody()
        .split(/\n\s*(unsubscribe|this email was sent|you are receiving|copyright|©)/i)[0]
        .replace(/\n{3,}/g, '\n\n').trim().slice(0, 1500);
      sheet.appendRow([
        hit.id, msg.getDate(),
        grab(/(?:showing agent|agent name|agent)\s*:\s*([^\n]+)/i),
        grab(/(?:interest level|level of interest|interest)[^:\n]*:\s*([^\n]+)/i),
        grab(/(?:price|pricing)[^:\n]*:\s*([^\n]+)/i),
        comments, 'ShowingTime email'
      ]);
    });
    thread.addLabel(matchedAny ? done : unmatched);
  });
}

function labelFor_(name) { return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name); }

/* ------------------------------------------------------------------ mortgage rates */

/** Freddie Mac weekly averages from FRED (free, no key): MORTGAGE30US and MORTGAGE15US. */
function fetchRates_() {
  var out = {};
  try {
    var s30 = fredSeries_('MORTGAGE30US'), s15 = fredSeries_('MORTGAGE15US');
    var last = function (s, n) { return s.length > n ? s[s.length - 1 - n].value : null; };
    out.rate30 = last(s30, 0); out.rate30WeekAgo = last(s30, 1); out.rate30YearAgo = last(s30, 52);
    out.rate15 = last(s15, 0); out.rate15WeekAgo = last(s15, 1); out.rate15YearAgo = last(s15, 52);
    out.rateDate = s30.length ? s30[s30.length - 1].date : '';
    out.rate30Series = s30.slice(-26);
  } catch (e) {
    Logger.log('Rates unavailable: ' + e);
  }
  return out;
}

function fredSeries_(id) {
  var start = new Date(Date.now() - 400 * 864e5);
  var url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=' + id + '&cosd=' + isoDate_(start);
  var rows = Utilities.parseCsv(UrlFetchApp.fetch(url).getContentText()).slice(1);
  return rows.map(function (r) { return { date: r[0], value: parseFloat(r[1]) }; }).filter(function (p) { return !isNaN(p.value); });
}

/* ------------------------------------------------------------------ Firestore */

/** Writes (patch) or deletes a Firestore document using the service account saved in Script Properties. */
function firestore_(method, path, fields) {
  var sa = serviceAccount_();
  var url = 'https://firestore.googleapis.com/v1/projects/' + sa.project_id + '/databases/(default)/documents/' + path.split('/').map(encodeURIComponent).join('/');
  var opts = { method: method, muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + firestoreToken_(sa) } };
  if (fields) { opts.contentType = 'application/json'; opts.payload = JSON.stringify({ fields: fields }); }
  var res = UrlFetchApp.fetch(url, opts);
  if (res.getResponseCode() >= 300 && !(method === 'delete' && res.getResponseCode() === 404)) {
    throw new Error('Firestore ' + method + ' ' + path + ' failed: ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 300));
  }
}

function serviceAccount_() {
  var raw = PropertiesService.getScriptProperties().getProperty('SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('Add the Firebase service account key first (SETUP.md, step 4).');
  return JSON.parse(raw);
}

function firestoreToken_(sa) {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('firestore_token');
  if (cached) return cached;
  var now = Math.floor(Date.now() / 1000);
  var b64 = function (s) { return Utilities.base64EncodeWebSafe(s).replace(/=+$/, ''); };
  var unsigned = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) + '.' + b64(JSON.stringify({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600
  }));
  var jwt = unsigned + '.' + Utilities.base64EncodeWebSafe(Utilities.computeRsaSha256Signature(unsigned, sa.private_key)).replace(/=+$/, '');
  var res = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post', payload: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }
  });
  var token = JSON.parse(res.getContentText()).access_token;
  cache.put('firestore_token', token, 3300);
  return token;
}

/* ------------------------------------------------------------------ helpers */

function readTable_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  var values = sh.getDataRange().getValues();
  var head = values[0].map(function (h) { return String(h).trim(); });
  return values.slice(1).map(function (r) {
    var o = {};
    head.forEach(function (h, i) { o[h] = r[i]; });
    return o;
  });
}

function cleanId_(v) { return String(v || '').trim().replace(/[\/\s]+/g, '-'); }
function normalize_(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function toNum_(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return v;
  var n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? null : n;
}
function toDate_(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  var d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function isoDate_(d) { return d ? Utilities.formatDate(d, 'America/New_York', 'yyyy-MM-dd') : ''; }
function median_(list) {
  var v = list.filter(function (x) { return typeof x === 'number' && !isNaN(x) && x > 0; }).sort(function (a, b) { return a - b; });
  if (!v.length) return null;
  var mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}
