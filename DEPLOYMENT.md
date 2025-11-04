# Deployment & Säkerhetsguide

## 🔒 Säkerhet

### Firestore Security Rules

**VIKTIGT:** Dina Security Rules måste deployas i Firebase Console för att skydda din databas!

#### Steg för att deploya Security Rules:

1. **Gå till Firebase Console:**
   - https://console.firebase.google.com
   - Välj ditt projekt: `pmalmo-31282`

2. **Navigera till Firestore:**
   - Välj **Firestore Database** i menyn
   - Klicka på fliken **Rules**

3. **Kopiera reglerna:**
   - Öppna filen `firebase.rules` i projektet
   - Kopiera hela innehållet

4. **Klistra in och publicera:**
   - Klistra in reglerna i Firebase Console
   - Klicka på **Publish**

#### Din nuvarande säkerhet:

✅ **Endast inloggade användare** kan:
- Läsa bokningar
- Skapa bokningar (med validering)
- Radera bokningar

✅ **Ingen kan:**
- Uppdatera bokningar (update är blockerad)
- Skapa bokningar utan korrekt struktur
- Skapa bokningar med felaktiga värden

### Firebase API-nycklar

**Normal att vara öppna:** Firebase API-nycklar är menade att vara publika i frontend-kod. De identifierar ditt projekt, inte autentiserar. Säkerheten kommer från Security Rules.

### Lösenord för inloggning

Lösenordet `givemeinternet` ligger i frontend-koden. Detta är okej för en intern app, men om du vill ha extra säkerhet kan du:

1. **Använda Firebase Custom Authentication** (mer komplex)
2. **Flytta lösenordet till miljövariabler** (fortfarande synligt i build)
3. **Använda Firebase App Check** för extra skydd mot bot-attacker

### Ytterligare säkerhetsförbättringar (valfritt):

1. **Firebase App Check:**
   - Skyddar mot bot-attacker och missbruk
   - Aktivera i Firebase Console → App Check

2. **Rate Limiting:**
   - Lägg till begränsningar i Security Rules för att förhindra spam

3. **IP-begränsning:**
   - Använd Firebase Hosting rules eller Cloud Functions för IP-filtrering

## 🚀 Deployment

### Bygga appen:

```bash
npm run build
```

Detta skapar en `dist/` mapp med optimerade statiska filer.

### Deploya till Firebase Hosting:

```bash
# Installera Firebase CLI (en gång)
npm install -g firebase-tools

# Logga in
firebase login

# Initiera hosting (första gången)
firebase init hosting
# Välj: dist som public directory
# Välj: Yes för single-page app

# Deploya
firebase deploy --only hosting
```

### Andra alternativ:

- **Netlify:** Dra och släpp `dist/` mappen
- **Vercel:** `vercel --prod`
- **Egen webbserver:** Ladda upp innehållet i `dist/` till din server

## ✅ Checklista före deployment:

- [ ] Deploya Firestore Security Rules i Firebase Console
- [ ] Verifiera att lösenordet är acceptabelt för din användningssituation
- [ ] Testa att inloggning fungerar efter deployment
- [ ] Testa att bokningar skapas och raderas korrekt
- [ ] Verifiera att Security Rules blockerar otillåtna operationer

