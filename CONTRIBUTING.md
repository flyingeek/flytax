# Contribuer à Flytax

## Code

Le code doit être en anglais. Tabulations: 4 espaces.

## Confidentialité et Protection des Données

Il est essentiel qu'aucune vraie donnée personnelle ne se retrouve jamais dans l'historique public de ce projet.

### 1. Aucun PDF autorisé

**Les documents PDF ne doivent jamais être envoyés (commités) sur ce dépôt, même temporairement.**

Les vrais PDF de plannings contiennent des données personnelles sensibles, comme le nom complet, le numéro de matricule (ou numéro d'employé), et les détails du planning privé (vols, repos, etc.). Nous avons mis en place des vérifications automatiques pour interdire l'ajout de fichiers PDF, mais comprendre *pourquoi* cette règle existe aide tout le monde à rester vigilant.

### 2. Anonymiser tous les fichiers de test

Si vous ajoutez de nouvelles données de test (dans le dossier `test/fixtures/`), vous devez ajouter les données sous forme de fichiers texte extraits (`.txt`) et non les documents bruts d'origine.

Avant de soumettre un fichier de test, **vous devez l'inspecter et en retirer manuellement toute information personnelle**. Pensez bien à effacer :
- Les noms
- Les numéros de matricule / identifiants professionnels
- Toute autre information permettant une identification

Pour vous faire une idée, regardez les fichiers `.txt` déjà anonymisés dans le dossier `test/fixtures/` pour voir à quoi un fichier de test acceptable doit ressembler.

## Lancer les tests localement

Avant de proposer une modification de code, vous devez vérifier que vos modifications passent les tests.

En supposant que vous ayez installé Node.js, ouvrez un terminal, allez dans le dossier du projet, et lancez :

```bash
# Installe les dépendances nécessaires (à faire une seule fois)
npm ci

# Lance la suite de tests
npm test
```

## Des questions ?

Si vous n'êtes pas sûr(e) qu'un fichier puisse être partagé sans risque, ou si vous avez des questions générales sur la manière de contribuer, n'hésitez pas à ouvrir une "Issue" sur GitHub pour en discuter. Au moindre doute concernant la vie privée, il vaut toujours mieux demander d'abord !
