# Crown Store PK — Hostinger Par Live Karne Ka Guide

Ye guide first-time deployment ke liye hai. Har step follow karo order mein, koi step skip mat karo.

## Kyun VPS behtar hai (shared hosting bhi chal sakti hai, par risk ke saath)

Database engine ab Node.js ka built-in `node:sqlite` use karti hai (native
compile ki zaroorat khatam ho gayi hai), isliye ab shared hosting par bhi
`npm install` fail nahi hoga.

Lekin ek cheez abhi bhi VPS ko behtar banati hai: **product image uploads**
seedha server ki disk par save hoti hain (`public/images/products/`), aur
database file (`data/crown-store.db`) bhi disk par hoti hai. VPS par yeh
hamesha guaranteed persistent hoti hai. Shared/managed hosting (jaise
Hostinger Business plan ke Node.js App feature) par yeh har redeploy ke
baad persist karti hain ya nahi, iski koi official guarantee nahi milti.

Isliye **Hostinger VPS** (KVM 1 ya KVM 2 plan kaafi hai is size ki site ke
liye) zyada reliable choice hai. Agar shared hosting use kar rahe ho, live
jaane se pehle zaroor test karo — test product + image upload karke app
restart/redeploy karo, dekho wo bachi rehti hai ya nahi.

---

## PHASE 0 — Cheezain jo tumhare paas honi chahiye

- [ ] Hostinger VPS plan purchase kiya hua (Ubuntu 22.04 OS select karna)
- [ ] Ek domain (Hostinger se ya kahin bhi se liya hua)
- [ ] Apna VPS ka IP address aur root password (Hostinger hPanel → VPS → Overview mein milega)
- [ ] Ye project (crown-store-pk folder) tumhari apni PC par

---

## PHASE 1 — GitHub par code push karo (recommended)

Isse aage jaake site update karna bohot easy ho jayega — bas `git pull` karna hoga.

Apne project folder mein (jahan ye guide file hai) ye commands chalao:

```bash
git init
git add .
git commit -m "Initial commit before going live"
```

Ab GitHub par jaake ek naya **private** repository banao (github.com/new), naam kuch bhi rakho jaise `crown-store-pk`. Repo banane ke baad GitHub jo commands dikhaega wo copy karke apne terminal mein chalao, kuch is tarah:

```bash
git remote add origin https://github.com/YOUR-USERNAME/crown-store-pk.git
git branch -M main
git push -u origin main
```

> Agar GitHub use nahi karna, to Phase 4 mein direct file-upload wala tareeqa follow kar sakte ho — lekin GitHub wala tareeqa strongly recommended hai.

---

## PHASE 2 — VPS se SSH se connect karo

Windows Terminal ya Git Bash khol kar:

```bash
ssh root@YOUR_VPS_IP
```

Pehli baar connect karte waqt "yes" type karke Enter dabao, phir VPS ka root password enter karo (Hostinger hPanel se mila hoga). Password type karte waqt screen par kuch dikhega nahi — normal hai, bas Enter dabao.

---

## PHASE 3 — VPS par zaroori software install karo

Ab tum VPS ke andar ho. Ye sab commands ek ek karke chalao:

```bash
# System update
apt update && apt upgrade -y

# Node.js 22 install karo (node:sqlite ke liye 22.13.0+ zaroori hai)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Version check karo (v22.13.0 ya usse upar dikhna chahiye)
node -v
npm -v

# Git install karo (code laane ke liye)
apt install -y git

# PM2 install karo (ye app ko hamesha chalta rakhega, crash hone par restart karega)
npm install -g pm2

# Nginx install karo (domain traffic ko app tak pohanchayega)
apt install -y nginx
```

---

## PHASE 4 — Apna code VPS par lao

### Option A: GitHub se (agar Phase 1 kiya hai)

```bash
cd /var/www
git clone https://github.com/YOUR-USERNAME/crown-store-pk.git
cd crown-store-pk
```

### Option B: Direct upload (agar GitHub skip kiya)

Apni Windows PC par, Git Bash mein (VPS par connect kiye bagair, naya terminal khol kar), apne project folder ke andar se:

```bash
scp -r . root@YOUR_VPS_IP:/var/www/crown-store-pk
```

Ye poora folder VPS par copy kar dega (thoda time lagega node_modules ki wajah se — behtar hai node_modules folder pehle delete karke phir ye command chalao, VPS par khud install ho jayega).

---

## PHASE 5 — Apna real database aur images copy karo (optional but recommended)

Agar tumne apni PC wali site par already products/settings customize kiye hain aur wahi data live site par bhi chahiye, to apni local PC se (VPS se disconnect, naya terminal):

```bash
scp "C:\Users\NINJA\Desktop\crown-store-pk\data\crown-store.db" root@YOUR_VPS_IP:/var/www/crown-store-pk/data/
```

Agar ye step skip karte ho, koi baat nahi — server pehli baar chalne par khud hi fresh demo data (4 products, admin account) bana lega, jo tum admin panel se baad mein edit kar sakte ho.

---

## PHASE 6 — Dependencies install karo aur app build karo

VPS wale terminal mein wapas jao:

```bash
cd /var/www/crown-store-pk
npm install
```

Ab production build banao:

```bash
npm run build
```

---

## PHASE 7 — Security: JWT secret set karo

Abhi tak site ek default hardcoded secret use kar rahi hai login tokens ke liye. Live jaane se pehle isko change karna **zaroori** hai:

```bash
nano /var/www/crown-store-pk/.env
```

Is file mein ye line likho (apni khud ki random string banao, 40+ characters, kisi ko mat batana):

```
JWT_SECRET=yaha-ek-lambi-random-secret-string-likho-kabhi-share-mat-karna
```

Save karne ke liye: `Ctrl+X`, phir `Y`, phir `Enter`.

---

## PHASE 8 — App ko PM2 se start karo

```bash
cd /var/www/crown-store-pk
pm2 start npm --name "crown-store" -- start
pm2 save
pm2 startup
```

`pm2 startup` chalane ke baad wo ek command print karega — usko copy karke exactly waise hi chalao (isse app VPS restart hone par bhi khud start ho jayegi).

Check karo app chal rahi hai:

```bash
pm2 status
```

Status "online" dikhna chahiye.

---

## PHASE 9 — Nginx configure karo (domain → app)

```bash
nano /etc/nginx/sites-available/crown-store
```

Is file mein ye poora content paste karo (`yourdomain.com` ko apne asli domain se replace karna):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save: `Ctrl+X`, `Y`, `Enter`. Ab isko activate karo:

```bash
ln -s /etc/nginx/sites-available/crown-store /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

`nginx -t` "syntax is ok" bole to theek hai.

---

## PHASE 10 — Domain ko VPS ki taraf point karo

Hostinger hPanel mein jao → **Domains** → apna domain select karo → **DNS / Name Servers** → **DNS Zone Editor**.

Ye records add/edit karo:

| Type | Name | Points to (Value) | TTL |
|------|------|-------------------|-----|
| A | @ | YOUR_VPS_IP | 14400 |
| A | www | YOUR_VPS_IP | 14400 |

DNS propagate hone mein 15 minutes se 24 hours tak lag sakta hai. Check karne ke liye [dnschecker.org](https://dnschecker.org) use kar sakte ho.

Is waqt tak `http://yourdomain.com` par site khulni chahiye (bina https/lock ke).

---

## PHASE 11 — Free SSL lagao (https:// wala lock)

DNS propagate hone ke baad, VPS terminal mein:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Ye poochega email address (renewal reminders ke liye) aur terms accept karne ko — dono kar do. Certbot khud Nginx config update kar dega aur automatically har 90 din mein renew hota rahega.

Ab `https://yourdomain.com` par site khulni chahiye, lock icon ke saath.

---

## PHASE 12 — Go-live se pehle FINAL checklist

Site live hone ke baad, ye sab **zaroor** karo:

1. **Admin password change karo** — `https://yourdomain.com/login` pe `admin@crownstore.pk` / `admin123` se login karo, phir **Admin → Settings → Change Admin Password** section mein turant apna naya password set kar do. Default password kisi ko mat batana.
2. **Admin → Settings mein real SMTP email daalo** — taake order-notification emails aana shuru ho jayein.
3. **Admin → Settings mein COD charges / announcement bar** apni marzi se set karo.
4. Ek **test order** khud place karke dekho poora flow (product add to cart → checkout → order confirmation) sahi chal raha hai ya nahi.
5. Admin → Orders mein ja kar test order ke row ka **Delete** button dabao taake real orders list saaf rahe.
6. `.env` mein `JWT_SECRET` ko ek lambi random string se replace karna mat bhoolna (Phase 7 dekho) — default fallback secret production mein kabhi mat chorna.

---

## Aage site update kaise karni hai

Jab bhi mujhse koi naya change karwaoge apni local PC par, us change ko live server par lane ke liye:

**Agar GitHub use kiya tha (Phase 1):**

Apni PC par:
```bash
git add .
git commit -m "describe your change"
git push
```

VPS par:
```bash
cd /var/www/crown-store-pk
git pull
npm install
npm run build
pm2 restart crown-store
```

**Agar direct upload kiya tha:** wahi `scp -r` wala command dobara chalao (Phase 4, Option B), phir VPS par `npm install && npm run build && pm2 restart crown-store`.

---

## Backups (bohot zaroori)

Tumhara real data (orders, products, customers) `data/crown-store.db` file mein hai, aur uploaded product images `public/images/products/` mein hain. Ye VPS par hain, GitHub par nahi. Hafte mein ek baar apni PC par copy kar lena:

```bash
scp root@YOUR_VPS_IP:/var/www/crown-store-pk/data/crown-store.db ./backup-crown-store-$(date +%Y%m%d).db
```

---

## Kuch masla aaye to

- `pm2 logs crown-store` — app ke errors dekhne ke liye
- `pm2 restart crown-store` — app restart karne ke liye
- `systemctl status nginx` — Nginx theek chal raha hai ya nahi check karne ke liye
- Agar kahin bhi phas jao, jo error message aaye wo mujhe copy-paste kar dena, main fix kar dunga.
