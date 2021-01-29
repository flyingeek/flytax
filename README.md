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

## Création/Mise à jour des fichiers data

Pour les aéroports, (conversion IATA -> PAYS)

```bash
npm run makeAirports
```

Pour les données fiscales, il faut obtenir un accès à l'[API de la Banque de France](http://developer.webstat.banque-france.fr)

Ensuite il faut créer un fichier .env contenant cette clé. Pour Gitpod.io il suffit d'ajouter une variable d'environnement nommée BNF_CLIENT_ID dans les settings de Gitpod.

```bash
echo "BNF_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" > .env
```

Vous pouvez alors créer les data pour l'année 2020 en faisant

```bash
npm run makeData 2020

```

## Conformité aux conventions de calcul du SNPL

Il a été porté une attention particulière au respect de la méthodologie du SNPL. Retrouvez les tests unitaires du mémento fiscal [ici](https://github.com/flyingeek/flytax/blob/main/test/ep5/memento.test.js).

## Utilisation des fichiers de données dans une autre app

### conversion des codes IATA en code pays

[airports.json](https://flyingeek.github.io/flytax/data/airports.json) est une base compacte de 5765 aéroports. C'est une chaine contenant le code IATA sur 3 lettres, le séparateur ':' et le code pays en 2 lettres. Les villes particulières comme Tokyo ou New-York ont leur propre code: NY et TY.

```javascript
const iata2country = (iata) => {
    const index = airportsData.indexOf(iata + ':');
    return (index >= 0) ? airportsData.substring(index + 4, index + 6): null;
}
```

### Données fiscales

#### CSV / Excel

FLYTAX propose un export des barèmes au format csv et au format tsv.

Les fichiers .tsv peuvent être ouvert directement dans Excel ou être importé comme fichier CSV avec les options d'importation par défaut. L'app Numbers d'Apple lit aussi directement ces fichiers. Excel sur iPad ne sait pas importer les fichiers tsv.

| Année | CSV | TSV | Aperçu |
| :---: | :---: | :---: | :---: |
| 2020| [2020.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2020.csv) | [2020.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2020.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2020.tsv) |
| 2019| [2019.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2019.csv) | [2019.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2019.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2019.tsv) |
| 2018| [2018.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2018.csv) | [2018.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2018.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2018.tsv) |

Pour le calcul du forfait Euro:

| Année | CSV | TSV | Aperçu | Montant | 
| :---: | :---: | :---: | :---: | :---: |
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

Si par ailleurs vous considérerez qu'il faut retirer ½ indemnité à tous les pays de la zone euro, y compris la Lituanie, la Lettonie et l'Estonie, alors il faudra vérifier `z == 1 || f == 1`.

#### exr

```javascript
{
    "EUR":["1.0000","1.0000","1.0000"],
    "XAF":["655.9570","655.9570","655.9570"],
    /* ... */
}
```

contient le code monnaie, le taux au 31/12/19, le taux au 31/12/20 et le taux moyen.

Pour déterminer les montants par pays vous pouvez par exemple utiliser:

```javascript
const findAmount = (countryData, isoDate) => {
    const iso = isoDate.substring(0,10);
    for (const [date, currency, amount] of countryData.a) {
        if (date.localeCompare(iso) <= 0) {
            return [amount, currency];
        }
    }
    /* error handling or just return zero */
    return ["0", "EUR"];
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

`.github/workflows/main.yml` publie automatiquement sur la branche gh-pages à chaque push sur la branche main.
