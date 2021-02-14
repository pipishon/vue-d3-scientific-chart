<template>
  <button @click="onDataChange">Change Data</button>
  <VueD3Chart :data="data"></VueD3Chart>
</template>

<script setup="props" lang="ts">
import { ref } from 'vue'
import VueD3Chart from './components/VueD3Chart.vue'

const data = ref([200, 120, 300])
const onDataChange = () => {
  data.value.push(5)
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
