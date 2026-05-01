# ![FLYTAX](https://github.com/flyingeek/flytax/blob/main/assets/flytax-icons/72px.png?raw=true)

Une aide au calcul des impôts pour les PNT AF qui ne transfère aucune données sur Internet. L'app calcule notamment les frais réels à partir des EP4/EP5.

Rendez-vous sur [FLYTAX](https://flyingeek.github.io/flytax/) pour utiliser l'app. Mais continuez à lire si vous êtes un développeur ou si vous souhaitez accèder aux données brutes.

## Installation [![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/flyingeek/flytax)

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

Pour les spécificités du développement avec preview sur l'iPad voir [#iPad](#ipad)

_Note: cliquer sur le badge Gitpod permet de lancer un VSCode dans le cloud, prêt-à-coder_

## Fixtures de test PDF

Les tests dans `test/utilities/pdf.test.js` vérifient l'extraction de texte sur une série de PDFs anonymisés. Ces PDFs sont absents du repo public pour des raisons de confidentialité.
En revanche, le texte extrait reste disponible dans `test/fixtures/` (`.txt` pour le mode flat, `.rows.txt` pour le mode row-aware) et sert de fixture pour les autres tests.

Sans les PDFs, les tests basés sur le texte extrait (ex. `test/parsers.test.js`) fonctionnent normalement. Les tests qui requièrent les PDFs (ex. `test/utilities/pdf.test.js`) sont automatiquement ignorés.

### Génération des fixtures `.txt`

Pour les collaborateurs ayant accès aux PDFs sources :

1. Déposer les PDFs dans `test/fixtures/`.

2. Régénérer les fixtures `.txt` :

    ```bash
    npm run extract-pdf -- --all
    ```

3. Créer un commit avec les `.txt` modifiés si nécessaire.

### Inspection de l'extraction

Le script `extract-pdf` extrait le texte d'un PDF en dehors du navigateur — utile pour le développement et le debugging.

```bash
npm run extract-pdf -- chemin/vers.pdf                # → stdout
npm run extract-pdf -- chemin/vers.pdf --rows         # extraction par lignes
npm run extract-pdf -- chemin/vers.pdf --out fichier.txt
```

## Création/Mise à jour des fichiers data

Pour les aéroports, (conversion IATA -> PAYS)

```bash
npm run makeAirports
```

Depuis 2025, les API précédemment utilisées pour le calcul des données ne sont plus disponibles. Le Code a été mis à jour
pour utiliser dorénavant les taux de chancellerie de la DGFP.
Il n'est donc plus possible de recréer les données des années 2023 et précédentes à l'identique.

Vous pouvez alors créer les data pour l'année 2024 en faisant

```bash
npm run makeData 2024

```

Note: La BNF a supprimé les taux de change pour VUV, BMD, BND, CVE, DJF, DZD, FJD, GMD, JOD, LYD, MUR et TWD en septembre 2021. Pour l'année fiscale 2021, les taux de change de Xe.com sont utilisés pour ces devises.
Pour les années fiscales 2022/2023 c'est l'api github de [fawazahmed0](https://github.com/fawazahmed0/currency-api) qui a été utilisée pour les données manquantes de la BNF.
A partir de 2025 les données de la Direction Générale des Finances sont utilisées car les API utilisées précedemment ne sont plus disponibles.
Si vous créez les fichiers pré 2024, les valeurs seront différentes des fichiers archivés dans ce repository en raison de ces changements.


## Conformité aux conventions de calcul du SNPL

Il a été porté une attention particulière au respect de la méthodologie du SNPL. Retrouvez les tests unitaires du mémento fiscal [ici](https://github.com/flyingeek/flytax/blob/main/test/ep5/memento.test.js).

## Utilisation des fichiers de données dans une autre app

### conversion des codes IATA en code pays

[airports.json](https://flyingeek.github.io/flytax/data/airports.json) est une base compacte de 5779 aéroports. C'est une chaine contenant le code IATA sur 3 lettres, le séparateur ':' et le code pays en 2 lettres. Les villes particulières comme Tokyo ou New-York ont leur propre code: NY et TY.

```javascript
const iata2country = (iata) => {
    const index = airportsData.indexOf(iata + ':');
    return (index >= 0) ? airportsData.substring(index + 4, index + 6): null;
}
```

### Données fiscales

#### CSV / Excel

FLYTAX propose un export des barèmes au format csv et au format tsv.

Les fichiers .tsv peuvent être ouvert directement dans Excel ou être importé comme fichier CSV avec les options d'importation par défaut. L'app Numbers d'Apple lit aussi directement ces fichiers. Excel sur iPad ne sait pas importer les fichiers tsv. Les fichiers 2021 contiennent une colonne suplémentaire indiquant la source utilisée pour les taux de change.

| Année | CSV | TSV | JSON | Aperçu |
| :---: | :---: | :---: | :---: | :---: |
| 2025| [2025.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2025.csv) | [2025.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2025.tsv) | [data2025.json](https://flyingeek.github.io/flytax/data/data2025.json) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2025.tsv) |
| 2024| [2024.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2024.csv) | [2024.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2024.tsv) | [data2024.json](https://flyingeek.github.io/flytax/data/data2024.json) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2024.tsv) |
| 2023| [2023.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2023.csv) | [2023.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2023.tsv) | [data2023.json](https://flyingeek.github.io/flytax/data/data2023b.json) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2023.tsv) |
| 2022| [2022.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2022.csv) | [2022.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2022.tsv) | [data2022.json](https://flyingeek.github.io/flytax/data/data2022.json) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2022.tsv) |
| 2021| [2021.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2021.csv) | [2021.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2021.tsv) | [data2021.json](https://flyingeek.github.io/flytax/data/data2021.json) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2021.tsv) |
| 2020| [2020.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2020.csv) | [2020.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2020.tsv) | [data2020.json](https://flyingeek.github.io/flytax/data/data2020.json) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2020.tsv) |
| 2019| [2019.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2019.csv) | [2019.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2019.tsv) | [data2019.json](https://flyingeek.github.io/flytax/data/data2019.json) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2019.tsv) |
| 2018| [2018.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2018.csv) | [2018.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2018.tsv) | [data2018.json](https://flyingeek.github.io/flytax/data/data2018.json) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2018.tsv) |

Pour le calcul du forfait Euro:

| Année | CSV | TSV | Aperçu | Montant |
| :---: | :---: | :---: | :---: | :---: |
| 2025| [2025-euro.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2025-zone_euro.csv) | [2025-euro.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2025-zone_euro.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2025-zone_euro.tsv) | 176 € |
| 2024| [2024-euro.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2024-zone_euro.csv) | [2024-euro.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2024-zone_euro.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2024-zone_euro.tsv) | 176 € |
| 2023| [2023-euro.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2023-zone_euro.csv) | [2023-euro.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2023-zone_euro.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2023-zone_euro.tsv) | 168 € |
| 2022| [2022-euro.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2022-zone_euro.csv) | [2022-euro.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2022-zone_euro.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2022-zone_euro.tsv) | 161 € |
| 2021| [2021-euro.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2021-zone_euro.csv) | [2021-euro.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2021-zone_euro.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2021-zone_euro.tsv) | 159 € |
| 2020| [2020-euro.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2020-zone_euro.csv) | [2020-euro.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2020-zone_euro.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2020-zone_euro.tsv) | 159 € |
| 2019| [2019-euro.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2019-zone_euro.csv) | [2019-euro.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2019-zone_euro.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2019-zone_euro.tsv) | 156 € |

La BNF de dispose plus aujourd'hui de l'historique de taux de change du Litas (LTL) pour pouvoir publier le calcul du forfait euro de 2018. Son montant était de 156 €.

#### JSON

[data2020.json](https://flyingeek.github.io/flytax/data/data2020.json) est un fichier json qui contient 6 propriétés.

```javascript
{
    "countries": /* ....*/,
    "exr": /* ....*/,
    "year": "2020", /* l'année fiscale */
    "zoneForfaitEuro": ["AT","BE","BL","CY", /* ... */], /* liste des pays du forfait zoneEuro */
    "maxForfait10":12652, /* plafond abattement fiscal forfait */
    "urssaf":{"Paris":[68.1,19],"Province":[50.5,19],"DOM":90} /* données pour calcul du forfait Euro */
}
```

#### countries

```javascript
{
    "FR":{
        "n":"FRANCE",
        "z":1,
        "f":1
    },"EE":{
        "n":"ESTONIE",
        "a":[["2006-11-01","EUR","129"]],
        "f":1
    },"EU":{
        "n":"EUROPE (FORFAIT)",
        "a":[["2020-01-01","EUR","156"]]
    },"NY":{
        "n":"NEW-YORK CITY",
        "a":[["2020-09-01","USD","450"],["2020-01-01","USD","320"]]
    },
    /* ... */
}
```

Pour chaque pays, "n" désigne le nom, "z":1 (optionel défini la zone M), "f":1 (optionel défini l'usage du forfait Euro), et "a" (optionel si f est présent) est une liste des indemnités pour ce pays avec la date de début de validité, la monnaie et le montant. Le code pays "EU" contient le montant du forfait euro pour l'année en cours. Pour déterminer si on doit retirer ½ indemnité, if faut vérifier `z == 1`.

Si par ailleurs vous considérerez qu'il faut retirer ½ indemnité à tous les pays de la zone euro, y compris la Lituanie, la Lettonie, l'Estonie, et depuis 2023 la Croatie, alors il faudra vérifier `z == 1 || f == 1`.

#### exr

```javascript
{
    "EUR":["1.0000","1.0000","1.0000"],
    "XAF":["655.9570","655.9570","655.9570"],
    "BMD":["1.2215","1.13720","1.1794",false]
    /* ... */
}
```

contient le code monnaie, le taux au 31/12/19, le taux au 31/12/20, le taux moyen et le dernier champ optionnel indique si le taux provient de la BNF (officiel) ou a été ajouté en manuel (false = non officiel).

Pour déterminer les montants par pays vous pouvez par exemple utiliser:

```javascript
const findAmount = (countryData, isoDate) => {
    const iso = isoDate.substring(0,10);
    for (const [date, currency, amount, official] of countryData.a) {
        if (date.localeCompare(iso) <= 0) {
            return [amount, currency, official!==false];
        }
    }
    /* error handling or just return zero */
    return ["0", "EUR", false];
}
```

Et pour avoir le montant en euros:

```javascript
const findAmountEuros = (countryData, isoDate, exrData) => {
    const [amount, currency] = findAmount(countryData, isoDate);
    const exr = exrData[currency];
    if (exr) {
        const rate = parseFloat(exr[2]);
        const euros = parseFloat((parseFloat(amount) / rate).toFixed(2));
        return euros;
    } else {
        throw new Error(`Taux de change inconnu pour ${currency}`);
    }
};
```

## iPad

Pour afficher le site de dev sur l'iPad, il faut ouvrir les ports de sirv sur l'extérieur. Comme de plus nous
avons besoin du https pour que le ServiceWorker puisse fonctionner, il faut:

- installer des certificats sur le Mac

```sh
# Placez vous dans le répertoire de dev
$ pwd
/Users/eric/Dev/flytax

# génération des certificats
$ openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout localhost-key.pem -out localhost-cert.pem

# il nous faut les utilitaires mkcert et pour Firefox nss
$ brew install mkcert
$ brew install nss

# on installe l'autorité de certification
$ mkcert -install
Sudo password:
The local CA is now installed in the system trust store! ⚡️
The local CA is already installed in the Firefox trust store! 👍

# on signe par l'autorité nos certificats
# (remplacez 192.168.1.103 par l'ip de votre ordinateur de dev)
$ mkcert -key-file localhost-key.pem -cert-file localhost-cert.pem \
localhost 127.0.0.1 0.0.0.0 192.168.1.103

```

- installer le certificat de l'autorité sur l'iPad:

Sur le Mac, ouvrez le trousseau d'accès Système et exportez via Airdrop le certificat nommé mkcert sur l'iPad

Sur l'iPad, accepter le certificat puis Réglages/Général/Gestion des profils: Installer le profil mkcert,
puis Réglages/Informations/Réglage des certificats, activer la confiance pour mkcert

- ensuite il suffit d'utiliser les commandes `npm run start2` ou `npm run dev2`

## Publication du site sur GitHub Pages

`.github/workflows/release.yml` se déclenche automatiquement lorsqu'un tag `release/X.Y.Z` est poussé. Il vérifie la cohérence des versions, lance le build et les tests, déploie le site sur la branche `gh-pages` et crée une release GitHub à partir de l'entrée correspondante du CHANGELOG.

Pour publier une nouvelle version :

1. Mettre à jour la version dans `package.json`.

2. Mettre à jour `package-lock.json` :

   ```bash
   npm install --package-lock-only
   ```

3. Ajouter une nouvelle entrée en haut de `CHANGELOG.md` au format `## [X.Y.Z] - YYYY-MM-DD`.

4. Créer un commit sur `main` :

   ```bash
   git commit -am "chore: Bump version X.Y.Z"
   ```

5. Tagger et pousser :

   ```bash
   git tag release/X.Y.Z
   git push origin main release/X.Y.Z
   ```

La version de `package.json`, la dernière entrée du CHANGELOG et le tag doivent tous correspondre, sinon le build échoue avec une annotation indiquant la divergence.
