# FLYTAX
Le site est accessible à
<https://flyingeek.github.io/flytax/index.html>

## Installation

```bash
npm ci
```

Pour lancer le site en mode développement

```bash
npm run dev
```

Pour construire le site

```bash
npm run clean
npm run build
```

Pour lancer les tests unitaires

```bash
npm run test
```

## Création des fichiers data

Pour les aéroports, (conversion IATA -> PAYS)

```bash
npm run makeAirports
```

Pour les données fiscales, il faut obtenir un accès à l'[API de la Banque de France](http://developer.webstat.banque-france.fr)

Ensuite il faut créer un fichier .env contenant en utilisant cette clé

```bash
echo "BNF_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" > .env
```

Vous pouvez alors créer les data pour l'année 2020 en faisant

```bash
npm run makeData 2020

```

## Publication sur GitHub

.github/workflows/main.yml publie automatiquement sur la branche gh-pages à chaque push sur la branche main
