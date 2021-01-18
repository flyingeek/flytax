<script>
    import Link from '../components/Link.svelte';
    import { htmlLogo } from '../components/utils';
    const version = "APP_VERSION";
</script>

# {@html htmlLogo} v{version}

La documentation est en cours de rédaction

## Préambule

Cette app a été conçue pour le PilotPad. Elle nécessite des navigateurs récents pour fonctionner. Safari 14 iOS/Mac est compatible, Chrome 87 fonctionne aussi.
Les PDF utilisés ne transitent sur aucun serveur, tout est calculé localement dans votre navigateur. L'app ne collecte aucune donnée. Tout est __100% SECURE__.

L'application est conforme à la méthodologie et aux conventions de calcul du SNPL.

## Utilisation / Astuces

- Il est possible de glisser-déposer un dossier
- Il est possible de déposer les PDF indifféremment sur la page Salaire ou la page Frais de mission
- L'application peut être installée sur l'écran d'accueil du PilotPad
- L'application peut fonctionner sans être connecté à Internet

## Alertes

En cas d'anomalie, un pictogramme rouge apparaîtra en haut à droite. En le cliquant, une fenêtre affichera le détails des messages, il est possible
de fermer la fenêtre ou d'effacer les messages.

Il est également possible de voir un message d'erreur dans le tableau des résultats. Dans ce cas, les montants concernés seraient forcés à zéro.
Si cela vous arrivait merci de prendre contact avec moi.

## Fonctionnement du choix de la base

La base peut être modifiée pour chaque mois: on choisit une base, on dépose les EP5 de pour cette base;
on change de base et on peut déposer les EP5 pour cette nouvelle base.

Le choix de la base se fait au dessus de la zone de dépôt sur la page Frais de mission.

En cas d'erreur il est possible de changer de base et de recharger une EP5.

A terme la détection de base pourra être automatisée mais j'ai besoin du code de la base d'affection présent sur vos EP4/EP5.

## Mise à jour

L'app détecte les mises à jour automatiquement, normalement vous n'avez rien à faire. Eventuellement un prompt peut
apparaitre vous demandant d'autoriser cette mise à jour.

## Crédits

- Le mémento fiscal du SNPL et Bernard Pédamon pour son aide sur son interprétation
- Le site est développé en javascript à l'aide du framework SVELTE
- Eric Delord CDB 777 est l'auteur. Le code source est disponible sur GitHub

Vous pouvez me joindre sur l'email AF (erdelord@...) ou mon compte twitter @flyingeek.
