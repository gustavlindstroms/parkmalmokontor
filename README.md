# Forefront Parkeringsbokning SPA

En mobilanpassad webbapplikation för att koordinera parkeringsbokningar för Forefronts anställda i Malmö.

## Översikt

Denna app hjälper Forefront-anställda att boka parkeringsplatser i förväg för att undvika konflikter. Appen koordinerar bokningar för tre parkeringsplatser som ägs och hanteras av P-Malmö.

### Hur det fungerar

1. **Förbokning (denna app):**
   - Användare loggar in med Google och bokar en ledig plats för ett specifikt datum
   - Alla kan se vem som har bokat vilken plats och när
   - Realtidsuppdateringar så att alla ser samma information

2. **Parkeringsdagen (P-Malmö webbplats):**
   - På dagen måste användaren logga in på P-Malmös kundportal
   - Registrera sitt registreringsnummer i P-Malmös system
   - När man registrerar sitt nummer tas föregående nummer bort från platsen (endast ett nummer per plats kan vara aktivt)

**Varför denna app?** P-Malmös system tillåter endast ett aktivt registreringsnummer per plats. Genom att koordinera i förväg via denna app kan flera personer planera sina bokningar och undvika konflikter.

## Teknisk stack

- **Frontend:** Vue 3 med TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Authentication + Firestore)
- **Build tool:** Vite

## Funktioner

- ✅ Google-inloggning via Firebase Authentication
- ✅ Realtidsöversikt över bokningar för alla tre platser
- ✅ Datumväljare för att se bokningar för specifika datum
- ✅ Bokning med namn och registreringsnummer (6 tecken, A-Z/0-9)
- ✅ Avbokning av bokningar
- ✅ Automatisk sparning av senaste använda registreringsnummer och namn
- ✅ Direktlänk till P-Malmös kundportal
- ✅ Mobilanpassad design

## Krav

- Node.js 18 eller högre

## Installation

```bash
npm install
```

## Utveckling

```bash
npm run dev
```

Startar utvecklingsservern på `http://localhost:5173` (eller nästa tillgängliga port).

Appen ansluter till Firebase-produktionsmiljön och kräver internetanslutning.

## Bygga för produktion

```bash
npm run build
```

Detta skapar optimerade statiska filer i `dist/`-mappen som kan deployas till valfri statisk webbhotell.

## TypeScript-typkontroll

```bash
npm run type-check
```

Kör TypeScript-kompilatorn för att kontrollera typfel utan att generera filer.

## Firebase-konfiguration

Firebase-konfigurationen hanteras via miljövariabler för att separera utveckling och produktion.

### Konfigurationsfiler

Appen använder följande konfigurationsfiler:

- **`.env.example`** - Mallfil med alla nödvändiga miljövariabler (committad till git)
- **`.env`** - Lokal utvecklingskonfiguration (gitignored)
- **`.env.production`** - Produktionskonfiguration (committad till git, eftersom Firebase-nycklar är publika)

### Miljövariabler

Appen kräver följande miljövariabler för Firebase-konfiguration:

```bash
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

### Hur konfigurationen fungerar

1. **Utveckling (`npm run dev`):**
   - Vite läser `.env`-filen
   - `vite.config.ts` använder `loadEnv()` för att ladda variabler
   - Variabler injiceras via `define` i `vite.config.ts`
   - Appen använder `import.meta.env.FIREBASE_*` för att komma åt värdena

2. **Produktion (`npm run build`):**
   - Vite läser `.env.production`-filen (eller systemets miljövariabler)
   - Variabler injiceras vid build-tid och "bakas in" i de statiska filerna
   - De byggda filerna i `dist/` innehåller de faktiska värdena (inte referenser)

### Första gången du sätter upp:

1. Kopiera `.env.example` till `.env` för lokal utveckling:
   ```bash
   cp .env.example .env
   ```

2. Fyll i dina Firebase-värden i `.env`-filen (se "Sätta upp eget Firebase-projekt" nedan för hur du hämtar dessa)

3. **Produktionskonfiguration:** `.env.production` är redan committad i repot med produktionsvärden. Om du behöver ändra den, redigera filen direkt.

### Verifiera konfigurationen

Efter att ha satt upp `.env`-filen, starta utvecklingsservern:

```bash
npm run dev
```

Om konfigurationen är korrekt kommer appen att:
- Ladda utan fel i konsolen
- Kunna logga in med Google
- Kunna läsa och skapa bokningar i Firestore

### Projekt-ID

Projekt-ID:t konfigureras via miljövariabler i `.env` eller `.env.production`.

**Viktigt:** 
- `.env` är gitignored (kommer inte committas)
- `.env.example` och `.env.production` är committade till git
- `.env.production` är committad eftersom Firebase-nycklar är publika (säkerheten kommer från Security Rules)
- Vid build för produktion används `.env.production` automatiskt

### Sätta upp eget Firebase-projekt

Om du vill använda ditt eget Firebase-projekt, följ dessa steg:

#### 1. Skapa Firebase-projekt

1. Gå till [Firebase Console](https://console.firebase.google.com)
2. Logga in med ditt Google-konto
3. Klicka på "Add project" eller "Skapa projekt"
4. Ange ett projektnamn (t.ex. "my-parking-booking")
5. (Valfritt) Aktivera Google Analytics
6. Klicka på "Create project" och vänta tills projektet är skapat

#### 2. Aktivera Firestore Database

1. I Firebase Console, klicka på "Firestore Database" i vänstermenyn
2. Klicka på "Create database"
3. Välj "Start in test mode" (du kommer lägga till säkerhetsregler senare)
4. Välj en plats (välj en nära dina användare)
5. Klicka på "Enable"

#### 3. Aktivera Anonymous Authentication

1. Klicka på "Authentication" i vänstermenyn
2. Klicka på "Get started"
3. Gå till fliken "Sign-in method"
4. Klicka på "Anonymous"
5. Aktivera "Enable"
6. Klicka på "Save"

#### 4. Hämta Firebase-konfiguration

1. Klicka på kugghjulsikonen ⚙️ bredvid "Project Overview"
2. Välj "Project settings"
3. Scrolla ner till "Your apps" och klicka på webbikonen `</>`
4. Registrera din app med ett smeknamn (t.ex. "Parking Booking App")
5. Kopiera `firebaseConfig`-objektet

Det ser ut så här:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

#### 5. Uppdatera app-konfiguration

Ersätt `firebaseConfig` i `src/firebase.ts` med din egen konfiguration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... etc
};
```

#### 6. Deploya Security Rules

1. I Firebase Console, gå till "Firestore Database"
2. Klicka på fliken "Rules"
3. Kopiera innehållet från `firebase.rules` i projektet
4. Klistra in i Firebase Console rules editor
5. Klicka på "Publish"

**Viktigt:** Utan att deploya reglerna kommer din databas antingen vara öppen för alla (om du startade i test mode) eller blockerad (om du startade i production mode).

#### 7. Testa din setup

1. Kör `npm run dev`
2. Försök logga in med Google
3. Skapa en testbokning
4. Kontrollera i Firebase Console → Firestore Database → Data att din bokning syns

### Firestore Security Rules

Security Rules måste deployas i Firebase Console för att skydda databasen. Reglerna finns i `firebase.rules`.

**Viktigt:** Deploya reglerna via Firebase Console → Firestore Database → Rules.

Nuvarande regler:
- Endast inloggade användare kan läsa bokningar
- Endast inloggade användare kan skapa bokningar (med validering)
- Alla inloggade användare kan radera bokningar
- Uppdateringar är blockerade (bokningar är oföränderliga)

### Vad är Firestore?

Firestore är en NoSQL-dokumentdatabas från Firebase. Tänk på det som en JSON-databas i molnet:

- **Collections** = mappar (t.ex. `bookings`)
- **Documents** = filer i dessa mappar (varje bokning är ett dokument)
- **Fields** = data i varje dokument (date, spot, licensePlate, etc.)

I denna app lagras all bokningsdata i Firestore och synkas i realtid till alla anslutna användare.

### Gratis tier

Firebase Spark-plan (gratis) inkluderar:
- 50K läsningar/dag
- 20K skrivningar/dag
- 20K raderingar/dag
- 1 GB lagring

Detta är vanligtvis tillräckligt för små interna appar. Om du behöver mer kan du uppgradera till Blaze-plan (betala per användning över gratisgränsen).

## Användning

1. **Logga in:** Klicka på "Logga in med Google" och välj ditt Google-konto
2. **Välj datum:** Använd datumväljaren för att se bokningar för ett specifikt datum
3. **Boka plats:** Klicka på en ledig plats, ange namn och registreringsnummer (6 tecken)
4. **Avboka:** Klicka på "Avboka" för en bokad plats (alla inloggade användare kan avboka)
5. **Parkeringsdagen:** Logga in på P-Malmös kundportal och registrera ditt registreringsnummer

## Projektstruktur

```
src/
  ├── main.ts              # App entry point
  ├── App.vue              # Root component
  ├── firebase.ts          # Firebase konfiguration och helpers
  ├── styles.css           # Globala stilar + Tailwind
  └── views/
      ├── LoginView.vue    # Inloggningsvy
      └── BookingView.vue  # Huvudvy för bokningar
```

## 🔒 Säkerhet

### Firestore Security Rules

**VIKTIGT:** Dina Security Rules måste deployas i Firebase Console för att skydda din databas!

#### Steg för att deploya Security Rules:

1. **Gå till Firebase Console:**
   - https://console.firebase.google.com
   - Välj ditt projekt

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

### Google-inloggning

Appen använder Google Sign-In via Firebase Authentication. Detta ger:

- ✅ Säker autentisering via Google-konton
- ✅ Ingen lösenordshantering i appen
- ✅ Användare identifieras via sina Google-konton

**För extra säkerhet kan du:**

1. **Begränsa till specifika domäner:** Konfigurera Firebase Authentication att endast tillåta konton från specifika domäner (t.ex. `@forefront.se`)
2. **Använda Firebase App Check:** För extra skydd mot bot-attacker
3. **Konfigurera OAuth-omfång:** Begränsa vilken information som hämtas från Google-konton

### Ytterligare säkerhetsförbättringar (valfritt):

1. **Firebase App Check:**
   - Skyddar mot bot-attacker och missbruk
   - Aktivera i Firebase Console → App Check

2. **Rate Limiting:**
   - Lägg till begränsningar i Security Rules för att förhindra spam

3. **IP-begränsning:**
   - Använd Firebase Hosting rules eller Cloud Functions för IP-filtrering

## 🚀 Deployment

### Multi-Environment Setup (Dev & Prod)

Appen stödjer deployment till separata dev- och prod-miljöer. Detta gör det möjligt att testa ändringar i en dev-miljö innan de deployas till produktion.

#### 1. Skapa Firebase-projekt för dev och prod

1. **Skapa dev-projekt:**
   - Gå till https://console.firebase.google.com
   - Klicka på "Add project" eller "Create a project"
   - Välj ett lämpligt projektnamn (t.ex. "my-app-dev")
   - Notera projekt-ID:t

2. **Skapa prod-projekt (eller använd befintligt):**
   - Samma process som ovan
   - Välj ett lämpligt projektnamn (t.ex. "my-app-prod")
   - Notera projekt-ID:t

#### 2. Konfigurera miljövariabler

1. **Skapa `.env` för dev-miljön (lokal utveckling):**
   ```bash
   # Fyll i dina dev Firebase-värden
   FIREBASE_API_KEY=your-dev-api-key
   FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-dev-project-id
   FIREBASE_STORAGE_BUCKET=your-dev-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=1:123456789:web:abc123
   ```

2. **Skapa `.env.production` för prod-miljön:**
   ```bash
   # Fyll i dina prod Firebase-värden
   FIREBASE_API_KEY=your-prod-api-key
   FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-prod-project-id
   FIREBASE_STORAGE_BUCKET=your-prod-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=1:123456789:web:abc123
   ```

**Notera:** 
- `.env` är gitignored och används för lokal utveckling och dev-deployments
- Du kan välja att committa `.env.production` om du vill, eftersom Firebase API-nycklar är publika (säkerheten kommer från Security Rules)
- Projekt-ID:t läses automatiskt från `.env` (för dev) eller `.env.production` (för prod)

#### 3. Initiera Firebase Hosting (första gången)

```bash
# Installera Firebase CLI (en gång)
npm install -g firebase-tools

# Logga in
firebase login

# Initiera hosting (första gången - körs en gång per projekt)
firebase init hosting --project <your-dev-project-id>
# Välj: dist som public directory
# Välj: Yes för single-page app

firebase init hosting --project <your-prod-project-id>
# Välj: dist som public directory
# Välj: Yes för single-page app
```

**Notera:** 
- `firebase.json` är redan konfigurerad med hosting-inställningar, så du kan hoppa över init-steget om du vill.
- Projekt-ID:t läses automatiskt från `.env` (för dev) eller `.env.production` (för prod) - du behöver **inte** skapa `.firebaserc`.

#### 4. Deploya Security Rules till båda miljöerna

**Till dev (använd projekt-ID från `.env`):**
```bash
# Hämta projekt-ID från .env och använd det direkt
firebase deploy --only firestore:rules --project $(grep FIREBASE_PROJECT_ID .env | cut -d '=' -f2)
```

**Till prod (använd projekt-ID från `.env.production`):**
```bash
firebase deploy --only firestore:rules --project $(grep FIREBASE_PROJECT_ID .env.production | cut -d '=' -f2)
```

**Alternativ:** Använd `npm run deploy:dev:all` eller `npm run deploy:prod:all` som deployar både hosting och rules.

Eller manuellt via Firebase Console (se säkerhetssektionen ovan).

### Deployment-kommandon

#### Deploya till dev-miljön:

```bash
# Bygg och deploya endast hosting till dev
npm run deploy:dev

# Bygg och deploya hosting + Firestore rules till dev
npm run deploy:dev:all
```

#### Deploya till prod-miljön:

```bash
# Bygg och deploya endast hosting till prod
npm run deploy:prod

# Bygg och deploya hosting + Firestore rules till prod
npm run deploy:prod:all
```

#### Manuella build-kommandon:

```bash
# Bygg för dev
npm run build:dev

# Bygg för prod
npm run build:prod

# Bygg med standard mode (production)
npm run build
```

### Legacy Deployment (utan miljöseparering)

Om du bara vill deploya till ett projekt utan miljöseparering:

```bash
# Bygg appen
npm run build

# Deploya med projekt-ID från .env.production (eller ange projekt-ID direkt)
firebase deploy --only hosting --project $(grep FIREBASE_PROJECT_ID .env.production | cut -d '=' -f2)
```

### Andra alternativ:

- **Netlify:** Dra och släpp `dist/` mappen
- **Vercel:** `vercel --prod`
- **Egen webbserver:** Ladda upp innehållet i `dist/` till din server

### Miljövariabler för CI/CD

**Alternativ för CI/CD:**
- Sätt miljövariablerna i ditt CI/CD-system (GitHub Actions, GitLab CI, etc.)
- Vite kommer automatiskt läsa dem under build-processen baserat på `--mode` flaggan
- Använd `npm run build:dev` eller `npm run build:prod` i ditt CI/CD-flöde

## ✅ Checklista före deployment:

- [ ] Deploya Firestore Security Rules i Firebase Console
- [ ] Verifiera att Google Sign-In är aktiverat i Firebase Console (Authentication → Sign-in method → Google)
- [ ] Testa att Google-inloggning fungerar efter deployment
- [ ] Testa att bokningar skapas och raderas korrekt
- [ ] Verifiera att Security Rules blockerar otillåtna operationer


