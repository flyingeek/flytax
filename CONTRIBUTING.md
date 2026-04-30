# Contribuer à FlyTax

Merci de votre intérêt pour FlyTax ! Ce document explique les règles à suivre pour contribuer au projet.

## Règles importantes

### 🚫 Pas de PDF

Les fichiers PDF ne doivent **jamais** être ajoutés au dépôt, même temporairement. Les PDF des bulletins de paie (EP4/EP5) contiennent des données personnelles (nom, adresse, montants de rémunération). Le `.gitignore` bloque les PDF automatiquement, mais il est important de comprendre *pourquoi* cette règle existe : protéger la vie privée des utilisateurs.

### 🔒 Données de test anonymisées

Si vous ajoutez des fichiers de test dans `test/fixtures/`, assurez-vous qu'ils sont **totalement anonymisés** :
- Supprimez les noms, numéros de matricule, adresses et toute autre donnée personnelle
- Utilisez des données fictives qui ne correspondent à aucune personne réelle
- Le format de référence est les fichiers `.txt` d'extraction déjà présents dans le dépôt

Cette règle s'applique aussi aux commits Git : un commit qui contient des données personnelles, même s'il est supprimé plus tard, reste dans l'historique Git.

### ✅ Vérifications avant de soumettre

1. Aucun PDF n'est inclus dans vos modifications
2. Les fichiers de test contiennent uniquement des données anonymisées
3. L'application fonctionne correctement après vos modifications

## Lancer les tests en local

```bash
npm install
npm test
```

## Questions ?

Ouvrez une [issue](https://github.com/flyingeek/flytax/issues) ou contactez @flyingeek.
