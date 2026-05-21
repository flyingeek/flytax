<script>
    import Link from '../components/Link.svelte';
    import { htmlLogo } from '../components/utils';
    const ofp2map = 'https://flyingeek.github.io/lido-online/index.html' + ((navigator.standalone === true) ? '#/install': '');
</script>

## Préambule

Cette application a été conçue pour le PilotPad. Elle nécessite des navigateurs récents pour fonctionner&#8239;: Safari iOS13+/ Mac(Mojave/Catalina/Big Sur/Monterey), Firefox 86+, Chrome 87+ et Microsoft Edge 87+ sont compatibles.
Les PDF utilisés ne transitent sur aucun serveur, tout est calculé localement dans votre navigateur. L’app ne collecte aucune donnée. Tout est __100 % SECURE__.

## Objectifs

__L'application ne gère pas l'article 81 A II qui se substitue pour les pilotes à cette méthode de calcul__

Calculer rapidement, facilement, et sans partage de données&#8239;:

- le décompte des frais de mission, conformément à la méthodologie et aux conventions de calcul du SNPL
- les frais d’emploi des PN qui doivent s’ajouter aux revenus
- pour Air&nbsp;France, une estimation du montant des nuitées payées par l’employeur
- la différence entre (Frais de Mission - Frais d’hébergement - Frais d’emploi) et un abattement de 10 % plafonné

__{@html htmlLogo}__ fonctionne pour les PN Air&nbsp;France et Transavia, basés à Paris ou en province (lire au préalable "Choix de la base").

## Utilisation sur l'iPad

Sur MyPeopleDoc, commencez par sélectionner les bulletins de salaire de l'année N, et vos relevés d’activité (EP5 pour Air&nbsp;France, Relevé d’activité rémunérée PV pour Transavia) de décembre N-1 à février N+1. Puis, en cliquant sur téléchargement, vous recevrez un lien par email. Dans votre dossier de téléchargement sur l'iPad, cliquez sur l'archive téléchargée, elle va se décompresser. Ensuite, après avoir vérifié que l'année N est bien sélectionnée en haut à droite de  __{@html htmlLogo}__, deux solutions:

- Soit, vous cliquez dans la zone de la page Frais de Mission ou de la page Salaire, puis vous choisissez le dossier des fichiers décompressés, puis vous cliquez sur "Sélectionner", puis "Tout select." et enfin, "Ouvrir"
- Soit, vous utilisez le mode Slide Over, ou le mode SplitView, avec l'application Fichiers, et vous faites glisser le dossier des fichiers décompressés dans la zone de la page Frais de Mission ou de la page Salaire

Si vous le souhaitez, l’application peut être installée sur l’écran d’accueil du PilotPad via le menu «&#8239;partage&#8239;» <svg style="width: 1em; display: inline-block; height: 1em; vertical-align: bottom;"><use xlink:href="#share"/></svg> de Safari. (comme OFP2MAP).

## Utilisation de manière plus générale

- Les PDF mensuels sont symbolisés par des carrés numérotés. Un PDF manquant est rouge, un PDF optionnel est bleu, un PDF chargé est vert.
- Vous pouvez glisser-déposer un dossier ou des fichiers
- Vous pouvez déposer les PDF indifféremment sur la page Salaire ou la page Frais de mission
- Le symbole ▶ signale des informations additionnelles accessibles soit au survol de la souris, soit en cliquant sur la ligne
- Changer d’année fiscale efface les résultats
- __flytax.fr__ (plus simple à mémoriser et à partager) redirige vers __{@html htmlLogo}__ mais est bloqué sur le réseau AF
- __{@html htmlLogo}__ peut fonctionner en mode déconnecté

En cas d’anomalie, le pictogramme <svg style="width: 1em; display: inline-block; height: 1em; vertical-align: text-top; fill:red"><use xlink:href="#alert"/></svg> apparaîtra en haut à droite, le cliquer affichera les détails. Si un message d’erreur apparaissait dans la table des résultats, merci de me contacter.

- L'alerte "absence d'EP5" (Air&nbsp;France) est normale sur les fichiers EP4-EP5 de régularisation ou les mois sans vols (lire la rubrique "Activités sol/simulateur & QT") — un mois sans vol reste bleu
- L'erreur "fichier non reconnu" est normale pour un PDF ne contenant ni un bulletin de salaire, ni un relevé d’activité (EP5 ou Relevé d’activité rémunérée PV), ni une attestation de nuitées
- En cas de message "Erreur: nuitées > nb de jours", si vous êtes basé en province, assurez-vous d'avoir lu la rubrique "Choix de la base"

__Avertissement&#8239;:__ L’application est une aide au calcul des frais professionels sous licence GPLv3.0, les PN restents seuls responsables face à l’administration pour justifier l’exactitude de leur déclaration.

## Frais d’hébergement

Le champ "Frais d’hébergement" du comparatif correspond au montant total des nuitées d’hôtel payées par l’employeur sur l’année. Il est utilisé pour le calcul des frais réels.

__Air&nbsp;France__ fournit une attestation des nuitées dans l’EP4 de février de l'année N&nbsp;+&nbsp;1, mais un correctif est susceptible d’être diffusé jusqu’en avril dans un fichier annexe.\
En attendant ce document, __{@html htmlLogo}__ estime le montant ce qui permet de donner un ordre de grandeur (basé sur la ligne I.DECOUCHERS F.PRO du bulletin de paie). L’estimation est modifiable.\
Une fois l’attestation reçue, vous pouvez soit indiquer son montant directement, soit glisser l’attestation dans la zone de dépôt. Merci pour vos retours concernant la fiabilité de l’estimation.

__Transavia__ ne fournit pas d’attestation récapitulative, mais publie un barème indiquant le coût d’une nuitée par escale et hôtel. Le total annuel se calcule donc à la main&#8239;: pour chaque escale, multipliez le coût d’une nuitée par le nombre de découchers, puis additionnez l’ensemble. Le montant obtenu doit être saisi manuellement dans le champ "Frais d’hébergement" du comparatif.\
Le récapitulatif des découchers sur la page Frais de Mission liste vos nuitées par escale et facilite ce calcul.

## Choix de la base

La base peut être modifiée chaque mois&#8239;: on choisit une base, on dépose les relevés d’activité (EP5 ou PV) de cette base&#8239;;
on change de base et l’on peut déposer les relevés pour cette nouvelle base. En cas d’erreur, il est possible de changer de base et de recharger les relevés.

Le choix de la base se fait au-dessus de la zone de dépôt sur la page Frais de mission.

## Activités sol/simulateur & QT

Les activités sol/simulateur à la base ne peuvent pas faire l'objet de déduction forfaitaire, elles ne sont donc pas décomptées dans les frais de mission.

Les activités sol/simulateur hors de la base d'affectation pourraient être décomptées forfaitairement, néanmoins elles ne rentrent pas explicitement dans le cadre d'application de l'accord de la DLF, et elles ne sont donc pas décomptées par __{@html htmlLogo}__. Je vous renvoie au mémento du SNPL pour plus d'informations.

## Mise à jour

__{@html htmlLogo}__ se met à jour automatiquement. Éventuellement, un popup peut
apparaître 👨🏻‍✈️ vous demandant d’autoriser cette mise à jour. Installer la mise à jour efface les résultats.
Si jamais le popup restait à l'écran, il faudrait rafraichir la page ⟳.

## Données fiscales

Sur <Link href="https://github.com/flyingeek/flytax#donn%C3%A9es-fiscales">GitHub</Link> vous trouverez les liens vers les barèmes au format csv et tsv (Excel/Numbers) mais aussi
les données json. En installant le code source sur votre ordinateur, vous pourrez générer ces fichiers. Lors
de la compilation de l’application, les API de la Banque de France et des impôts sont utilisées.

- <Link href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000242360">Arrêté de 2006 fixant les taux des indemnités de mission</Link>
- <Link href="https://web.archive.org/web/20190408001531/http://www.fraispn.com/dlf.html" rel="noopener">La lettre de la DLF sur FraisPN (webarchive)</Link>
- <Link href="https://web.archive.org/web/20190407212830/http://www.fraispn.com/dlfannexe.html" rel="noopener">L’annexe à lettre de la DLF sur FraisPN (webarchive)</Link>

Il est plus simple d'utiliser les fichiers compilés sur <Link href="https://github.com/flyingeek/flytax#donn%C3%A9es-fiscales">GitHub</Link> mais voici les ressources utilisées par __{@html htmlLogo}__:

- <Link href="https://www.economie.gouv.fr/dgfip/fichiers_taux_chancellerie/txt/Webpays" rel="noopener">Liste des pays définis par la DGIFP (format texte)</Link>
- <Link href="https://www.economie.gouv.fr/dgfip/fichiers_taux_chancellerie/txt/Webmiss" rel="noopener">Frais de mission par pays (format texte)</Link>
- <Link href="https://www.economie.gouv.fr/dgfip/fichiers_taux_chancellerie/txt/Webtaux" rel="noopener">Taux de chancellerie  (format texte)</Link>

## Crédits

- <Link href="https://github.com/mborsetti/airportsdata">airportsdata</Link> de Mike Borsetti (permet de lier un code IATA à un pays)
- __{@html htmlLogo}__ est développé en JavaScript à l’aide du framework SVELTE
- Éric Delord, CDB 777, est l’auteur. Le code source est disponible sur <Link href="https://github.com/flyingeek/flytax">GitHub</Link>. L'application est sous <Link href="https://raw.githubusercontent.com/flyingeek/flytax/main/LICENSE.md">licence GPLv3.0</Link>, et l’article 15 précise&#8239;: THERE IS NO WARRANTY FOR THE PROGRAM.

Vous pouvez me contacter sur l’email AF (erdelord@…), ou sur mon compte Twitter @flyingeek, ou sur le groupe Teams/MyConcorde. Si vous rencontrez un problème, merci de m'adresser le PDF concerné par mail.

## Liens

- <Link href="{ofp2map}" rel="noopener">OFP2MAP</Link> cartographie pour l'OFP (même auteur)
