# Monthly mailer & pop-by landing pages

Each month's mailer / pop-by QR code points to its own page in this folder:

| Month | Theme | QR code URL |
|---|---|---|
| January 2027 | Monopoly | `https://buyjacksonvillefl.com/value/2027-01/?src=mailer` (pop-bys: `?src=popby`) |

The `?src=` part is optional. It records where the lead came from (it shows as
**Source** in the lead), so you can use one URL for mailers and another for pop-bys.

## Where the leads go

The form posts to the same Google Apps Script lead backend as every other form on
the site (`LEAD_BACKEND_URL` in `site.js`), which emails the team and sends the lead
on, like the Home Value form on `sell.html`. Each lead arrives with:

- **FormType:** `Mailer Home Value Lead`
- **Subject:** `New Home Value Lead - January 2027 Mailer (Monopoly) - S2 Home Partners`
- **Name, FirstName, LastName, Address, Phone, Email**
- **MailerMonth** (`January 2027`), **MailerTheme** (`Monopoly`), **Campaign** (both together)
- **Source** (`mailer`, `popby` or `direct`), **Page**
- **Message**: a plain-English summary of all of the above, in case a field isn't shown

**How the month is decided:** the mailer month comes from the page's folder name,
not from anything typed in the page. `/value/2027-01/` is always January 2027, so a
lead from a January mailer that someone scans in March is still tagged January.
That's why each month needs its own folder: keep old months live, never reuse or
rename a folder, because mailers with that QR code are still in people's homes.

Nothing new needs to be set up. If the backend URL in `site.js` ever changes,
change it in `landing.js` too.

## Adding a new month (e.g. February 2027)

1. Copy the `_template` folder and name the copy `2027-02` (year-month, always two
   digits for the month). This name is what tags every lead as February 2027.
2. Open `2027-02/index.html` and replace every `[[...]]` placeholder with the
   mailer's headline, letter and P.S.
3. Set `data-theme="<Theme>"` on the form (e.g. `data-theme="Valentine's"`). It's
   added after the month in the lead email subject.
4. Change the colors in the `:root { --lp-... }` block at the top to match the
   mailer. For theme artwork, add inline SVG/CSS or put an image in the folder and
   use `<img src="art.png" alt="">` in the `lp-hero__art` box.
5. Add the month to the table above.
6. Preview it locally (the `site` launch config, then open
   `http://localhost:8765/value/2027-02/`). On localhost the form does a **dry run**:
   it shows the thank-you message and logs the lead to the browser console but
   sends nothing. Add `&live=1` to the URL to send a real test lead.
7. After it's deployed, open the live URL on your phone and send one test lead
   before printing the QR code.

The header, team contact block (photos, phones, website) and footer come from
`landing.js`, so contact details only need changing in one place.

These pages are set to `noindex` so search engines skip them, and they aren't in
`sitemap.xml`. They're meant for QR code traffic only.
