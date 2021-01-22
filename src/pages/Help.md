<script>
    import Link from '../components/Link.svelte';
    import { htmlLogo } from '../components/utils';
</script>

## Préambule

Cette application a été conçue pour le PilotPad. Elle nécessite des navigateurs récents pour fonctionner&#8239;: Safari 14 iOS/Mac, Firefox 86, Chrome 87 et Microsoft Edge 87 sont compatibles.
Les PDF utilisés ne transitent sur aucun serveur, tout est calculé localement dans votre navigateur. L’app ne collecte aucune donnée. Tout est __100 % SECURE__.

## Objectifs

Calculer rapidement, facilement, et sans partage de données&#8239;:

- Le décompte des frais de mission, conformément à la méthodologie et aux conventions de calcul du SNPL
- Les frais d’emploi des PN qui doivent s’ajouter aux revenus
- Une estimation du montant des nuitées payées par AF
- La différence entre (Frais de Mission - Nuitées - Frais d’emploi) et un abattement de 10 % plafonné

## Utilisation/astuces

- Vous pouvez glisser-déposer un dossier ou des fichiers
- Vous pouvez déposer les PDF indifféremment sur la page Salaire ou la page Frais de mission
- Le symbole ▶ signale des informations additionnelles accessibles soit au survol de la souris, soit en cliquant sur la ligne
- Changer d’année fiscale efface les résultats
- L’application peut être installée sur l’écran d’accueil du PilotPad
- __{@html htmlLogo}__ peut fonctionner en mode déconnecté

En cas d’anomalie, un pictogramme rouge apparaîtra en haut à droite, le cliquer affichera les détails. Si un message d’erreur apparaissait dans la table des résultats, merci de me contacter.

## Attestation des nuitées AF

Air France fournit cette attestation soit dans le pdf de l’EP4 soit dans un fichier annexe. La publication se fait en général au mois de février,
mais un correctif est susceptible d’être diffusé jusqu’en avril. En attendant ce document, __{@html htmlLogo}__ calcule une estimée du montant
ce qui permet de donner un ordre de grandeur. L’estimation est modifiable. Une fois votre attestation reçue, vous pouvez soit indiquer son
montant directement, soit glisser l’attestation dans la zone de dépôt. Merci sur vos retours concernant la fiabilité de l’estimation.

## Choix de la base

La base peut être modifiée pour chaque mois&#8239;: on choisit une base, on dépose les EP5 de cette base&#8239;;
on change de base et l’on peut déposer les EP5 pour cette nouvelle base. En cas d’erreur, il est possible de changer de base et de recharger un EP5.

Le choix de la base se fait au-dessus de la zone de dépôt sur la page Frais de mission.

## Mise à jour

__{@html htmlLogo}__ détecte les mises à jour automatiquement, normalement vous n’avez rien à faire. Éventuellement, un popup peut
apparaître 👨🏻‍✈️ vous demandant d’autoriser cette mise à jour. Installer la mise à jour efface les résultats.

## Données fiscales

Sur <Link href="https://github.com/flyingeek/flytax">GitHub</Link> vous trouverez les liens vers les barèmes au format csv et tsv (Excel/Numbers) mais aussi
les données json. En installant le code source sur votre ordinateur, vous pourrez en plus générer ces fichiers. Lors
de la compilation de l’application, les API de la Banque de France et des impôts sont utilisées.

## Crédits

- Le mémento fiscal du SNPL et Bernard Pédamon pour son aide sur son interprétation
- <Link href="https://github.com/mborsetti/airportsdata">airportsdata</Link> de Mike Borsetti
- __{@html htmlLogo}__ est développé en JavaScript à l’aide du framework SVELTE
- Éric Delord, CDB 777, est l’auteur. Le code source est disponible sur <Link href="https://github.com/flyingeek/flytax">GitHub</Link>

Vous pouvez me contacter sur l’email AF (erdelord@…) ou sur mon compte Twitter @flyingeek.
