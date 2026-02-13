# Session-Problem auf Raspberry Pi beheben

## Problem
Die Console zeigt `Dashboard session: undefined`, was bedeutet, dass die Session nicht funktioniert.

## Ursache
Die Session benötigt ein `SECRET_COOKIE_PASSWORD` in der `.env` Datei, um zu funktionieren.

## Lösung

### Schritt 1: .env Datei auf dem Raspberry Pi bearbeiten

Öffne die `.env` Datei auf deinem Raspberry Pi:

```bash
cd ~/rezept-app
nano .env
```

### Schritt 2: Füge folgende Zeilen hinzu

Stelle sicher, dass deine `.env` Datei so aussieht:

```env
DATABASE_URL="file:./dev.db"

# Session Secret - WICHTIG für Session-Management
SECRET_COOKIE_PASSWORD="complex_password_at_least_32_characters_long_change_this_in_production"

# Optional: Nur auf 'true' setzen, wenn du HTTPS verwendest
# USE_SECURE_COOKIES="true"
```

### Schritt 3: Generiere ein sicheres Secret (EMPFOHLEN)

Für bessere Sicherheit, generiere ein zufälliges Secret:

```bash
# Generiere ein sicheres Secret
openssl rand -base64 32
```

3F+MF7u1kGvCHzGbXvFnLeydgnSYr1P8e3CJVmFH7ug=

Kopiere die Ausgabe und ersetze den Wert von `SECRET_COOKIE_PASSWORD` in der `.env` Datei.

Beispiel:
```env
SECRET_COOKIE_PASSWORD="dein_generiertes_secret_hier"
```

### Schritt 4: Speichere die Datei

- In `nano`: Drücke `Ctrl+O` zum Speichern, dann `Enter`, dann `Ctrl+X` zum Beenden

### Schritt 5: Starte die App neu

```bash
# Wenn du PM2 verwendest:
pm2 restart rezept-app

# Wenn du die App direkt ausführst:
# Stoppe die laufende App (Ctrl+C) und starte sie neu:
npm start
```

### Schritt 6: Teste die Anwendung

1. Öffne die App im Browser: `http://<raspberry-pi-ip>:3000`
2. Versuche dich einzuloggen
3. Die Session sollte jetzt funktionieren

## Wichtige Hinweise

### Für Produktionsumgebungen:

> [!IMPORTANT]
> Wenn du die App öffentlich zugänglich machst oder HTTPS verwendest:
> 
> 1. **Generiere ein starkes Secret** mit `openssl rand -base64 32`
> 2. **Setze USE_SECURE_COOKIES="true"** in der `.env` Datei (nur mit HTTPS!)
> 3. **Verwende HTTPS** mit einem SSL-Zertifikat (siehe Hauptanleitung)

### Für lokale Entwicklung/Test:

> [!NOTE]
> Für lokale Tests ohne HTTPS ist die aktuelle Konfiguration ausreichend.
> Die Session funktioniert auch ohne `USE_SECURE_COOKIES="true"`.

## Fehlerbehebung

### Session funktioniert immer noch nicht?

1. **Überprüfe die .env Datei:**
   ```bash
   cat .env
   ```
   Stelle sicher, dass `SECRET_COOKIE_PASSWORD` gesetzt ist.

2. **Überprüfe die Logs:**
   ```bash
   # PM2 Logs
   pm2 logs rezept-app
   
   # Oder wenn direkt gestartet, schaue in die Console
   ```

3. **Lösche Browser-Cookies:**
   - Öffne die Browser-Entwicklertools (F12)
   - Gehe zu "Application" → "Cookies"
   - Lösche alle Cookies für deine App
   - Lade die Seite neu

4. **Überprüfe die Dateiberechtigungen:**
   ```bash
   chmod 600 .env
   ```

5. **Stelle sicher, dass die Datenbank existiert:**
   ```bash
   ls -la dev.db
   ```
   Wenn die Datei nicht existiert, führe die Migrationen aus:
   ```bash
   npx prisma migrate deploy
   ```

## Änderungen in dieser Lösung

Die folgenden Dateien wurden aktualisiert:

1. **`.env`** - `SECRET_COOKIE_PASSWORD` hinzugefügt
2. **`lib/session.ts`** - Session-Konfiguration angepasst für Raspberry Pi ohne HTTPS

Diese Änderungen sind bereits in deinem lokalen Projekt vorhanden. Du musst sie nur auf den Raspberry Pi übertragen.

## Dateien auf Raspberry Pi aktualisieren

Wenn du die Änderungen auf den Raspberry Pi übertragen möchtest:

### Option 1: Mit Git (wenn du ein Repository hast)

```bash
cd ~/rezept-app
git pull
npm install
npm run build
pm2 restart rezept-app
```

### Option 2: Dateien manuell kopieren

Vom lokalen Computer:

```bash
# .env Datei kopieren
scp /home/janik270/Programm/rezept-app2.0/.env pi@<raspberry-pi-ip>:~/rezept-app/.env

# session.ts kopieren
scp /home/janik270/Programm/rezept-app2.0/lib/session.ts pi@<raspberry-pi-ip>:~/rezept-app/lib/session.ts
```

Dann auf dem Raspberry Pi:

```bash
cd ~/rezept-app
npm run build
pm2 restart rezept-app
```

---

**Nach diesen Schritten sollte die Session funktionieren! 🎉**
