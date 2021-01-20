<script>
    import {months, monthsfr} from "./utils";
    import {taxYear, tzConverter} from '../stores';
    export let data = [];
    export let name = "Mois";
    let nameLabel;
    const label = (month) => {
        switch(month) {
            case "13":
                return "01"
            case "00":
                return "12"
            default:
                return month;
        }
    };
    const computeNameLabel = (requested) => {
        const year = $taxYear;
        if (!year) return name;
        if (data.type==="ep5") {
            const prev = (parseInt(year, 10) -1).toString();
            const next = (parseInt(year, 10) +1).toString();
            return `${name} de ${monthsfr[11]} ${prev} à ${(requested.length>13) ? monthsfr[0] + ' ' + next : monthsfr[11] + ' ' + year}`;
        } else {
            return `${name} de ${monthsfr[0]} ${year} à ${monthsfr[11]} ${year}`;
        }
    }
    const computeRequestedMonths = (dat) => {
        if (dat.type==="ep5") {
            const tz = ($tzConverter)  ? $tzConverter("2020-11-01T00:00Z").slice(-6) : "+01:00";
            let requestedMonthsDefault;
            if (tz === "+00:00") {
                requestedMonthsDefault = months.map(m => [m, true]);
            }else if (tz[0] === '+'){
                requestedMonthsDefault = ['00', ...months].map(m => [m, true]); // TODO this is the only one working in the logic below
            }else {
                requestedMonthsDefault = [...months, '13'].map(m => [m, true]);
            }
            let requested = [];
            if (Object.keys(dat).length === 1) { //key type is always present
                requested = [...requestedMonthsDefault];
            }else{
                for (let i=0; i < 14; i++) {
                    const m = i.toString().padStart(2, '0');
                    const n = (i + 1).toString().padStart(2, '0');
                    const p = (i - 1).toString().padStart(2, '0');
                    if (dat[n]&& dat[n].rots && dat[n].rots.length > 0 && dat[n].rots[0].isComplete===">"){
                        requested.push([m, false]);
                    }else if (dat[p] && dat[p].rots && dat[p].rots.length > 0 && dat[p].rots[dat[p].rots.length - 1].isComplete==="<"){
                        requested.push([m, false]);
                    }else if (i!==13){
                        requested.push([m, true]);
                    }else if (i===13 && dat[m] !== undefined){
                        requested.push([m, true]); 
                    }
                }
            }
            nameLabel = computeNameLabel(requested);
            return requested;
        }else{
            nameLabel = computeNameLabel();
            return months.map(m => [m, false]);
        }
    };
    $: requestedMonths = computeRequestedMonths(data);
</script>
<div>
    <div>{nameLabel}<slot></slot></div>
    <ul>
    {#each requestedMonths as [month, optional]}
    <li class:loaded="{data[month] !== undefined}" class:optional="{optional === true}">{label(month)}</li>
    {/each}
    </ul>
</div>

<style>
    ul {
        display: block;
        margin: 0.5em 0 0 0;
        padding: 0;
    }
    li {
        --size: 2em;
        display: inline-block;
        border-radius: 5px; /*50%;*/
        width: var(--size);
        height: var(--size);
        line-height: var(--size);
        text-align: center;
        background-color:var(--redaf);
        color: var(--white);
        margin: 2px 5px;
    }
    li.loaded {
        background-color: var(--green) !important;
    }
    li.optional {
        background-color: var(--color);/*orange;*/
    }
</style>