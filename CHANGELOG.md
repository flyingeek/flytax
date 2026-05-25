# CHANGELOG

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] - 2026-05-25

### Fixed

- Parseur PV Transavia : reconnaissance des relevés d'activité dont les cellules d'une ligne sont regroupées dans un même item PDF séparées par des espaces (plutôt qu'un item par cellule). Auparavant ces relevés étaient acceptés silencieusement sans produire aucune rotation ([@clarkewing](https://github.com/clarkewing))
- Parseur bulletins de paie Transavia : tolérance des cellules vides en fin de ligne Mois du tableau récapitulatif (Plafond S.S., Allèg. Cotis. Employeur). Les bulletins concernés ne renvoient plus l'erreur « Net imposable non trouvé ». Les erreurs des lignes Mois et Cumul sont désormais distinguées ([@clarkewing](https://github.com/clarkewing))

## [2.1.1] - 2026-05-21

### Fixed

- Correction de la rubrique « Utilisation sur l'iPad » de l'aide : les relevés d'activité sont à télécharger de décembre N-1 à __janvier__ N+1 (et non février N+1). Le document de février N+1 mentionné précédemment était en réalité l'EP4-EP5 contenant l'attestation des nuitées Air&nbsp;France, désormais référencée séparément ([@clarkewing](https://github.com/clarkewing))

## [2.1.0] - 2026-05-21

### Added

- Parseur Transavia France pour les relevés d'activité rémunérée (PV) : produit des rotations taguées `airline: 'TO'`, avec gestion des activités sol/MEP et des trajets en train (TGV) ([@clarkewing](https://github.com/clarkewing))
- Parseur Transavia France pour les bulletins de paie : extraction du net imposable, du cumul, de la date de paiement, des indemnités repas et IKV, et des remboursements de transports en commun (Navigo / train) ([@clarkewing](https://github.com/clarkewing))
- Ajout de Nantes (NTE) et Lyon (LYS) dans le sélecteur de base ([@clarkewing](https://github.com/clarkewing))
- Prise en compte des codes IATA des principales gares TGV françaises (GPM, GPL, GPE, GST, GNT, GBO, GLI, GLY, GMA, GRN, GTL) pour les mises en place ([@clarkewing](https://github.com/clarkewing))
- Capture de la ligne `REMB.CARTE NAVIGO` sur les bulletins Air France (auparavant ignorée silencieusement) ([@clarkewing](https://github.com/clarkewing))
- Note conditionnelle dans le tableau des salaires indiquant le montant total des remboursements de transports en commun (Navigo / train) lorsque détectés, pour aider à la déclaration aux frais réels ([@clarkewing](https://github.com/clarkewing))
- Rappel automatique pour les pilotes Transavia leur demandant de calculer manuellement leurs frais d'hébergement (Transavia ne fournissant pas d'attestation des nuitées) ([@clarkewing](https://github.com/clarkewing))
- Utilitaire `escapeRegExp` dans `src/utilities/regex.js` ([@clarkewing](https://github.com/clarkewing))

### Changed

- Le champ `transport` des bulletins de paie est désormais scindé en `ikv` (indemnités kilométriques versées par l'employeur) et `transit` (remboursements de transports en commun). Seul `ikv` alimente automatiquement le calcul des « Frais d'emploi » ; `transit` est affiché séparément avec une note explicative ([@clarkewing](https://github.com/clarkewing))
- La colonne « Nuitées AF » du comparatif devient « Frais d'hébergement » ([@clarkewing](https://github.com/clarkewing))
- Le champ « Frais d'hébergement » reste modifiable même lorsque l'attestation des nuitées AF est chargée, pour permettre aux pilotes AF + TO d'ajouter leurs nuitées TO à ce montant ([@clarkewing](https://github.com/clarkewing))
- Les notes de bas de tableau de PayTable sont restructurées en `<ol>` avec un volet `<details>` listant les rubriques prises en compte par compagnie ([@clarkewing](https://github.com/clarkewing))
- Mise en gras du dernier cumul imposable par compagnie (auparavant uniquement décembre, ce qui ne fonctionnait plus en cas de transition entre compagnies en cours d'année) ([@clarkewing](https://github.com/clarkewing))
- Les références à « EP4 / EP5 » sont remplacées par « relevés d'activité » dans l'interface et l'aide, avec mention explicite du nom du document attendu pour chaque compagnie (`EP5` pour AF, `Relevé d'activité rémunérée PV` pour TO) ([@clarkewing](https://github.com/clarkewing))
- Le routeur de parseurs accepte désormais un second flux de texte extrait par lignes (`textByRows`), nécessaire pour les bulletins Transavia dont la mise en page est en colonnes ([@clarkewing](https://github.com/clarkewing))

### Removed

- Suppression de la colonne « Découchers F PRO » du tableau des salaires (la valeur n'était qu'une estimation indirecte des nuitées AF et ne reflétait rien pour Transavia). Le calcul d'estimation reste utilisé pour pré-remplir le champ « Frais d'hébergement » des pilotes AF sans attestation ([@clarkewing](https://github.com/clarkewing))

### Fixed

- Correction d'un décalage d'une heure sur les vols aux abords du changement d'heure (`fr2iso` calculait l'offset UTC à midi, ce qui ne reflète pas l'heure réelle de la journée le 30 mars et le 26 octobre) ([@clarkewing](https://github.com/clarkewing))
- L'export PDF de PayTable préserve désormais la numérotation et les sauts de ligne des notes de bas de tableau (`jsPDF autoTable` aplatissait précédemment la structure `<ol>` en un seul paragraphe illisible) ([@clarkewing](https://github.com/clarkewing))

## [2.0.0] - 2026-05-05

### Added

- Ajout du support multi-compagnies : le modèle de données, la déduplication et l'interface gèrent désormais des documents provenant de compagnies différentes au sein d'une même année fiscale. Seule AF est analysée à ce stade ; les parseurs TO arriveront en version 2.1 ([@clarkewing](https://github.com/clarkewing))
- Prise en charge de plusieurs bulletins de paie sur un même mois (embauche, stagiaire, régularisation, transition entre compagnies), avec déduplication automatique en cas de ré-import ([@clarkewing](https://github.com/clarkewing))
- Affichage de plusieurs bulletins de paie par mois avec une colonne « Compagnie » dans le tableau « Détails des salaires » ([@clarkewing](https://github.com/clarkewing))
- Ajout de la colonne « Compagnie » dans le tableau « Détails des activités » ([@clarkewing](https://github.com/clarkewing))
- Ajout d'un document `CONTRIBUTING.md` pour les contributeurs ([@flyingeek](https://github.com/flyingeek))

### Changed

- Calcul du cumul imposable annuel : somme du cumul du dernier mois présent par compagnie, pour un abattement correct chez les utilisateurs en transition entre compagnies ([@clarkewing](https://github.com/clarkewing))

### Security

- Mise à niveau de `got` à la version 15 ([@clarkewing](https://github.com/clarkewing))
- Mise à jour transitive de la chaîne `workbox-build` → `@rollup/plugin-terser` → `serialize-javascript` (patch des failles REDoS et RCE) ([@clarkewing](https://github.com/clarkewing))
- Vérification automatisée que la version dans `package-lock.json` correspond au tag de release ([@clarkewing](https://github.com/clarkewing))

## [1.4.9] - 2026-04-29

### Changed

- Gel de la version de Node.js à 24 en CI et `.nvmrc` ([@flyingeek](https://github.com/flyingeek))

### Fixed

- Rectification de l'erreur « undefined » lorsqu'il n'était pas possible de lire le Cumul d'une fiche de paie AF ([@clarkewing](https://github.com/clarkewing))

### Security

- Protection contre l'ajout accidentel de fichiers PDF dans le code source ([@flyingeek](https://github.com/flyingeek))

## [1.4.8] - 2026-04-27

### Added

- Extraction PDF par lignes (`getPDFTextByRows`) pour les documents au format tabulaire ([@clarkewing](https://github.com/clarkewing))
- Suite de tests *end-to-end* des parseurs ([@clarkewing](https://github.com/clarkewing))
- Utilitaire CLI `extract-pdf` pour régénérer les fixtures `.txt` depuis les PDF ([@clarkewing](https://github.com/clarkewing))

### Changed

- Modernisation de l'environnement de développement : Jest v30, modernisation CI, refresh `package-lock.json` ([@clarkewing](https://github.com/clarkewing))

### Fixed

- Reconnaissance des EP4 sans EP5 ([@jcricaud](https://github.com/jcricaud))
- Reconnaissance des attestations de nuitées AF 2025 ([@clarkewing](https://github.com/clarkewing))
- Correction des dates du changelog ([@clarkewing](https://github.com/clarkewing))

### Security

- Remplacement de la librairie `rollup-plugin-workbox-inject` abandonnée ([@clarkewing](https://github.com/clarkewing))
- Remplacement de la librairie `md-2-json` abandonnée ([@clarkewing](https://github.com/clarkewing))

## [1.4.7] - 2026-03-12

### Fixed

- Encore une MEP non reconnue dans l'EP5

## [1.4.6] - 2026-03-11

### Changed

- Mise à jour des taux de chancellerie et des données fiscales pour 2025

### Fixed

- Les MEP n'étaient pas reconnues dans l'EP5

## [1.4.5] - 2025-12-22

### Changed

- Mise à jour des aéroports

### Fixed

- Dans le nouveau format, il peut exister des vols à cheval sur deux mois, l'analyseur le prend désormais en compte.

## [1.4.4] - 2025-05-14

### Fixed

- iOS 18.4.1 rendait le mode hors connexion inopérant, mise à jour du service worker.

## [1.4.3] - 2025-04-16

### Fixed

- Corrige le tri des rotations des EP5 en comparant la date de départ mais aussi la date d'arrivée.

## [1.4.2] - 2025-04-09

### Fixed

- Les nouvelles EP5 PNC sont théoriquement reconnues, merci de m'envoyer vos EP5 en cas de soucis.

## [1.4.1] - 2025-02-11

### Added

- Les villes de Vancouver, Toronto, Lomé, Abuja, Lagos et Port Harcourt disposent de leurs propres indemnités

### Changed

- Mise à jour des aéroports
- Les taux de change sont basés sur les taux de chancellerie de la DGF (2024+).

## [1.3.11] - 2024-05-07

### Added

- Base PTP ajoutée mais pas encore testée

## [1.3.10] - 2024-05-03

### Fixed

- Correction du correctif précédent car les deux formats peuvent être présent dans une même feuille de paie

## [1.3.9] - 2024-05-03

### Fixed

- Correctif pour les frais de transport qui peuvent avoir un détail du kilométrage et un taux de remboursement kilométrique dans certains cas

## [1.3.8] - 2024-04-19

### Fixed

- code IATA BUH ajouté
- correctif pour alerte de mise à jour intempestive sous ios17

## [1.3.7] - 2024-02-08

### Fixed

- Changement des indemnités FR et DOM (pour calcul du forfait EU) et du forfait OM; source: article 1 de https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000242360

## [1.3.3] - 2024-02-07

### Changed

- Mise à jour des aéroports
- retrait du warning sur les frais d'emploi en test

## [1.3.2] - 2024-02-05

### Changed

- Mise à jour des données pour les revenus 2023

### Fixed

- accepte les bulletins de paie avec un label DP GN (erreur sur les bulletins de 06/2023)
- En test : prise en compte pour les frais d'emploi des nouveaux libellés (IR EXONEREES, IR NON EXONEREES, IND TRANSPORT EXO)

## [1.2.0] - 2023-01-22

### Changed

- Pour simplifier les mises à jour, à partir de 2022, récupération des taux non donnés par la BNF sur une api github (fawazahmed0) au lieu de les récupérer sur Xe.com.
- Mise à jour des données pour les revenus 2022

## [1.1.4] - 2022-04-17

### Changed

- Suite aux retours, modification du coefficient pour l'estimation des frais de nuitées pour 2021

## [1.1.3] - 2022-04-13

### Changed

- Les autres sites traitant des frais réels PN ont disparu (FraisPN, MyConcorde). NightStop ne fournit plus le calcul et CafePN ne semble pas mis à jour. Dans l'aide, les liens vers la lettre de la DLF passent à présent par Internet Archive.

## [1.1.2] - 2022-01-05

### Changed

- L'aide est complétée avec:
  - une rubrique détaillée pour l'utilisation avec un iPad
  - une rubrique concernant les activités sol/simulateur
  - une explication des alertes courantes
  - le rappel pour les basés en province de lire la rubrique "Choix de la base"

### Added

- Décompte des trajets domicile-travail des rotations ajouté au comparatif

## [1.1.1] - 2022-01-02

### Fixed

- Le CHANGELOG n'apparaissait pas dans la page d'aide en dehors du mode standalone de l'iPad

## [1.1.0] - 2022-01-02

### Added

- Données fiscales 2021 (PLF 2022)
- Nombreuses devises manquantes sur le site de la BNF depuis septembre 2021: ajoût manuel des cours au 31/12/2021 pour VUV, BMD, BND, CVE, DJF, DZD, FJD, GMD, JOD, LYD, MUR, TWD à partir des données de Xe.com.
- indication dans le tableau des INDEMNITÉS PAR PAYS si un taux de change ne provient pas de la BNF

## [1.0.6] - 2021-08-15

### Added

- Ajout d'un thème pour OSX Monterey / iOS 15
- Ajout d'un CHANGELOG

### Fixed

- lien BNF API corrigé dans le README Github
- Si FlyTax est utilisé en mode standalone, le lien vers OFP2MAP renvoie sur la page d'installation

## [1.0.5] - 2021-04-15

### Changed

- Tous les terrains du MANEX sont reconnus désormais

## [1.0.4] - 2021-04-15

### Added

- ajout des boutons PARTAGER et RECHARGER dans l'aide
- ajout d'un fichier de vérification pour l'indexation dans Google

## [1.0.3] - 2021-04-13

### Fixed

- compatible avec les EP5 PNC ayant une mention REGUL

## [1.0.2] - 2021-04-09

### Fixed

- IR.FIN ANNEE DOUBL ajouté aux frais d'emploi

## [1.0.1] - 2021-04-09

### Added

- export de la table zone Euro
- compteur ajouté pour connaître l'usage de l'app

### Fixed

- TLN n'était pas reconnu

## [1.0.0] - 2021-01-29

Lancement de la version 1
