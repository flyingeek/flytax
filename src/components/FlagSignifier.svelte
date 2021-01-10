<script>
  export let style = 'large-icon';
  export let title;
</script>

<div class="flag">{#if false}<slot />{/if}
  <div class="flag__signifier" class:flag--large-icon={style === 'large-icon'}>
    <slot name="icon"></slot>
  </div>
  <div class="flag__title">
    <h2>{title}</h2>
  </div>
  <div class="flag__content">
    <slot name="content"></slot>
  </div>
</div>

<style>

:global(.flag + .flag) {
    margin-top: 3rem;
}
:global(.flag) {
    display: grid;
    grid-column-gap: var(--flag-gap, 1em);
    grid-template-columns: auto 1fr;
    grid-template-rows: repeat(3, minmax(min-content, max-content)) 1fr;
    grid-template-areas: "signifier ." "signifier title" "signifier content" ". content";
}
:global(.flag__title) {
    grid-area: title;
    align-self: center;
    display: flex;
    align-items: center;
}
:global(.flag__title:empty) {
  grid-column: 1;
  grid-row: 2;
}
:global(.flag__title:empty:after) {
    content: "x";
    visibility: hidden;
}
:global(.flag__title:empty ~ .flag__content) {
    grid-row-start: 2;
}
:global(.flag__signifier) {
    grid-area: signifier;
    display: flex;
    align-self: center;
}
:global(.flag__content) {
    grid-area: content;
}
:global(.flag--large-icon svg) {
    width: 4rem;
    height: 4rem;
}


/*
.flag--large-title h2 {
  font-size: 2.8rem;
}

.flag--no-title {
  font-size: 1.1rem;
}
.flag--no-title p {
  margin: 0;
}
.flag--large-icon figure {
  font-size: 4rem;
}
figure {
  margin: 0;
}
*/
</style>