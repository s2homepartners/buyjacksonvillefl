# Mailer & pop-by landing page

**One permanent link for every QR code:**

- Mailers: `https://buyjacksonvillefl.com/value/?src=mailer`
- Pop-bys: `https://buyjacksonvillefl.com/value/?src=popby`

The page changes its theme on the 1st of each month at midnight Jacksonville
(Eastern) time. Nobody has to do anything. Each month's wording, colors and artwork
live in `months.js`, and the artwork images are in `art/`.

| Month | Theme |
|---|---|
| January 2027 | Monopoly (artwork drawn on the page) |
| February 2027 | Love Story |
| March 2027 | Lucky Penny |
| April 2027 | Plant a Little Magic |
| May 2027 | Lemonade |
| June 2027 | Stay Cool (popsicles) |
| July 2027 | Ice Cream |
| August 2027 | Camp Homeowner |
| September 2027 | Report Card |
| October 2027 | Haunted House |
| November 2027 | Thanksgiving |
| December 2027 | Home for the Holidays |

- **Before January 2027**, the page shows January.
- **After December 2027**, it keeps showing December until 2028 months are added.

## Which mailer a lead came from

Every lead is tagged with the month whose theme was on screen when the person filled
in the form:

- **Subject:** `New Home Value Lead - March 2027 Mailer (Lucky Penny) - S2 Home Partners`
- **MailerMonth** (`March 2027`), **MailerTheme** (`Lucky Penny`), **Campaign** (both)
- **Source:** `mailer`, `popby` or `direct`, from the `?src=` part of the link
- **Name, FirstName, LastName, Address, Phone, Email, Page**
- **Message:** a plain-English summary of all of the above

Because the link never changes, the month is the month the form was filled in. A
February mailer scanned on March 2 is tagged March. Late scans are usually rare, but
keep it in mind for leads in the first few days of a month.

Leads go to the same Google Apps Script backend as every other form on the site
(`LEAD_BACKEND_URL` in `site.js`), which emails the team and passes the lead on. If
that URL ever changes, change it in `landing.js` too.

## Previewing a month

Add `?month=` to the link, e.g. `https://buyjacksonvillefl.com/value/?month=2027-07`.
A lead sent from a preview link is marked **Preview: yes**.

When you're testing on your computer (`localhost`), the form does a **dry run**. It
shows the thank-you message and logs the lead in the browser console, but sends
nothing. Add `&live=1` to send a real test lead.

## Adding or changing a month (e.g. January 2028)

1. Save the mailer front as a JPG about 760px wide in `art/`, named `2028-01.jpg`.
2. In `months.js`, copy one month's block and change the key to `'2028-01'`.
3. Fill in the theme name, title, subtitle, lead line, letter paragraphs, thank-you
   line, colors and font.
4. Preview it with `?month=2028-01`. It goes live by itself on January 1.

The header, team contact block (photos, phones, website) and footer come from
`landing.js`, so contact details only need changing in one place.

The page is set to `noindex` so search engines skip it, and it isn't in
`sitemap.xml`. It's meant for QR code traffic only.
