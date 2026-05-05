<script>
    import { taxYear, tzConverter } from '../stores';
    import { tzOffset } from '../utilities/dates';
    import { loadedMonths } from '../utilities/payslips';
    import { months, monthsfr } from "./utils";

    export let data = [];
    export let name = "Mois";


    /**
     * Display string for a tax-year month code.
     *
     * @param {string} month - 2-digit tax-year stamp ("00"–"13").
     * @returns {string} 2-digit calendar month ("01"–"12").
     */
    const monthLabel = (month) => {
        switch (month) {
            case "13": return "01";
            case "00": return "12";
            default:   return month;
        }
    };


    /**
     * Whether month `month` is partnered with a straddler boundary in its
     * adjacent months — i.e. a rotation crossing a month boundary has its
     * `<` or `>` half in `month`'s neighbor.
     *
     * @param {Object<string, Array<{isComplete: string}>>} byMonth
     * @param {string} month
     * @returns {boolean}
     */
    const isStraddlerBoundary = (byMonth, month) => {
        const i = parseInt(month, 10);
        const nextMonth = (i + 1).toString().padStart(2, '0');
        const prevMonth = (i - 1).toString().padStart(2, '0');

        return byMonth[nextMonth]?.[0]?.isComplete === '>'
            || byMonth[prevMonth]?.at(-1)?.isComplete === '<';
    };


    /**
     * Slots to display by default when the rotations register is empty.
     * Heuristic based on the base's UTC offset (read from `$tzConverter`
     * in component scope).
     *
     * @returns {Array<string>}
     */
    const defaultEmptySlots = () => {
        const offset = tzOffset($tzConverter);

        if (offset === "+00:00") return months;
        if (offset[0] === '+') return ['00', ...months];

        return [...months, '13'];
    };


    /**
     * The list of month tiles to display, each tagged with whether the
     * month is "optional" or "required".
     *
     * @param {{type: string, items?: Array<object>, isEmpty: () => boolean}} register
     * @returns {Array<[string, boolean]>} Each entry is `[month, isOptional]`.
     */
    const computeRequestedMonths = (register) => {
        const REQUIRED = false;
        const OPTIONAL = true;

        if (register.type !== "rotations") {
            return months.map((month) => [month, REQUIRED]);
        }

        if (register.isEmpty()) {
            return defaultEmptySlots().map((month) => [month, OPTIONAL]);
        }

        // Bucket rotations by their stamped tax-year month for the
        // boundary checks.
        const byMonth = {};
        for (const rot of register.items) {
            (byMonth[rot.taxDate.split('-')[1]] ??= []).push(rot);
        }

        // Slot 00 is always present; slot 13 only if it has data or
        // slot 12 has a trailing `<` half.
        const slots = ['00', ...months];
        if (byMonth['13'] || byMonth['12']?.at(-1)?.isComplete === '<') {
            slots.push('13');
        }

        return slots.map((month) =>
            [month, isStraddlerBoundary(byMonth, month) ? REQUIRED : OPTIONAL]
        );
    };


    /**
     * Build the panel's header text.
     *
     * @param {Array<[string, boolean]>} requested - Output of `computeRequestedMonths`.
     * @returns {string}
     */
    const computeHeader = (requested) => {
        if (!$taxYear) return name;

        if (data.type === "rotations") {
            const prev = (parseInt($taxYear, 10) - 1).toString();
            const next = (parseInt($taxYear, 10) + 1).toString();
            const tail = (requested.length > 13)
                ? `${monthsfr[0]} ${next}`
                : `${monthsfr[11]} ${$taxYear}`;

            return `${name} de ${monthsfr[11]} ${prev} à ${tail}`;
        }

        return `${name} de ${monthsfr[0]} ${$taxYear} à ${monthsfr[11]} ${$taxYear}`;
    };


    // The `($tzConverter, …)` comma-operator pattern ensures `$tzConverter`
    // is a tracked dependency of this reactive block.
    $: requestedMonths = ($tzConverter, computeRequestedMonths(data));
    $: header = computeHeader(requestedMonths);

    // Months populated with at least one entry. Both stores share the
    // same `items` array shape; rotations carry their stamped month on
    // `taxDate` (vs. payslips' `date` for the period month).
    $: monthsLoaded = (data.type === "rotations")
        ? loadedMonths(data.items, (rot) => rot.taxDate)
        : loadedMonths(data.items);
</script>


<div>
    <div>{header}<slot></slot></div>

    <ul>
        {#each requestedMonths as [month, optional]}
            <li
                class:loaded="{monthsLoaded.has(month)}"
                class:optional="{optional === true}"
            >
                {monthLabel(month)}
            </li>
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
        background-color: var(--redaf);
        color: var(--white);
        margin: 2px 5px;
    }

    li.loaded {
        background-color: var(--green) !important;
    }

    li.optional {
        background-color: var(--color); /*orange;*/
    }
</style>
