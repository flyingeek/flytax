# <span style="color:#002157">FLY</span><span style="color:#FA3C35">TAX</span>

Une aide au calcul des impôts pour les PNT AF qui ne transfère aucune données sur Internet. L'app calcule notamment les frais réels à partir des EP4/EP5.

Rendez-vous sur [FLYTAX](https://flyingeek.github.io/flytax/) pour utiliser l'app. Mais continuez à lire si vous êtes un développeur ou si vous souhaitez accèder aux données brutes.

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

## Création/Mise à jour des fichiers data

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

## Publication du site sur GitHub Pages

`.github/workflows/main.yml` publie automatiquement sur la branche gh-pages à chaque push sur la branche main.

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

Les fichiers .tsv peuvent être ouvert directement dans Excel ou être importé comme fichier CSV avec les options d'importation par défaut. L'app Numbers d'Apple lit aussi directement ces fichiers.


| Année | CSV | TSV | Aperçu |
| :---: | :---: | :---: | :---: |
| 2020| [2020.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2020.csv) | [2020.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2020.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2020.tsv) |
| 2019| [2019.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2019.csv) | [2019.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2019.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2019.tsv) |
| 2018| [2018.csv](https://flyingeek.github.io/flytax/data/flytax-baremes2018.csv) | [2018.tsv](https://flyingeek.github.io/flytax/data/flytax-baremes2018.tsv) | [voir](https://github.com/flyingeek/flytax/blob/gh-pages/data/flytax-baremes2018.tsv) |

#### JSON

[data2020.json](https://flyingeek.github.io/flytax/data/data2020.json) est un fichier json qui contient 6 propriétés.

```javascript
{
    "countries": /* ....*/,
    "exr": /* ....*/,
    "year": "2020", /* l'année fiscale */
    "zoneForfaitEuro": ["AT","BE","BL","CY", /* ... */] /* liste des pays du forfait zoneEuro
    "maxForfait10":12652, /* plafond abattement fiscal forfait */
    "urssaf":{"Paris":[68.1,19],"Province":[50.5,19],"DOM":90} /* données URSSAF pour calcul du forfait Euro */
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
