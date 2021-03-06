<script>
    import Link from '../components/Link.svelte';
    import { htmlLogo } from '../components/utils';
    const ofp2map = 'https://flyingeek.github.io/lido-online/index.html' + ((navigator.standalone === true) ? '#/install': '');
</script>

## Préambule

Cette application a été conçue pour le PilotPad. Elle nécessite des navigateurs récents pour fonctionner&#8239;: Safari iOS13+/ Mac(Mojave/Catalina/Big Sur), Firefox 86, Chrome 87 et Microsoft Edge 87 sont compatibles.
Les PDF utilisés ne transitent sur aucun serveur, tout est calculé localement dans votre navigateur. L’app ne collecte aucune donnée. Tout est __100 % SECURE__.

## Objectifs

Calculer rapidement, facilement, et sans partage de données&#8239;:

- le décompte des frais de mission, conformément à la méthodologie et aux conventions de calcul du SNPL
- les frais d’emploi des PN qui doivent s’ajouter aux revenus
- une estimation du montant des nuitées payées par AF
- la différence entre (Frais de Mission - Nuitées - Frais d’emploi) et un abattement de 10 % plafonné

## Utilisation/astuces

- Vous pouvez glisser-déposer un dossier ou des fichiers
- Vous pouvez déposer les PDF indifféremment sur la page Salaire ou la page Frais de mission
- Le symbole ▶ signale des informations additionnelles accessibles soit au survol de la souris, soit en cliquant sur la ligne
- Changer d’année fiscale efface les résultats
- L’application peut être installée sur l’écran d’accueil du PilotPad via le menu «&#8239;partage&#8239;» <svg style="width: 1em; display: inline-block; height: 1em; vertical-align: bottom;"><use xlink:href="#share"/></svg> de Safari
- __flytax.fr__ (plus simple à mémoriser et à partager) redirige vers __{@html htmlLogo}__ mais est bloqué sur le réseau AF
- __{@html htmlLogo}__ peut fonctionner en mode déconnecté

En cas d’anomalie, le pictogramme <svg style="width: 1em; display: inline-block; height: 1em; vertical-align: text-top; fill:red"><use xlink:href="#alert"/></svg> apparaîtra en haut à droite, le cliquer affichera les détails. Si un message d’erreur apparaissait dans la table des résultats, merci de me contacter.

__Avertissement&#8239;:__ L’application est une aide au calcul des frais professionels sous licence GPLv3.0, les PN restents seuls responsables face à l’administration pour justifier l’exactitude de leur déclaration.

## Attestation des nuitées AF

Air France fournit cette attestation dans l’EP4 de février de l'année n + 1, mais un correctif est susceptible d’être diffusé jusqu’en avril dans un fichier annexe. En attendant ce document, __{@html htmlLogo}__ estime le montant ce qui permet de donner un ordre de grandeur. L’estimation est modifiable. Une fois votre attestation reçue, vous pouvez soit indiquer son montant directement, soit glisser l’attestation dans la zone de dépôt. Merci pour vos retours concernant la fiabilité de l’estimation.

## Choix de la base

La base peut être modifiée chaque mois&#8239;: on choisit une base, on dépose les EP5 de cette base&#8239;;
on change de base et l’on peut déposer les EP5 pour cette nouvelle base. En cas d’erreur, il est possible de changer de base et de recharger les EP5.

Le choix de la base se fait au-dessus de la zone de dépôt sur la page Frais de mission.

## Mise à jour

__{@html htmlLogo}__ se met à jour automatiquement. Éventuellement, un popup peut
apparaître 👨🏻‍✈️ vous demandant d’autoriser cette mise à jour. Installer la mise à jour efface les résultats.
Si jamais le popup restait à l'écran, il faudrait rafraichir la page ⟳.

## Données fiscales

Sur <Link href="https://github.com/flyingeek/flytax#donn%C3%A9es-fiscales">GitHub</Link> vous trouverez les liens vers les barèmes au format csv et tsv (Excel/Numbers) mais aussi
les données json. En installant le code source sur votre ordinateur, vous pourrez générer ces fichiers. Lors
de la compilation de l’application, les API de la Banque de France et des impôts sont utilisées.

- <Link href="https://www.legifrance.gouv.fr/loda/id/LEGIARTI000042212803">Arrêté de 2006 fixant les taux des indemnités de mission</Link>
- <Link href="http://www.fraispn.com/dlf.html" rel="noopener">La lettre de la DLF sur FraisPN</Link>
- <Link href="http://www.fraispn.com/dlfannexe.html" rel="noopener">L’annexe à lettre de la DLF sur FraisPN</Link>

## Crédits

- <Link href="https://github.com/mborsetti/airportsdata">airportsdata</Link> de Mike Borsetti (permet de lier un code IATA à un pays)
- __{@html htmlLogo}__ est développé en JavaScript à l’aide du framework SVELTE
- Éric Delord, CDB 777, est l’auteur. Le code source est disponible sur <Link href="https://github.com/flyingeek/flytax">GitHub</Link>. L'application est sous <Link href="https://raw.githubusercontent.com/flyingeek/flytax/main/LICENSE.md">licence GPLv3.0</Link>, et l’article 15 précise&#8239;: THERE IS NO WARRANTY FOR THE PROGRAM.

Vous pouvez me contacter sur l’email AF (erdelord@…) ou sur mon compte Twitter @flyingeek.

## Liens

- <Link href="{ofp2map}" rel="noopener">OFP2MAP</Link> cartographie pour l'OFP (même auteur)

Les autres sites traitant des frais réels des PN (par ordre alphabétique):

- <Link href="http://www.cafepn.com" rel="noopener">CaféPN</Link> (payant) (non sécurisé)
- <Link href="http://www.fraispn.com/index.html" rel="noopener">FraisPN</Link> (non sécurisé)
- <Link href="https://myconcorde.fr/" rel="noopener">MyConcorde</Link>
- <Link href="https://nightstop.top/" rel="noopener">NightStop</Link>
