# Seller Portal setup

One-time setup, about 30 minutes. Do every step signed in to Google as
**s2homepartners@gmail.com**.

When you're done:

- Sellers sign in at **buyjacksonvillefl.com/seller-portal.html** with a link
  emailed to them (no password) and see only their own listing.
- Every morning around 5 AM the portal refreshes from your Google Sheet, your
  Flexmls exports, ShowingTime feedback emails and the latest mortgage rates.

The pieces:

| Piece | What it does |
|---|---|
| Firebase (Google) | Seller sign-in and the private storage each seller reads from |
| "Seller Portal" Google Sheet | Your back office: listings, marketing plan, feedback, weekly views |
| Apps Script inside the Sheet | The nightly updater (`Code.gs` in this folder) |
| Drive folder "Seller Portal - Flexmls Exports" | Where you drop Flexmls CSV exports for comps and ZIP stats |

---

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and click **Create a project**.
2. Name it **S2 Seller Portal**. Google Analytics is not needed; you can turn it off.
3. On the project home page, click the **Web** icon (`</>`) to add a web app.
   Nickname: **Seller Portal**. Leave "Firebase Hosting" unchecked. Click **Register app**.
4. Firebase shows a block of code with `firebaseConfig`. You only need four values from it:
   `apiKey`, `authDomain`, `projectId`, `appId`. Send them to Claude, or paste them into
   `seller-portal-config.js` in the website folder. These values are not secret.

## 2. Turn on email-link sign-in

1. In the left menu: **Build > Authentication > Get started**.
2. **Sign-in method** tab > **Email/Password** > turn on **Enable** *and*
   **Email link (passwordless sign-in)** > **Save**.
3. **Settings** tab > **Authorized domains** > **Add domain** > `buyjacksonvillefl.com`.

> Firebase's free plan limits how many sign-in emails can go out per day (only a
> handful). Sellers stay signed in on their device, so this is usually enough. If
> sellers report the email never arrives, upgrade the project to the pay-as-you-go
> **Blaze** plan (Settings > Usage and billing). At this size it typically costs $0.

## 3. Create the database and lock it down

1. **Build > Firestore Database > Create database**.
2. Location: **nam5 (United States)**. Choose **Start in production mode**.
3. Open the **Rules** tab, delete what's there, paste everything from
   `firestore.rules` (in this folder) and click **Publish**.

## 4. Create the key for the nightly updater

1. Gear icon (top left) > **Project settings** > **Service accounts** tab.
2. Click **Generate new private key** > **Generate key**. A `.json` file downloads.
3. **Treat this file like a password.** Don't email it or put it in the website folder.
   You'll paste its contents into the Apps Script in step 5, then delete the file.

## 5. Create the Sheet and the nightly updater

1. Go to [sheets.google.com](https://sheets.google.com), create a blank spreadsheet, and name it **Seller Portal**.
2. **Extensions > Apps Script**.
3. Delete the sample code in `Code.gs` and paste in everything from `Code.gs` in this folder.
4. **Project Settings** (gear, left) > check **Show "appsscript.json" manifest file**.
   Go back to the editor, open `appsscript.json`, and replace it with the one in this folder.
5. Still in **Project Settings**, scroll to **Script properties** > **Add script property**:
   - Property: `SERVICE_ACCOUNT_JSON`
   - Value: open the key file from step 4 in Notepad, select all, copy, paste.
   - **Save script properties.** Now delete the downloaded key file.
6. Click **Save** (disk icon). In the function dropdown at the top choose **setup** and click **Run**.
7. Google asks for permission. Click **Review permissions** > choose s2homepartners@gmail.com.
   Because this is your own script, Google shows "Google hasn't verified this app": click
   **Advanced > Go to Seller Portal (unsafe)** > **Allow**. It asks for Sheets, Drive, Gmail
   (to read ShowingTime emails) and outside connections (rates and Firebase).
8. The run finishes in a few seconds. The **Execution log** shows the link to the new Drive folder
   **Seller Portal - Flexmls Exports** (also findable in Google Drive); bookmark it. Back in the
   Sheet, the new tabs appear and a **Seller Portal** menu is at the top (refresh if you don't see it).

## 6. Make sure ShowingTime feedback reaches this inbox

The updater reads ShowingTime emails in **s2homepartners@gmail.com**. If feedback goes to
another address, either add s2homepartners@gmail.com as a notification email in ShowingTime,
or in that other Gmail create a filter (`from:showingtime`) that forwards to
s2homepartners@gmail.com.

Matched emails get the Gmail label **portal-imported**. Emails it couldn't match to a
listing get **portal-unmatched**; add those to the Feedback tab by hand. Once real feedback
emails arrive, send one to Claude so the details (agent, interest level, price opinion)
are picked out more precisely.

---

## Using it

### Add a listing (Listings tab)

| Column | What to enter |
|---|---|
| Listing ID | Any short ID, e.g. the MLS number. Used to link every other tab. |
| Show In Portal | `Yes` (set `No` to take it down, e.g. after closing) |
| Address | Full address, e.g. `75888 Saffron Lane, Yulee, FL 32097` |
| ZIP | `32097` |
| Status, List Price, List Date, MLS #, Beds, Baths, Sq Ft | From the listing |
| Seller Emails | Each seller's email, separated by commas. Only these emails can see this listing. |
| Photo URL | Link to the main photo (e.g. the Flexmls photo link) |
| Listing Link | Your Flexmls share link |
| Agent Note | A short personal update shown at the top of their page |

Then click the listing's row and choose **Seller Portal > Add marketing plan for selected listing**.
On the **Marketing** tab, change each step's Status to `In Progress` or `Done` (and add a
date or note) as you go. Add or delete steps freely.

### Weekly (about 5 minutes per listing)

1. **Weekly Stats tab:** one row per listing per week: Listing ID, Week Of, Showings, and
   views/saves from your Zillow, Realtor.com and Homes.com agent dashboards.
2. **Flexmls export:** run a search for the listing's ZIP code covering Active, Pending and
   Sold in the last 90 days (similar size and price range works best). Export to CSV with
   these columns if available: Address, Status, List Price, Sold/Close Price, Beds, Baths,
   Heated Sq Ft, DOM, Close Date, New Construction. Name the file starting with the
   **Listing ID** (e.g. `0000000 comps.csv`), or with the **ZIP** to share one export across
   listings in the same ZIP, and upload it to the **Seller Portal - Flexmls Exports** folder.
   The newest file wins. Send Claude your first export so the column names can be checked.

### Anytime

- **Feedback tab:** add feedback by hand if it didn't come by email.
- **Settings tab > Market Note:** a short "our take on the market" shown on every seller's page.
- **Seller Portal > Update portal now** refreshes immediately instead of waiting for 5 AM.

### Test it

Add yourself as a test listing with your own email in **Seller Emails**, run
**Update portal now**, then sign in at buyjacksonvillefl.com/seller-portal.html.
To preview the layout with sample data any time: buyjacksonvillefl.com/seller-portal.html?demo
