<template>
  <button @click="onDataChange">Change Data</button>
  <div style="width: 50%;">
    <VueD3Chart :series="series" :axis="axis"></VueD3Chart>

    <div>
      <h2>Axis config</h2>
      <label>X asix</label>
      <select v-model="axis.x.exponential">
        <option v-for="type in ['normal', 'exp']" :key="type" :value="type === 'exp'">{{ type }}</option>
      </select>
      <input v-model="axis.x.ticks" type="number">
      <label>Y asix</label>
      <select v-model="axis.y.exponential">
        <option v-for="type in ['normal', 'exp']" :key="type" :value="type === 'exp'">{{ type }}</option>
      </select>
      <input v-model="axis.y.ticks" type="number">
    </div>
    <div>
      <h2>Series config</h2>
      <div v-for="s in series" :key="s.name" >
        <input v-model="s.styles.color">
        <input v-model="s.styles.width" type="number">
        <select v-model="s.type">
          <option v-for="type in ['line', 'scatter']" :key="type" :value="type">{{ type }}</option>
        </select>
        <select v-model="s.sign" v-if="s.type === 'scatter'">
          <option v-for="type in ['square', 'circle']" :key="type" :value="type">{{ type }}</option>
        </select>
        <select v-model="s.styles.fill" v-if="s.type === 'scatter'">
          <option v-for="type in ['fill', 'not fill']" :key="type" :value="type === 'fill'">{{ type }}</option>
        </select>
        <select v-model="s.styles.linetype" v-if="s.type === 'line'">
          <option v-for="type in ['solid', 'dash', 'dot', 'dashdot']" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup="props" lang="ts">
import { ref } from 'vue'
import VueD3Chart from './components/VueD3Chart.vue'

const axis = ref({
  x: {
    position: 'bottom',
    exponential: false,
    scale: 'linear',
    size: '14',
    ticks: 10
  },
  y: {
    position: 'left',
    exponential: false,
    scale: 'linear',
    size: '14',
    ticks: 10
  }
})

const randPoint = (x: number) => {
  return {
    x,
    y: Math.random() * 100 * x
  }
}

type ChartSeries = {
  data: Array<{x: number; y: number}>;
  name: string;
  type: string;
  styles: {[key: string]: any};
}

const series = ref(new Array<ChartSeries>())

for (let j = 0; j < 5; j++) {
  const data = Array.from({ length: 10 }, (d, i) => randPoint(i))
  const ser: ChartSeries = {
    name: 'test',
    type: 'line',
    data,
    styles: { } // { color: 'black', width: 1 }
  }
  series.value.push(ser)
}
const onDataChange = () => {
  const seriesData = series.value[0].data
  seriesData.push(randPoint(seriesData.length))
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
