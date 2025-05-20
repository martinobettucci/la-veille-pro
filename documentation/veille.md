# Gestion des veilles

## Description

Ce module permet à l’utilisateur de créer, éditer, supprimer et lister ses veilles (sujets de surveillance).  
Chaque veille comprend :
- Un nom
- Une liste de mots-clés
- Une liste de sentiments à surveiller

Les veilles sont stockées dans IndexedDB (store "veilles").

## Composants

- **VeilleList** : Affiche la liste des veilles, permet d’ajouter, éditer, supprimer.
- **VeilleForm** : Formulaire de création/édition d’une veille.

## API

- `getDB()` : Accès à la base IndexedDB.
- Les veilles sont des objets `{ id, name, keywords, sentiments, createdAt }`.

## UX

- UI responsive, moderne, accessible.
- Feedback utilisateur sur erreurs et actions.
- Toutes les modifications sont persistées localement.

## À venir

- Ajout de la gestion des sources pour chaque veille.
- Intégration avec l’API OpenAI pour la recherche de sources.
