# NajiyaShade — Firebase Emulator Guide

## What's Running

| Emulator   | Port  | UI Link                          |
|------------|-------|----------------------------------|
| Auth       | 9099  | http://127.0.0.1:4000/auth       |
| Firestore  | 8080  | http://127.0.0.1:4000/firestore  |
| Storage    | 9199  | http://127.0.0.1:4000/storage    |

**Emulator UI dashboard:** http://127.0.0.1:4000

---

## Start the Emulator

```bash
npm run emulators
```

This starts all three emulators (Auth, Firestore, Storage) with the UI enabled.

---

## Stop / Kill the Emulator

### Option 1: Stop from the terminal where it's running
Press `Ctrl + C` in the terminal where the emulator is running.

### Option 2: Kill all Firebase emulator processes (PowerShell)
```powershell
Get-Process -Name java -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match 'firebase' } | Stop-Process -Force
```

### Option 3: Kill everything on the emulator ports
```powershell
# Auth port
netstat -ano | findstr :9099 | ForEach-Object { Stop-Process -Id ($_ -split '\s+')[-1] -Force }

# Firestore port
netstat -ano | findstr :8080 | ForEach-Object { Stop-Process -Id ($_ -split '\s+')[-1] -Force }

# Storage port
netstat -ano | findstr :9199 | ForEach-Object { Stop-Process -Id ($_ -split '\s+')[-1] -Force }
```

### Option 4: Nuclear — kill ALL java processes
```powershell
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## Save & Restore Emulator Data

### Export data (save current state)
```bash
npm run emulators:export
```
This saves data to `./emulator-data/`.

### Import data on next start (restore previous state)
```bash
npm run emulators:import
```
This loads data from `./emulator-data/` on startup.

---

## Files

| File                 | Purpose                                    |
|----------------------|--------------------------------------------|
| `firebase.json`      | Emulator port config + rules file paths    |
| `.firebaserc`        | Firebase project binding (placeholder)     |
| `firestore.rules`    | Firestore security rules (open for dev)    |
| `storage.rules`      | Storage security rules (open for dev)      |
| `src/config/firebase.ts` | App-side emulator connection helper   |

---

## Project Setup Checklist

- [x] Install `@react-native-firebase/*` packages
- [x] Install `firebase-tools` (dev dependency)
- [x] Create `firebase.json` with emulator config
- [x] Create `firestore.rules` and `storage.rules`
- [x] Create `src/config/firebase.ts` for emulator connection
- [ ] Create Firebase project at console.firebase.google.com
- [ ] Download `google-services.json` → `android/app/`
- [ ] Download `GoogleService-Info.plist` → `ios/NajiyaShade/`
- [ ] Update `.firebaserc` with real project ID
- [ ] Run `cd ios && pod install` (iOS only)
- [ ] Rebuild native app

---

## Troubleshooting

**Port already in use:**
```powershell
# Find what's using the port
netstat -ano | findstr :9099
# Kill the process
Stop-Process -Id <PID> -Force
```

**Emulator won't start / Java errors:**
Make sure Java 11+ is installed:
```bash
java -version
```

**Auth emulator "already running" error:**
Kill leftover Java processes first:
```powershell
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Storage emulator "no rules file" error:**
Make sure `storage.rules` exists and `firebase.json` references it (already configured).
