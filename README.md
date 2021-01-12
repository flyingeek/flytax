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

[data2020.csv](https://flyingeek.github.io/flytax/data/data2020.csv) est un fichier csv au format UTF8, séparé par des virgules.
Pour l'utiliser dans Excel, et avoir un formattage correct des données, utilisez Fichier/Importer

Dans l'assistant d'importation, choisir sur le premier écran "Fichier CSV", chargez le fichier csv puis:

- 2ème écran, choisir "Délimité" et dans Origine du fichier, choisir "Unicode (UTF-8)"
- 3ème écran, choisir en délimiteur uniquement la virgule et laisser " comme identificateur de texte
- 4ème écran, vous devez cliquer sur chaque colonne et associer un format. Il faut appliquer **Texte** aux colonnes _Code_, _Pays_, _Monnaie_ et _Zone_. Il faut appliquer **Date JMA** à la colonne _Validité_. Pour finir il est important de cliquer sur le **bouton "Avancé..."** et de choisir le point "." en séparateur de décimale. Vous pouvez à présent cliquer sur le bouton "Fin".

#### JSON

[data2020.json](https://flyingeek.github.io/flytax/data/data2020.json) est un fichier json qui contient 4 propriétés.

```javascript
{
    "countries": /* ....*/,
    "exr": /* ....*/,
    "year": "2020", /* l'année fiscale */
    "zoneForfaitEuro": ["AT","BE","BL","CY", /* ... */] /* liste des pays du forfait zoneEuro
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

Pour chaque pays, "n" désigne le nom, "z":1 (optionel défini la zone M), "f":1 (optionel défini l'usage du forfait Euro), et "a" (optionel si f est présent) est une liste des indemnités pour ce pays avec la date de début de validité, la monnaie et le montant. Le code pays "EU" contient le montant du forfait euro pour l'année en cours. Pour déterminer si on doit retirer ½ indemnité, if faut vérifier `z !== 1`.

Si par ailleurs vous considérerez qu'il faut retirer ½ indemnité à tous les pays de la zone euro, y compris la Lituanie, la Lettonie et l'Estonie, alors il faudra vérifier `z !== 1 && f !== 1`.

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
