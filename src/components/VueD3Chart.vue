<template xmlns:svg="http://www.w3.org/1999/html">
  <a href="#" @click="downloadSVG">Download</a>
  <svg
    class="line-chart"
    id="chart"
    :viewBox="viewBox"
  >
    <g class="main-view" :transform="'translate('+paddingLeft+', 0)'">
      <g class="axis axis-bottom" v-axis="axisDataX"
         :transform="`translate(0, ${height - 20})`" ></g>
      <g class="axis axis-left" :align="axisY.type" v-axis.sync="axisY"></g>
      <path class="line-chart__line" :d="path" />
    </g>
  </svg>
  {{scaleX}}
</template>

<script>
import * as d3 from 'd3'
import * as saveSvg from 'save-svg-as-png'
import katex from 'katex'
import { computed, toRefs, ref, onUpdated, onMounted, nextTick, reactive } from 'vue'
export default {

  props: {
    data: {
      required: true,
      type: Array
    },
    width: {
      default: 500,
      type: Number
    },
    height: {
      default: 270,
      type: Number
    }
  },
  setup (props) {
    const paddingLeft = ref(0)
    const paddingRight = ref(60)
    const updatePadding = () => {
      const tickHtml = document.querySelectorAll('.axis-left .tick')
      const widths = Array.from(tickHtml, a => a.querySelector('.katex').offsetWidth)
      const maxWidth = widths.reduce((a, b) => (a > b) ? a : b, 0)
      for (const tick of tickHtml) {
        d3.select(tick).select('.katex-foreign').attr('width', maxWidth)
          .attr('y', -8).attr('x', -(maxWidth + 5))
      }
      paddingLeft.value = maxWidth + 10
    }

    onMounted(() => {
      updatePadding()
    })

    onUpdated(() => {
      nextTick(() => {
        updatePadding()
      })
    })

    const { data, width, height } = toRefs(props)

    const rangeX = computed(() => {
      const widthX = width.value - paddingLeft.value - paddingRight.value
      return [0, widthX]
    })
    const rangeY = computed(() => {
      const heightY = height.value - 20
      return [heightY, 0]
    })

    const path = computed(() => {
      const x = d3.scaleLinear().range(rangeX.value).domain(d3.extent(data.value, (d, i) => i))
      const y = d3.scaleLinear().range(rangeY.value).range(rangeY.value).domain([0, d3.max(data.value, d => d)])

      return d3.line()
        .x((d, i) => x(i))
        .y(d => y(d))(data.value)
    })

    const viewBox = computed(() => {
      return '0 0 500 270'
    })

    const scaleX = computed(() => {
      return d3.scaleLinear().range(rangeX.value).domain(d3.extent(data.value, (d, i) => i))
    })

    const scaleY = computed(() => {
      return d3.scaleLinear().range(rangeY.value).domain([0, d3.max(data.value, d => d)])
    })

    const axisDataX = ref({
      scale: scaleX.value,
      type: 'bottom',
      exponential: false
    })

    const axisDataY = ref({
      scale: scaleY.value,
      type: 'left',
      exponential: true
    })

    const axisY = computed(() => {
      return axisDataY.value
    })

    const downloadSVG = () => {
      axisDataY.value.exponential = false
    }

    return {
      scaleX,
      viewBox,
      path,
      downloadSVG,
      paddingLeft,
      axisDataX,
      axisY
    } // anything returned here will be available for the rest of the component
  },
  directives: {
    axis: {
      mounted (el, binding) {
        const arg = binding.value
        if (arg.type === 'left') {
          d3.select(el).call(d3.axisLeft(arg.scale)
            .ticks(13, '.4~f').tickSize(2))
        }
        if (arg.type === 'bottom') {
          d3.select(el).call(d3.axisBottom(arg.scale)
            .ticks(13, '.4~f').tickSize(2))
        }

        const ticks = el.querySelectorAll('.tick')

        for (const tick of ticks) {
          const self = d3.select(tick)
          const g = self.select('text')
          const value = g.text()
          let texNotation = value
          if (arg.exponential && parseFloat(value) > 10) {
            const expNotation = parseFloat(value).toExponential()
            texNotation = expNotation.replace('e+',
              '⋅10^{') + '}'
          }
          const mathml = katex.renderToString(texNotation)
          const foreign = self.append('foreignObject').attr('width', 20)
            .attr('height', 20).attr('y', 8).attr('x', -25).attr('class', 'katex-foreign')
          foreign.append('xhtml:div').html(mathml)
        }
      },
      updated (el, binding) {
        const arg = binding.value
        d3.selectAll('.axis.axis-' + binding.value.type + ' .tick').remove()
        d3.select('.axis.axis-' + binding.value.type + '  path').remove()
        if (arg.type === 'left') {
          d3.select(el).call(d3.axisLeft(arg.scale)
            .ticks(10, '.4~f').tickSize(2))
        }
        if (arg.type === 'bottom') {
          d3.select(el).call(d3.axisBottom(arg.scale)
            .ticks(10, '.4~f').tickSize(2))
        }

        const ticks = el.querySelectorAll('.tick')

        for (const tick of ticks) {
          const self = d3.select(tick)
          const g = self.select('text')
          const katexHtml = self.select('.katex-foreign')
          if (g.empty()) continue
          katexHtml.remove()
          const value = g.text()
          let texNotation = value
          if (arg.exponential && parseFloat(value) > 10) {
            const expNotation = parseFloat(value).toExponential()
            texNotation = expNotation.replace('e+',
              '⋅10^{') + '}'
          }
          g.remove()
          const mathml = katex.renderToString(texNotation)
          const foreign = self.append('foreignObject').attr('width', 20)
            .attr('height', 20).attr('y', 8).attr('x', -25).attr('class', 'katex-foreign')
          foreign.append('xhtml:div').html(mathml)
        }
      }
    }
  }
}
</script>

<style>
  .line-chart {
    margin: 25px;
  }
  .line-chart .tick .katex {
    font-size: 11px;
    display: inline-block;
    overflow: visible;
    white-space: nowrap;

  }

  .line-chart__line {
    fill: none;
    stroke: #76BF8A;
    stroke-width: 1px;
  }
  .axis {
    fill: none;
    stroke: black;
    stroke-width: 1px;
  }

/*
  .axis-left {
    transform: translateX(30px);
  }
  .axis-bottom{
    transform: translateY(20px);
  }
*/

</style>
