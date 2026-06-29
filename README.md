# BadWallet — Tableau de bord (SPA Angular 19)

Application web monopage (SPA) développée avec **Angular 19** servant de tableau
de bord au système de paiement mobile **BadWallet**. Elle expose deux espaces
distincts à partir d'un même point d'entrée :

- **Espace Agent** : gestion des wallets (portefeuilles) clients — listing,
  création, recherche, dépôts et retraits.
- **Espace Client** : consultation du solde en temps réel, transferts d'argent,
  paiement de factures et historique des opérations.

Le front-end ne contient aucune logique métier de paiement : il consomme l'API
REST du back **BadWallet** (`http://localhost:8080`) et le **payment-service**
(port 8081) pour la facturation.

---

## Prérequis

| Outil | Version recommandée |
|-------|---------------------|
| Node.js | ≥ 18.19 (LTS) |
| npm | ≥ 9 |
| Angular CLI | 19.x (`npm install -g @angular/cli`) |

Côté back-end, deux services doivent tourner pour exploiter toutes les
fonctionnalités :

- **BadWallet** sur `http://localhost:8080` (wallets, transferts, dépôts,
  retraits).
- **payment-service** sur `http://localhost:8081` (factures) — appelé par
  BadWallet via la passerelle `/api/external/factures`.

---

## Installation

```bash
cd gestion_paiement_angular
npm install
```

---

## Lancement

> ⚠️ **IMPORTANT — port 4200 obligatoire.** Le back BadWallet n'autorise le CORS
> que pour l'origine `http://localhost:4200`. L'application **doit** donc être
> servie sur ce port, sinon toutes les requêtes HTTP seront bloquées par le
> navigateur.

```bash
ng serve --port 4200
# ou simplement (port 4200 par défaut)
npm start
```

L'application est ensuite disponible sur **http://localhost:4200**.

Avant de l'utiliser, assurez-vous que **les deux services back sont démarrés** :

1. **BadWallet** (port 8080) — indispensable pour se connecter et opérer.
2. **payment-service** (port 8081) — indispensable pour l'affichage et le
   paiement des factures.

---

## Comment l'utiliser

1. À l'ouverture, l'**écran d'entrée** propose de choisir un rôle.
2. **Entrer comme Agent** : accès direct à la console de gestion des wallets.
3. **Entrer comme Client** : saisir un **numéro de téléphone existant** au format
   `+221XXXXXXXXX`.
   - Exemple fourni avec des données de démo :
     **`+221770000003`** (ce wallet possède des factures et un historique de
     transactions).

Le rôle et le numéro sont conservés en `localStorage`, de sorte que la session
survit à un rafraîchissement de la page.

---

## Fonctionnalités

### Espace Agent (`/admin`)
- **Liste des wallets** — tableau paginé de tous les portefeuilles.
- **Création de wallet** — formulaire (téléphone, email, code, solde initial,
  devise) avec validation.
- **Recherche** — recherche d'un wallet par numéro de téléphone.
- **Dépôt** — créditer un wallet.
- **Retrait** — débiter un wallet.

### Espace Client (`/`)
- **Dashboard** — solde courant et raccourcis vers les opérations.
- **Transfert** — envoi d'argent vers un autre numéro, avec vérification du
  destinataire en temps réel.
- **Factures** — onglets « En cours » (sélection multiple + paiement) et
  « Historique » (consultation par période), tous fournisseurs ou filtré
  (ISM / WOYAFAL).
- **Historique** — liste des transactions du wallet.

---

## Stack technique

- **Angular 19** — composants **standalone** (sans NgModule).
- **Angular Signals** — gestion d'état réactive (`SessionStore`, `BalanceStore`).
- **HttpClient** + intercepteur fonctionnel pour les appels REST.
- **Reactive Forms** (et Template Forms pour l'écran d'entrée) avec validateurs
  synchrones et asynchrones.
- **Bootstrap 5** + Bootstrap Icons (chargés via CDN).
- **RxJS** pour la composition des flux (`map`, `forkJoin`, `catchError`…).

---

## Structure des dossiers

```
src/app/
├── core/          # socle applicatif (sans UI)
│   ├── models/        # interfaces & types (Wallet, Transaction, Facture, RestResponse…)
│   ├── services/      # services API + interfaces + InjectionToken (wallet, billing)
│   ├── store/         # état global par Signals (SessionStore, BalanceStore)
│   ├── interceptors/  # errorInterceptor + jeton SKIP_ERROR_TOAST
│   ├── guards/        # agentGuard / clientGuard (protection des routes par rôle)
│   └── validators/    # validateurs de transfert (sync + async)
├── shared/        # éléments réutilisables
│   ├── pipes/         # xof (devise XOF), phone (formatage +221)
│   └── components/    # pagination, conteneur de toasts
├── features/      # écrans métier, lazy-loadés
│   ├── entry/         # écran d'entrée / choix du rôle
│   ├── agent/         # wallets-list, wallet-create, wallet-search, deposit, withdraw
│   └── client/        # dashboard, transfer, bills (current/history), transactions
└── layouts/       # mises en page Agent et Client (header + router-outlet)
```

Le routage est organisé en **double lazy-loading** : `/admin/**` (Agent) et `/`
(Client) chargent chacun leur module de routes et leurs écrans à la demande.
