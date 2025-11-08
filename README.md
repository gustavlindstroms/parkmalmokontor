# Forefront Parkeringsbokning SPA

En mobilanpassad webbapplikation för att koordinera parkeringsbokningar för Forefronts anställda i Malmö.

## Översikt

Denna app hjälper Forefront-anställda att boka parkeringsplatser i förväg för att undvika konflikter. Appen koordinerar bokningar för tre parkeringsplatser som ägs och hanteras av P-Malmö.

### Hur det fungerar

1. **Förbokning (denna app):**
   - Användare loggar in med lösenord och bokar en ledig plats för ett specifikt datum
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

- ✅ Anonym inloggning via Firebase
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
- Kunna logga in med lösenordet
- Kunna läsa och skapa bokningar i Firestore

### Projekt-ID

Standard projekt-ID: `pmalmo-31282` (kan ändras via miljövariabler i `.env` eller `.env.production`).

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
2. Försök logga in med lösenordet
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

1. **Logga in:** Ange lösenordet `givemeinternet`
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

## Deployment

Se `DEPLOYMENT.md` för detaljerad information om deployment och säkerhet.


