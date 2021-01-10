<script>
    let props = Object.fromEntries(Object.entries($$props).filter(([k,]) => !k.startsWith('$$')));
    const isExternal = props.href && !props.href.startsWith('#');
    if (isExternal) {
        props = Object.assign({rel: "noreferrer", target: "_blank"}, props);
    }
</script>
<!-- svelte-ignore a11y-missing-attribute -->
<a {...props}><slot></slot></a>