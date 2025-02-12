# CHANGELOG

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2024-02-11

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
