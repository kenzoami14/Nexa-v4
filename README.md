# Nexa — Poké'Nexa

Portail web responsive Nexa : accueil, serveur Poké'Nexa, actualités, téléchargement du modpack et chat communautaire. Le frontend est dans `frontend/`, l’API Node.js et le flux d’événements temps réel dans `backend/`.

## Lancer en local

Installe Node.js 20 ou supérieur, lance `npm start`, puis ouvre http://localhost:3000.

## Chat

Le pseudo est demandé uniquement lors du premier envoi. Il est ensuite gardé dans le stockage local du navigateur. Il suit donc le joueur sur ce même navigateur/appareil et reste modifiable en effaçant les données locales du site. Sans connexion/compte, les pseudos ne sont pas vérifiés et peuvent être réutilisés par d’autres joueurs.

Les messages texte et images sont diffusés en direct par SSE et l’API. La version actuelle conserve jusqu’à 80 messages dans la mémoire du processus; ils disparaissent lors d’un redémarrage, d’un déploiement ou d’une mise en veille de l’instance Render gratuite. Pour un historique durable partagé, il faudra connecter ultérieurement une base de données persistante. Les images sont redimensionnées dans le navigateur, limitées aux formats JPG/PNG/WebP et ne sont pas conservées après redémarrage.

## Poké'Nexa

- Minecraft Java 1.21.1
- Fabric 0.19.5
- Adresse : `90.12.207.74`
- Modpack CurseForge : `frontend/downloads/pokenexa-modpack.zip`

Le statut et le nombre de joueurs sont affichés comme inconnus tant qu’une API de statut Minecraft n’est pas branchée. Le logo Nexa ouvre l’easter egg après cinq clics.

## API

- `GET /api/health`
- `GET /api/servers`
- `GET /api/events` — événements serveur et chat en direct (SSE)
- `GET /api/chat` — messages récents
- `POST /api/chat` — envoi d’un message texte et/ou d’une image
- `GET /api/launcher/manifest/pokenexa`

## Déploiement

Le dépôt inclut un `Dockerfile` et `render.yaml` pour Render. Après mise à jour du dépôt GitHub relié, Render peut redéployer automatiquement la branche configurée. Les fichiers de chat sont en mémoire et ne doivent pas être considérés comme une sauvegarde persistante.
