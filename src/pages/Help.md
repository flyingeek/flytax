<script>
    import Link from '../components/Link.svelte';
    import { htmlLogo } from '../components/utils';
    const version = "APP_VERSION";
</script>

# {@html htmlLogo} v{version}

La documentation est en cours de rédaction

## Préambule

Cette app a été conçue pour le PilotPad. Elle nécessite des navigateurs récents pour fonctionner: Safari 14 iOS/Mac, Firefox 86, Chrome 87 et Microsoft Edge 87 sont compatibles.
Les PDF utilisés ne transitent sur aucun serveur, tout est calculé localement dans votre navigateur. L'app ne collecte aucune donnée. Tout est __100% SECURE__.

## Objectifs

Calculer rapidement, facilement, et sans partage de données:

- Le décompte des frais de mission conformément à la méthodologie et aux conventions de calcul du SNPL
- Les frais d'emploi des PN qui doivent s'ajouter aux revenus
- Une estimation du montant des nuitées payées par AF
- La différence entre (Frais de Mission - Nuitées - Frais d'emploi) et un abattement de 10% plafonné

## Utilisation / Astuces

- Vous pouvez glisser-déposer un dossier ou des fichiers
- Vous pouvez déposer les PDF indifféremment sur la page Salaire ou la page Frais de mission
- Le symbole ▶ signale des informations additionnelles accessibles soit au survol de la souris, soit en cliquant sur la ligne
- Changer d'année fiscale efface les résultats
- L'application peut être installée sur l'écran d'accueil du PilotPad
- __{@html htmlLogo}__ peut fonctionner en mode déconnecté après avoir effectué un premier calcul

En cas d'anomalie, un pictogramme rouge apparaîtra en haut à droite, le cliquer affichera les détails. Si un message d'erreur apparaissait dans la table des résultats, merci de me contacter.

## Choix de la base

La base peut être modifiée pour chaque mois: on choisit une base, on dépose les EP5 de cette base;
on change de base et on peut déposer les EP5 pour cette nouvelle base. En cas d'erreur il est possible de changer de base et de recharger un EP5.

Le choix de la base se fait au-dessus de la zone de dépôt sur la page Frais de mission.

## Mise à jour

L'app détecte les mises à jour automatiquement, normalement vous n'avez rien à faire. Éventuellement une popup peut
apparaître 👨🏻‍✈️ vous demandant d'autoriser cette mise à jour. Installer la mise à jour efface les résultats.

## Données fiscales

Sur <Link href="https://github.com/flyingeek/flytax">GitHub</Link> ¹vous trouverez les liens vers les barêmes au format .csv et .tsv (Excel/Numbers) mais aussi
les données .json. En installant le code source sur votre ordinateur, vous pourrez en plus générer ces fichiers. Lors
de la compilation de l'application, les api de la Banque de France et des impôts sont utilisées.

## Crédits

- Le mémento fiscal du SNPL et Bernard Pédamon pour son aide sur son interprétation
- Le site est développé en Javascript à l'aide du framework SVELTE
- Éric Delord CDB 777 est l'auteur. Le code source est disponible sur <Link href="https://github.com/flyingeek/flytax">GitHub</Link> ¹

Vous pouvez me joindre sur l'email AF (erdelord@...) ou mon compte twitter @flyingeek.

<small>1: Code source disponible à la fin de la version beta</small>
