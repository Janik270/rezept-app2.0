# Raspberry Pi Installation Guide - Rezept App

Diese Anleitung erklärt, wie du die Rezept-App auf einem Raspberry Pi installierst und betreibst.

## Voraussetzungen

- Raspberry Pi (empfohlen: Pi 4 oder neuer mit mindestens 2GB RAM)
- Raspberry Pi OS (64-bit empfohlen)
- Internetzugang
- SSH-Zugriff oder direkter Zugang zum Pi

## Installation

### 1. System aktualisieren

Zuerst aktualisiere dein System:

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Node.js installieren

Installiere Node.js (Version 18 oder höher wird empfohlen):

```bash
# Node.js 20.x installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Überprüfe die Installation
node --version
npm --version
```

**Alternative:** Wenn du Node.js lokal im Projekt verwenden möchtest (wie in deiner aktuellen Entwicklungsumgebung):

```bash
# Python venv für Node.js
python3 -m venv node_env
source node_env/bin/activate
# Dann Node.js manuell herunterladen und im node_env/bin Verzeichnis platzieren
```

### 3. Projekt auf den Raspberry Pi übertragen

#### Option A: Mit Git (empfohlen)

Wenn dein Projekt in einem Git-Repository ist:

```bash
cd ~
git clone <dein-repository-url> rezept-app
cd rezept-app
```

#### Option B: Mit SCP/SFTP

Vom lokalen Computer aus:

```bash
scp -r /home/janik270/Programm/rezept-app2.0 pi@<raspberry-pi-ip>:~/rezept-app
```

Dann auf dem Pi:

```bash
cd ~/rezept-app
```

### 4. Dependencies installieren

```bash
npm install
```

### 5. Umgebungsvariablen konfigurieren

Erstelle oder bearbeite die `.env` Datei:

```bash
nano .env
```

Füge folgende Variablen hinzu (passe sie an deine Bedürfnisse an):

```env
# Datenbank
DATABASE_URL="file:./dev.db"

# Session Secret (generiere einen sicheren zufälligen String)
# WICHTIG: Dieses Secret ist erforderlich für Session-Management!
SECRET_COOKIE_PASSWORD="dein-sehr-sicheres-geheimnis-hier"

# Optional: ChatGPT API Key
OPENAI_API_KEY="dein-api-key"

# Node Environment
NODE_ENV="production"

# Optional: Nur auf 'true' setzen, wenn du HTTPS/SSL verwendest
# USE_SECURE_COOKIES="true"
```

> [!TIP]
> Generiere ein sicheres Session Secret mit: `openssl rand -base64 32`

> [!IMPORTANT]
> **Für Raspberry Pi ARM64:** Das Projekt ist bereits für ARM64 konfiguriert. Die `prisma/schema.prisma` enthält `binaryTargets = ["native", "linux-arm64-openssl-3.0.x"]`, was für den Raspberry Pi erforderlich ist.

### 6. Datenbank initialisieren

```bash
# Prisma Client generieren (lädt ARM64-Binaries herunter)
npx prisma generate

# Datenbank migrieren
npx prisma migrate deploy

# Optional: Seed-Daten einfügen (falls vorhanden)
npx prisma db seed
```
npx prisma generate
### 7. Produktions-Build erstellen

```bash
npm run build
```

### 8. Anwendung starten

#### Option A: Direkt starten (für Tests)

```bash
npm start
```

Die App läuft jetzt auf `http://localhost:3000`

#### Option B: Mit PM2 (empfohlen für Produktion)

PM2 ist ein Process Manager, der die App im Hintergrund laufen lässt und bei Abstürzen neu startet:

```bash
# PM2 installieren
sudo npm install -g pm2

# App mit PM2 starten
pm2 start npm --name "rezept-app" -- start

# PM2 beim Systemstart automatisch starten
pm2 startup
pm2 save

# Nützliche PM2 Befehle:
pm2 status          # Status anzeigen
pm2 logs rezept-app # Logs anzeigen
pm2 restart rezept-app # App neu starten
pm2 stop rezept-app    # App stoppen
```

### 9. Nginx als Reverse Proxy einrichten (Optional, aber empfohlen)

Nginx ermöglicht es, die App über Port 80/443 zu erreichen und SSL zu verwenden:

```bash
# Nginx installieren
sudo apt install -y nginx

# Nginx-Konfiguration erstellen
sudo nano /etc/nginx/sites-available/rezept-app
```

Füge folgende Konfiguration ein:

```nginx
server {
    listen 80;
    server_name <deine-domain-oder-ip>;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktiviere die Konfiguration:

```bash
# Symlink erstellen
sudo ln -s /etc/nginx/sites-available/rezept-app /etc/nginx/sites-enabled/

# Nginx-Konfiguration testen
sudo nginx -t

# Nginx neu starten
sudo systemctl restart nginx
```

### 10. SSL mit Let's Encrypt einrichten (Optional)

Für HTTPS-Zugriff:

```bash
# Certbot installieren
sudo apt install -y certbot python3-certbot-nginx

# SSL-Zertifikat erstellen
sudo certbot --nginx -d <deine-domain>

# Auto-Renewal testen
sudo certbot renew --dry-run
```

## Zugriff auf die Anwendung

- **Lokal auf dem Pi:** `http://localhost:3000`
- **Im Netzwerk:** `http://<raspberry-pi-ip>:3000`
- **Mit Nginx:** `http://<raspberry-pi-ip>` oder `http://<deine-domain>`
- **Mit SSL:** `https://<deine-domain>`

## Wartung

### Logs anzeigen

```bash
# PM2 Logs
pm2 logs rezept-app

# Nginx Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### App aktualisieren

```bash
cd ~/rezept-app

# Code aktualisieren (wenn Git verwendet wird)
git pull

# Dependencies aktualisieren
npm install

# Datenbank migrieren (falls nötig)
npx prisma migrate deploy

# Neu bauen
npm run build

# App neu starten
pm2 restart rezept-app
```

### Backup der Datenbank

```bash
# SQLite Datenbank sichern
cp ~/rezept-app/dev.db ~/rezept-app-backup-$(date +%Y%m%d).db

# Oder mit cron automatisieren
crontab -e
# Füge hinzu: 0 2 * * * cp ~/rezept-app/dev.db ~/backups/rezept-app-$(date +\%Y\%m\%d).db
```

## Troubleshooting

### Session funktioniert nicht (Dashboard session: undefined)

> [!IMPORTANT]
> Wenn die Console `Dashboard session: undefined` zeigt, fehlt das `SECRET_COOKIE_PASSWORD` in der `.env` Datei.

**Schnelle Lösung:**

1. Öffne die `.env` Datei: `nano .env`
2. Füge hinzu: `SECRET_COOKIE_PASSWORD="dein-sicheres-secret-hier"`
3. Generiere ein sicheres Secret: `openssl rand -base64 32`
4. Starte die App neu: `pm2 restart rezept-app`

**Detaillierte Anleitung:** Siehe [RASPBERRY_PI_SESSION_FIX.md](file:///home/janik270/Programm/rezept-app2.0/RASPBERRY_PI_SESSION_FIX.md)

### Port 3000 ist bereits belegt

```bash
# Prozess finden und beenden
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Nicht genug Speicher

Wenn der Build fehlschlägt wegen Speichermangel:

```bash
# Swap-Speicher erhöhen
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Ändere CONF_SWAPSIZE=100 zu CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### Prisma Client Fehler

#### Fehler: "linux-arm64-openssl-3.0.x" binary target fehlt

Wenn du diesen Fehler siehst:
```
Prisma Client could not locate the Query Engine for runtime "linux-arm64-openssl-3.0.x"
```

**Lösung:** Das Projekt ist bereits konfiguriert. Stelle sicher, dass du `npx prisma generate` auf dem Raspberry Pi ausführst:

```bash
# Auf dem Raspberry Pi:
cd ~/rezept-app
npx prisma generate
npm run build
pm2 restart rezept-app
```

#### Allgemeine Prisma-Probleme

```bash
# Prisma Client neu generieren
npx prisma generate

# Falls das nicht hilft, node_modules löschen und neu installieren
rm -rf node_modules
npm install
npx prisma generate
```

### Berechtigungsprobleme

```bash
# Stelle sicher, dass der Benutzer Schreibrechte hat
sudo chown -R $USER:$USER ~/rezept-app
chmod -R 755 ~/rezept-app
```

## Performance-Tipps

1. **Verwende einen Raspberry Pi 4 oder neuer** mit mindestens 2GB RAM
2. **Aktiviere Swap-Speicher** (siehe oben)
3. **Verwende eine schnelle SD-Karte** (Class 10 oder UHS-I)
4. **Überlege, eine SSD zu verwenden** statt einer SD-Karte für bessere Performance
5. **Deaktiviere unnötige Dienste** um Ressourcen zu sparen

## Sicherheitshinweise

> [!CAUTION]
> Wichtige Sicherheitsmaßnahmen für den Produktionsbetrieb:

1. **Ändere das Standard-Passwort** des Raspberry Pi
2. **Verwende starke Passwörter** für Admin-Accounts in der App
3. **Aktiviere die Firewall:**
   ```bash
   sudo apt install ufw
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```
4. **Halte das System aktuell:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
5. **Verwende SSL/HTTPS** für den Produktionsbetrieb
6. **Sichere deine .env Datei:**
   ```bash
   chmod 600 .env
   ```

## Nützliche Befehle

```bash
# System-Ressourcen überwachen
htop

# Festplattenspeicher prüfen
df -h

# Temperatur des Pi prüfen
vcgencmd measure_temp

# Netzwerk-Verbindungen anzeigen
sudo netstat -tulpn | grep :3000
```

---

**Viel Erfolg mit deiner Rezept-App auf dem Raspberry Pi! 🍓**
