# Forefront Parkeringsbokning SPA

Mobilanpassad Vue 3 + Tailwind SPA som använder Firebase Authentication (anonym) och Firestore.

## Krav
- Node 18+

## Installera
```bash
npm install
```

## Utveckla
```bash
npm run dev
```

## Bygga (statiska filer)
```bash
npm run build
# Deploya sedan mappen dist/ som statiska filer
```

## Firebase konfiguration
Uppdatera `src/firebase.ts` med din `firebaseConfig` om nödvändigt.

## Firestore Security Rules
Deploya reglerna i `firebase.rules` via Firebase Console eller CLI.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    match /bookings/{bookingId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() &&
        request.resource.data.userId == request.auth.uid;
      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow update: if false;
    }
  }
}
```

## Flöde
- Lösenord: `givemeinternet` → anonym inloggning
- Datumväljare → realtidsöversikt för platser 1–3
- Boka ledig plats → ange 6-teckens regnr (A-Z/0-9), sparas till localStorage
- Avboka syns endast om localStorage-regnr + userId matchar


