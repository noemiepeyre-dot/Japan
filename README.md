# Carnet de voyage Japon (mobile + offline)

## Structure

- `index.html` : shell de l'app et zones de rendu.
- `styles.css` : design mobile-first + dark mode.
- `app.js` : sections (guide, itinéraire, transports, hôtel, tips, outils, journal), données d'exemple et stockage local.
- `sw.js` : service worker pour le cache offline.
- `manifest.webmanifest` : configuration PWA.

## Fonctionnalités incluses

- Navigation mobile en barre basse.
- Guide par ville/quartier avec exemples.
- Itinéraire par jour (matin/après-midi/soir) + notes perso sauvegardées en local.
- Transports, hôtels, tips.
- Outils:
  - Convertisseur EUR/USD → JPY (taux gratuit via Frankfurter quand internet disponible, sinon dernier taux local).
  - Zone météo éditable et accessible hors ligne.
  - Check-list voyage persistante.
- Journal de bord (notes souvenirs) persistant.

## Utilisation locale

1. Lancer un serveur statique dans ce dossier:

```bash
python3 -m http.server 8080
```

2. Ouvrir `http://localhost:8080/index.html` sur smartphone (même réseau) ou desktop.
3. Au premier chargement, le service worker met les fichiers en cache.
4. Ensuite, l'application continue de fonctionner hors ligne (données déjà chargées).

## Installation en mode "app"

- Sur Android (Chrome): menu `Ajouter à l'écran d'accueil`.
- Sur iPhone (Safari): `Partager` → `Sur l'écran d'accueil`.

## Notes techniques

- Aucun service payant.
- Dépendance API minimale: uniquement le taux de change gratuit (optionnel, fallback cache).
- Stockage utilisateur: `localStorage`.
