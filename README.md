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

Firebase-konfigurationen finns i `src/firebase.ts`. Projekt-ID: `pmalmo-31282`.

### Firestore Security Rules

Security Rules måste deployas i Firebase Console för att skydda databasen. Reglerna finns i `firebase.rules`.

**Viktigt:** Deploya reglerna via Firebase Console → Firestore Database → Rules.

Nuvarande regler:
- Endast inloggade användare kan läsa bokningar
- Endast inloggade användare kan skapa bokningar (med validering)
- Alla inloggade användare kan radera bokningar
- Uppdateringar är blockerade (bokningar är oföränderliga)

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


