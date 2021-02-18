<template>
  <div id="app">
    <h3>01-$root</h3>
    <root></root>

    <h3>02-$parent</h3>
    <parent></parent>

    <h3>03-$children</h3>
    <parent01></parent01>

    <h3>04-$ref</h3>
    <parent02></parent02>

    <h3>05-provide&inject</h3>
    <parent03></parent03>

    <h3>06-attrs&listener</h3>
    <parent04></parent04>
  </div>
</template>

<script>
import Root from './components/01-root/01-root'
import Parent from './components/02-parent/01-parent'
import Parent01 from './components/03-children/01-parent'
import Parent02 from './components/04-ref/01-parent'
import Parent03 from './components/05-provide&inject/01-parent'
import Parent04 from './components/06-attrs&listener/01-parent'
export default {
  name: 'App',
  components: {
    Root,
    Parent,
    Parent01,
    Parent02,
    Parent03,
    Parent04
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
