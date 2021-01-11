<script>
    import FlagSignifier from '../components/FlagSignifier.svelte';
    import Link from '../components/Link.svelte';
    import {htmlLogo, Deferred} from '../components/utils';
    const fontObserver = (document.fonts) ? document.fonts.load("3em Abril Fatface") : (new Deferred()).resolve(true);
    import { fly } from 'svelte/transition';
    import { viewLog } from '../stores';
</script>

<main>
    <div class="blockquote-wrapper">
        <div class="logo">{@html htmlLogo}</div>
        {#await fontObserver then value}
        <div class="blockquote" in:fly={{ x: ($viewLog) ? 0 : 600, duration: ($viewLog) ? 0 : 1000 }}>
            <h1>
                Simplifier <span style="color:var(--blueaf)">les impôts des pilotes</span> en respectant <span style="color:var(--blueaf)">la confidentialité.</span>
            </h1>
            <h4>&mdash;@flyingeek<br><em>pilote de ligne</em></h4>
        </div>
        {/await}
    </div>

    <section>
        <FlagSignifier title="Un outil simple et rapide">
            <svg slot="icon" width="47px" height="47px" viewBox="0 0 512 512">
                <rect x="27.689" y="181" width="58.8" height="30"/>
                <rect x="27.689" y="301" width="58.8" height="30"/>
                <rect y="241" width="86.49" height="30"/>
                <path d="M314.244,58.245c-109.042,0-197.755,88.713-197.755,197.755s88.712,197.755,197.755,197.755S512,365.042,512,256
                    S423.287,58.245,314.244,58.245z M314.244,423.755c-92.5,0-167.755-75.255-167.755-167.755S221.744,88.245,314.244,88.245
                    C406.745,88.245,482,163.5,482,256S406.745,423.755,314.244,423.755z"/>
                <polygon points="323.93,263.454 323.93,166.557 293.93,166.557 293.93,279.313 371.238,331.996 388.133,307.205"/>
            </svg>

            <ol slot="content">
                <li>Récupérez vos EP4/EP5 et vos bulletins de salaire sur <Link href="https://www.mypeopledoc.com">MyPeopleDoc</Link></li>
                <li>Choisissez l'année en haut à droite sur <b>{@html htmlLogo}</b></li>
                <li>Déposez vos fichiers dans <a href="#/mission" >Frais de Mission</a>
                    ou dans <a href="#/pay" >Salaire</a></li>
            </ol>

        </FlagSignifier>
        <FlagSignifier title="Une confidentialité préservée">
            <svg slot="icon" width="47px" height="47px" viewBox="0 0 47 47">
                <path d="M34.451,18.851v-7.893C34.451,4.915,29.539,0,23.497,0c-6.04,0-10.952,4.915-10.952,10.958v7.893H7.471V47h32.059V18.851
                H34.451z M18.026,10.958c0-3.023,2.452-5.481,5.47-5.481s5.47,2.458,5.47,5.481v7.893h-10.94V10.958z M21.817,41.934l-10.171-7.216
                l3.188-5.985l7.277,6.119l10.479-10.27l2.761,4.82L21.817,41.934z"/>
            </svg>
            <p slot="content">Inutile de partager son calendrier ou d'envoyer des données sur Internet: <b>{@html htmlLogo}</b> 
                fonctionne directement dans votre navigateur, aucun fichier n'est transmis sur le réseau, aucune donnée n'est collectée. </p>
        </FlagSignifier>
        <FlagSignifier title="Des sources fiables">
            <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
            <div slot="content">
                <p>Chaque année <b>{@html htmlLogo}</b> récupère les données à la source: le montant des indemnités provient du
                    <strong>Ministère de l'Économie</strong>, les taux de change sont ceux de la <strong>Banque de France</strong>,
                    le forfait Euro est calculé en fonction des dernières informations de <strong>l'URSSAF</strong>.</p>
                <p>Le programme en lui même inclus des tests permettant de fiabiliser les résultats 
                    et les erreurs détectées sont clairement affichées. Les exemples du <strong>Mémento fiscal du SNPL</strong>
                    ont été utilisés pour tester et valider les résultats de l'application.</p>
            </div>
        </FlagSignifier>
    </section>
</main>

<style>
    /* For screen > 700px */
    @media all and (min-width: 770px) {
        .blockquote h1 {
            font-size: 3rem;
            line-height: 1.2;
        }
        .blockquote-wrapper {
            flex-wrap: nowrap;
            max-width: 1000px;
            margin-left: auto;
            margin-right: auto;
            justify-content: left;
        }
        .logo {
            margin-right: 30px; /* to emulate column gap*/
            margin-top: 60px;
            margin-left: 40px;
        }
        section {
                padding: 0 40px;
        }
    }
    div.logo {
        font-size: 4em;
        font-weight: 800;
    }
    section {
        margin: 80px auto 0 auto;
        max-width: 1000px;
        text-align: justify;
    }
    section a {
        white-space: nowrap;
    }

    ol {
        list-style: none;
        counter-reset: my-awesome-counter;
        margin: 0;
        padding: 0;
    }
    ol li {
        counter-increment: my-awesome-counter;
        margin-bottom: 0.5rem;
    }
    ol li::before {
        content: counter(my-awesome-counter);
        font-weight: bold;
        font-size: 2rem;
        margin-right: 0.5rem;
        line-height: 2rem;
        position: relative;
        top: 0.3rem;
    }
/* center the blockquote in the page */
:global(.blockquote-wrapper) {
   display: flex;
   flex-wrap: wrap;
   /* column-gap: 30px; */ /* not yes supported by safari */
   padding: 0 20px;
   justify-content: center;
}

/* Blockquote main style */
:global(.blockquote) {
    position: relative;
    /*font-family: 'Barlow Condensed', sans-serif;*/
    max-width: 620px;
    margin: 10px;
    align-self: center;
}

/* Blockquote header */
:global(.blockquote h1) {
    font-family: 'Abril Fatface';
    position: relative; /* for pseudos */
    color: var(--redaf);
    font-size: 2.8rem;
    font-weight: normal;
    line-height: 1;
    margin: 0;
    border: solid 2px;
    border-color: var(--blueaf);
    border-radius:20px;
    padding: 25px;
    text-transform: none;
    text-align: left;
}

/* Blockquote right double quotes */
:global(.blockquote h1:after) {
    content:"";
    position: absolute;
    border: 2px solid var(--blueaf);
    border-radius: 0 50px 0 0;
    width: 60px;
    height: 60px;
    bottom: -62px;
    left: 50px;
    border-bottom: none;
    border-left: none;
    z-index: 3; 

}

:global(.blockquote h1:before) {
    content:"";
    position: absolute;
    width: 80px;
    border: 6px solid var(--background-color);
    bottom: -3px;
    left: 50px;
    z-index: 2;
}

/* Blockquote subheader */
:global(.blockquote h4) {
    position: relative;
    color:var(--blueaf);
    font-size: 1.3rem;
    font-weight: 300;
    line-height: 1.2;
    margin: 0;
    padding-top: 15px;
    z-index: 1;
    margin-left:150px;
    padding-left:12px;
    text-align: left;
}

:global(.blockquote h4:first-letter) {
  margin-left:-12px;
}
</style>
