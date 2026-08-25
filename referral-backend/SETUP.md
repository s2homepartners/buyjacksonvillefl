# Referral Program backend setup

This is a one-time, ~10 minute setup. It turns a free Google Sheet into the
"database" behind the two forms on referral.html — new submissions land as
rows in the sheet, you get an email the moment someone submits, and the
sheet also feeds the live partner map.

## 1. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new
   blank spreadsheet.
2. Name it something like **S2 Home Partners — Referral Program**.
3. Rename the default tab (bottom-left, right-click "Sheet1") to
   **Buyer-Seller Referrals**.
4. Add a header row (row 1) with these exact columns, in order:
   ```
   Timestamp | Name | Email | Phone | Destination City | Destination State | Buying or Selling | Timeline | Message
   ```
5. Click the **+** at the bottom to add a second tab. Name it
   **Realtor Partners**.
6. Add a header row (row 1) with these exact columns, in order:
   ```
   Timestamp | Name | Brokerage | Email | Phone | City | State | License # | Areas Served | Message | Display on Map
   ```

The exact tab names matter (the script looks them up by name) — the column
order matters too.

**Copy the Sheet's ID before moving on.** Look at the address bar while
the Sheet is open — the URL looks like:
`https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlmNoPQRsTuVwxyz/edit`
The long string between `/d/` and `/edit` is the Sheet ID. Copy it
somewhere handy, you'll need it in the next step.

## 2. Add the script

Two ways to do this — use whichever one actually opens for you:

**Option A — from inside the Sheet:**
1. Go to **Extensions > Apps Script**.
2. Delete anything in the editor and paste in the full contents of
   `Code.gs` (in this same folder).

**Option B — if Option A gives a "can't open this file" error:**
1. Go straight to [script.google.com](https://script.google.com) instead.
2. Click **New Project**.
3. Delete anything in the editor and paste in the full contents of
   `Code.gs` (in this same folder).

Either way, once the code is pasted in:

3. Near the top of the script, find this line:
   ```
   var SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';
   ```
   Replace `PASTE_YOUR_SHEET_ID_HERE` with the Sheet ID you copied in
   step 1 (keep the quote marks around it).
4. Click the disk icon (or Ctrl+S) to save. Name the project anything,
   e.g. "Referral Backend".

## 3. Deploy it as a Web App

1. Click **Deploy > New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - Description: anything, e.g. "Referral forms v1"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**.
5. Google will ask you to authorize the script (it's yours, so this is
   safe) — click through the "Google hasn't verified this app" warning
   (Advanced > Go to [project name] (unsafe) — this warning shows up for
   any script you write yourself, it's expected).
6. Copy the **Web app URL** it gives you. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 4. Send me that URL

Send me the Web app URL from step 3.6, and I'll plug it into
`referral.html` in two places — once for form submissions, once for the
live partner map — and push it live.

## 5. Turn on notifications (optional, extra safety net)

The script already emails you immediately on every submission. As a
backup, you can also turn on Google's own notification in the Sheet:
**Tools > Notification rules > set to notify you immediately.**

## Re-deploying after edits

If you or I ever change `Code.gs` later, you'll need to redeploy:
**Deploy > Manage deployments > pencil icon > New version > Deploy.**
The Web app URL stays the same, so nothing on the website needs to change.

## Viewing / exporting your leads

The Sheet itself *is* your master spreadsheet — open it anytime to see
every submission, sort, filter, or **File > Download > Microsoft Excel**
to export it.

## Hiding a partner from the map

If you ever want a partner's pin removed from the map without deleting
their row, change their **Display on Map** column value to `No`.
