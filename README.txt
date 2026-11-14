TARAZINA SITE v1 (static files, no build step)

FILES
trades.html     list of 13 trade pages (shirini-keyk, cafe-ghahve, nooshidani-abmive, fastfood, pitza, nan-nanvaei,
                bastani-deser, torshi-morabba, ajil-khoshkbar, ghaza-restoran, catering-ghaza-khanegi,
                shokolat-gaz-sohan, labaniyat). Each has its own example, tips and FAQ. Example prices are samples.
index.html      calculator page (Persian, right-to-left, works offline after first load)
privacy.html    privacy page DRAFT (fill in the contact line, check it matches the app)
config.js       the only file you edit: brand name, app link, Supabase settings
calc-core.js    the maths (tested)   app.js  the page logic   style.css  look
vazirmatn.woff2 + FONT-LICENSE.txt   font (same one as the app)

PUBLISH ON GITHUB PAGES
1. New repo (example: tarazina-site). Upload all files in this folder to the repo root.
2. Repo Settings > Pages > Deploy from branch > main > / (root).
3. Test the github.io address on your phone first.
4. Custom domain later: Settings > Pages > Custom domain, but verify the domain in your GitHub
   account settings BEFORE adding DNS records.

LOGIN IS OFF ON PURPOSE (enableLogin:false). The app's current sign-in (v0.8: phone, names,
profile) is not in the files I have, so the site must not guess it.
