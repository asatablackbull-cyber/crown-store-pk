# Crown Store PK — Hostinger Business (Shared Hosting) Deployment Guide

Ye guide specifically **Hostinger Business plan** (shared hosting) ke liye hai —
VPS wali guide is se different hai, kyunke shared hosting par tumhe root/sudo
access nahi milti, aur app ek "Node.js App Manager" (Passenger) ke zariye chalti
hai, na ke PM2/Nginx se.

## Sabse pehle: 1 real risk jo tumhe pata hona chahiye

**Update:** database engine ab `better-sqlite3` (native/compiled module) nahi
balke Node.js ka apna built-in `node:sqlite` use karti hai — isliye
`npm install` ke waqt koi compile/Python error nahi aayega, chahe kisi bhi
Hostinger plan par ho. (Node.js version **22.13.0 ya us se upar** honi
chahiye — hPanel mein Node.js App banate waqt version dropdown se sabse
naya select karna.)

Ek doosra, alag risk abhi bhi baaqi hai jo is fix se solve nahi hota: **shared
hosting par disk files (database aur uploaded product images) har naye
deploy/restart ke baad persist karti hain ya nahi, iska koi guarantee nahi
hai.** Isliye live jaane se pehle zaroor test karo — ek test product banao,
uski image upload karo, phir app ko restart/redeploy karo, aur dekho wo
product/image bachi hai ya nahi. Agar ghayab ho jaye, to VPS wali guide
(jo pehle bheji thi) par switch karna padega, jahan disk hamesha persistent
hoti hai.

---

## PHASE 1 — Project ko production ke liye taiyaar karo (already ho chuka hai)

Maine tumhare project mein ek `server.js` file add ki hai jo Hostinger ke
Node.js hosting ke liye zaroori hai (Hostinger tumhari app ko `npm start` se
nahi, balke ek specific "startup file" se chalata hai). Ye maine already
test kar li hai, kaam kar rahi hai.

Apne project folder mein `node_modules` aur `.next` folders delete kar do
(agar hain) taake upload halka rahe — ye server par khud generate ho jayenge:

```
node_modules/   <- delete this folder before uploading
.next/          <- delete this folder before uploading
```

---

## PHASE 2 — hPanel mein Node.js App banao

1. Hostinger **hPanel** mein login karo.
2. Apni website select karo (jis par ye app chalani hai).
3. Left sidebar mein **Advanced** section dhoondo, us mein **Node.js**
   option par click karo (kabhi kabhi ye "Setup Node.js App" bhi likha hota
   hai — hPanel version ke hisaab se naam thoda alag ho sakta hai).
4. **Create Application** (ya "+") par click karo.
5. Ye settings fill karo:
   - **Node.js version**: sabse latest available version select karo
     (20.x ya usse upar, jo bhi list mein sabse naya ho)
   - **Application mode**: Production
   - **Application root**: ek folder name do, jaise `crown-store-pk`
     (ye tumhari hosting ke andar ka path hoga)
   - **Application URL**: apna domain ya jis subdomain par ye chalani hai
   - **Application startup file**: `server.js` type karo — **ye sabse
     zaroori field hai, ye zaroor `server.js` hona chahiye**
6. **Create** par click karo.

Hostinger ab application root folder bana dega aur SSH ke liye ek special
command dikhaega jo kuch is tarah dikhta hai:

```
source /home/uXXXXXXXX/nodevenv/crown-store-pk/20/bin/activate && cd /home/uXXXXXXXX/crown-store-pk
```

**Ye exact command copy kar lo — isko baar baar use karna hoga.**

---

## PHASE 3 — Apni files upload karo

hPanel mein **Files → File Manager** kholo, us folder mein jao jo abhi
Application root mein banaya tha (jaise `crown-store-pk`).

Apni PC par project folder ko ZIP kar lo (node_modules aur .next ke bagair,
jo Phase 1 mein delete kiye the), phir File Manager mein **Upload** se wo
ZIP file upload karo, aur upload hone ke baad usi File Manager mein right-click
karke **Extract** kar do.

(Agar SFTP use karna chahte ho instead, wahi FileZilla/WinSCP se bhi kar
sakte ho — login details hPanel → Files → FTP Accounts mein milengi.)

---

## PHASE 4 — SSH se install aur build karo

hPanel mein **Advanced → SSH Access** section se SSH enable karo (agar
already nahi hai), aur connection details copy karo.

Apne PC ke terminal se connect karo:

```bash
ssh uXXXXXXXX@YOUR_HOSTINGER_SSH_HOST -p 65002
```

(Exact username, host aur port hPanel ke SSH Access section mein milega —
Business plan par port aam taur par 65002 hota hai.)

Connect hone ke baad, Phase 2 mein jo command copy ki thi wahi chalao:

```bash
source /home/uXXXXXXXX/nodevenv/crown-store-pk/20/bin/activate && cd /home/uXXXXXXXX/crown-store-pk
```

Ab dependencies install karo:

```bash
npm install
```

Yeh ab `better-sqlite3` compile nahi karega (upar dekho), isliye yeh step
bina kisi error ke complete ho jana chahiye. Agar koi doosra error aaye, wo
error message mujhe bhej dena. Successfully install hone ke baad aage badho:

```bash
npm run build
```

Ye 1-2 minute lega. End mein ek route list dikhni chahiye, koi red error
text nahi.

---

## PHASE 5 — Environment variable set karo (security)

hPanel ke Node.js App page par wapas jao, apni application par click karo,
aur **Environment Variables** section dhoondo. Ye variable add karo:

```
Name:  JWT_SECRET
Value: (apni khud ki ek lambi random string, 40+ characters, kabhi share mat karna)
```

Save karo.

---

## PHASE 6 — App start karo

Wapas hPanel ke Node.js App page par, apni application ke saamne
**Restart** button dabao (ya "Run npm install" ke pass agar "Start"/"Enable"
button ho to wo).

Kuch seconds wait karo, phir status "Running" ya green dikhna chahiye.

---

## PHASE 7 — Domain aur SSL check karo

- Agar ye domain already Hostinger par hosted hai (jaisa lagta hai, "private"
  bola tha), to koi DNS change nahi karni — hPanel ne Application URL step
  mein khud domain ko app se connect kar diya hoga.
- hPanel mein **Security → SSL** section mein jao, confirm karo SSL active
  hai apne domain ke liye, aur **Force HTTPS** on kar do.
- Apna domain browser mein khol kar dekho — site live honi chahiye.

---

## PHASE 8 — Go-live checklist

Same as VPS guide:

- [ ] `/login` par admin@crownstore.pk / admin123 se login test karo
- [ ] Admin → Settings → "Change Admin Password" se default password
      turant badal do — kabhi bhi admin123 live site par mat chorna
- [ ] Admin → Settings mein real SMTP email details daalo
- [ ] Admin → Settings mein COD charges / announcement bar set karo
- [ ] Ek test order khud place karo, phir Admin → Orders mein us order
      ki row par Delete button se hata do
- [ ] Phase 5 mein set kiya `JWT_SECRET` ek real random string hai,
      placeholder nahi — confirm kar lo

---

## Aage update kaise karo

Jab bhi naya change ho apni PC par:

1. Naya ZIP banao (node_modules/.next ke bagair)
2. File Manager se purani files replace karo (ya SFTP se overwrite)
3. SSH se connect karo, virtualenv activate karo (Phase 4 wala command)
4. `npm install && npm run build`
5. hPanel se app **Restart** karo

---

## Agar install/build phir bhi fail ho jaye

Ab yeh `better-sqlite3` compile nahi karta, isliye is wajah se fail nahi
hoga. Agar phir bhi `npm install` ya `npm run build` mein koi error aaye
(kisi aur wajah se), exact error message mujhe copy-paste kar dena, main
fix kar dunga.

Agar Node.js version 22.13.0 se purani hai (dropdown mein select karte waqt
check kar lena), `node:sqlite` load hi nahi hogi — us case mein sabse nayi
available Node version select karke dobara try karo.
