# LAN QUEEN overseas order — GitHub Pages

This folder is the customer form only. It has no server. Drop these files at the root of a GitHub Pages site (`index.html` stays at the root). Relative links, so a project site such as `https://lymanlanqueen.github.io/<repo>/` works as well as a user site.

On this repository you can also turn on Pages → Deploy from branch → `main` → `/docs`.

## What the owner must do once

1. Publish the folder.
2. Open the live page and submit one real order, or use the test order already sent from this build. FormSubmit emails `28318330@qq.com` an activation message the first time. **Click Activate Form in that email.** Until that click, later orders are not delivered.
3. After activation, each submission arrives with:
   - subject `LAN QUEEN Order LQ-... - <customer name>`
   - reply-to set to the customer's email
   - the full text of the order
   - `LQ-....html` (A4 customer copy and factory copy)
   - `LQ-....json` (open `print.html`, paste or upload the JSON, print)

`print.html` is for the studio. Customers do not need it. The confirmation page on the form also has Print / Save PDF.

Prices are CNY finished price × actual fabric metres. USD 6.766 and AUD 4.8592 (2026-06-01) are estimates only. The page states that the final amount uses the Bank of China rate on the day of remittance.

Do not run a build. `js/lq.js` is already the same calculation module as the studio app.
