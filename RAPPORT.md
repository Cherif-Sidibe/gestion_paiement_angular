# Rapport technique — BadWallet Dashboard (Angular 19)

## 1. Architecture générale

L'application est une SPA Angular 19 bâtie **exclusivement sur des composants
standalone** (aucun `NgModule`). Le découpage suit une séparation stricte des
responsabilités en quatre couches : `core/` (socle non graphique), `shared/`
(éléments réutilisables), `features/` (écrans métier) et `layouts/` (mises en
page). Le routage repose sur un **double lazy-loading** : la racine `/` charge le
module de routes Client et `/admin` celui de l'Agent (`loadChildren`), chaque
écran étant lui-même chargé à la demande via `loadComponent`.

**Découplage des services par InjectionToken.** Chaque service d'API est défini
par un triptyque *interface + `InjectionToken` + implémentation*. Par exemple
`WalletApiServiceInterface` est associé au jeton `WALLET_API_SERVICE_TOKEN`,
relié à `WalletApiService` dans `app.config.ts`. Les composants et validateurs
dépendent de l'abstraction, jamais de la classe concrète, ce qui facilite le
remplacement (mock de test, future implémentation) sans toucher au code appelant.
Même approche pour la facturation (`BILLING_API_SERVICE_TOKEN`).

**Gestion d'état par Signals.** Deux stores `@Injectable({providedIn:'root'})`
centralisent l'état réactif :
- `SessionStore` — `role` (`AGENT`/`CLIENT`) et `currentPhone`, exposés en
  signaux en lecture seule, plus un `computed` `isAuthenticated`.
- `BalanceStore` — solde courant exposé en signal ; `refresh(phone)` rappelle
  l'API et met à jour le signal.

**Gestion centralisée des erreurs.** Un intercepteur HTTP fonctionnel
(`errorInterceptor`) capture toute `HttpErrorResponse`, en extrait le message
métier (`body.message`) et le pousse vers un `ToastService` affiché par un
conteneur de toasts global. Les couches métier n'ont donc pas à gérer
l'affichage des erreurs.

**Pipes et guards.** Deux pipes purs custom — `xof` (formatage monétaire XOF via
`Intl.NumberFormat('fr-SN')`) et `phone` (mise en forme `+221 XX XXX XX XX`). La
protection des espaces repose sur deux `CanActivateFn`, `agentGuard` et
`clientGuard`, qui vérifient le rôle du `SessionStore` et redirigent vers
`/login` sinon.

## 2. Authentification simulée côté front

Le back n'expose **aucune authentification** : elle est simulée dans le front.
Sur l'écran d'entrée, l'utilisateur choisit un rôle ; `SessionStore.setAgent()`
ou `setClient(phone)` enregistre `role` (et le téléphone pour le client) dans le
`localStorage` (`bw-role`, `bw-phone`). Les signaux sont initialisés depuis ce
`localStorage`, donc la session **survit à un rechargement** de page. Les guards
de rôle font office de contrôle d'accès, et `clear()` réinitialise tout à la
déconnexion.

## 3. Solde en temps réel

Le solde affiché est toujours synchronisé avec le back. Après **chaque
opération** mutant le solde (transfert, paiement de factures…), le composant
appelle `BalanceStore.refresh(phone)`, qui relit `GET /balance` et met à jour le
signal ; l'UI se rafraîchit automatiquement grâce à la réactivité des signaux.

## 4. Difficultés rencontrées et solutions

- **CORS verrouillé sur le port 4200.** Le back n'autorise que l'origine
  `http://localhost:4200`. Tout lancement sur un autre port échoue côté
  navigateur. → Lancement imposé via `ng serve --port 4200`, documenté dans le
  README, `apiBaseUrl` pointant sur `http://localhost:8080`.

- **Lien `phone → walletCode` pour les factures.** L'API factures est indexée
  par `walletCode`, alors que la session ne connaît que le téléphone. → Le
  composant Factures résout d'abord le wallet (`getWalletByPhone`) pour récupérer
  son `code`, puis interroge `/api/external/factures/{walletCode}/current`.

- **Validation asynchrone du destinataire.** Le formulaire de transfert vérifie
  en temps réel que le numéro saisi correspond à un wallet existant
  (`receiverExistsValidator`, `updateOn:'blur'`). Or l'appel de vérification
  renvoie naturellement une 404 quand le wallet n'existe pas, ce qui aurait
  déclenché un toast d'erreur parasite. → Introduction d'un
  `HttpContextToken SKIP_ERROR_TOAST` : la requête de contrôle est marquée pour
  être **ignorée par l'intercepteur**, le validateur transformant simplement
  l'échec en erreur de formulaire `receiverNotFound`. S'y ajoutent un validateur
  `pattern` (`+221` + 9 chiffres) et `differentPhoneValidator` (interdit
  l'auto-transfert).

- **Paiement de factures multi-services.** Une sélection de factures peut mêler
  plusieurs fournisseurs (ISM, WOYAFAL), mais l'endpoint `pay-factures` n'accepte
  qu'un service à la fois. → Les références sélectionnées sont **regroupées par
  service** (`Map<service, references[]>`), puis tous les appels sont émis en
  parallèle via `forkJoin`. À la complétion globale : toast de succès,
  rafraîchissement du solde et rechargement de la liste des factures impayées.

## 5. Bilan

L'architecture standalone + Signals + injection par token donne un code modulaire,
faiblement couplé et testable, où la gestion d'état et des erreurs est
centralisée. Les principaux défis étaient d'ordre intégration (CORS, mapping de
clés, contrôle d'accès simulé) plutôt qu'algorithmique, et ont été résolus par
des mécanismes Angular idiomatiques (contexte HTTP, validateurs async, opérateurs
RxJS).
