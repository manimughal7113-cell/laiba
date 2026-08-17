# License Server — Deploy Karne Ka Tareeqa

Ye server extension ke license keys manage karta hai. Ise kahin bhi host karna hoga
jahan ek public URL mile (extension wahi URL use karega).

## Sabse Aasan Tareeqa: Render.com (Free)

1. https://render.com pe account banayein
2. Ye `server` folder ko GitHub pe ek naye repo mein push kar dein
3. Render pe "New +" > "Web Service" > apna GitHub repo select karein
4. Settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. **Ye 3 Environment Variables zaroor add karein** (bohot zaroori):
   - `ADMIN_EMAIL` = jo email aap Admin tab mein login karte waqt daalna chahte hain (jaise `admin@csiestimation.com`)
   - `ADMIN_PASSWORD` = apna khud ka login password (jaise `MyStrong@Pass123`)
   - `ADMIN_SECRET` = koi bhi random secret text (jaise `csi-secret-token-987xyz`) — ye sirf server ke andar use hota hai, aapko kahin type nahi karna, sirf email+password se login karenge
6. Deploy hone ke baad Render aapko ek URL dega, jaisa:
   `https://csi-license-server.onrender.com`
7. Ye URL copy kar ke extension ki `config.js` file mein `LICENSE_SERVER_URL` mein paste kar dein

## Local Test Karna (apne PC pe)

```
cd server
npm install
set ADMIN_EMAIL=admin@csiestimation.com   (Windows)
set ADMIN_PASSWORD=MyStrong@Pass123
set ADMIN_SECRET=csi-secret-token-987xyz
node server.js
```
(Mac/Linux mein `set` ki jagah `export` likhein)

Server `http://localhost:3000` pe chalega. Extension test karne ke liye
`config.js` mein `LICENSE_SERVER_URL = 'http://localhost:3000'` daal dein
(sirf apne PC pe test ke liye; doosre logon ke liye ye kaam nahi karega, kyun
ke unke PC se aapke localhost tak connection nahi ho sakta — is liye final
use ke liye Render jaisi service pe deploy karna zaroori hai).

## Zaroori Baatein
- `ADMIN_SECRET` environment variable set na kiya to default password
  (`change-this-admin-password`) use hoga — **ye zaroor change karein**,
  warna koi aur bhi Admin panel access kar sakta hai.
- Data `data.json` file mein save hota hai. Render ka free tier restart
  hone par file system reset ho sakta hai kabhi kabhi — agar keys baar baar
  gayab hon to Render ka "Persistent Disk" add karein (paid feature) ya
  Railway.app jaisi service try karein jo persistent storage deti hai.
