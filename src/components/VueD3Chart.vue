<template xmlns:svg="http://www.w3.org/1999/html">
  <a href="#" @click="downloadSVG">Download</a>
  <svg
    class="line-chart"
    id="chart"
    :viewBox="viewBox"
  >
    <g class="label label-x">
      <foreignObject
        height="10"
        width="10"
        style="overflow: visible"
        :transform="`translate(${paddingLeft - 35}, 0)`"
        v-html="labelY">
      </foreignObject>
    </g>
    <g class="label label-x">
      <foreignObject
        height="10"
        width="100"
        style="overflow: visible; text-align: right"
        :transform="`translate(${width - paddingLeft - 60}, ${height - paddingBottom + 6})`"
        v-html="labelX">
      </foreignObject>
    </g>
    <g class="main-view" :transform="`translate(${paddingLeft}, ${paddingTop})`">
      <g
         class="axis axis-bottom"
         v-axis="axisDataX"
         :transform="`translate(0, ${height - paddingTop - paddingBottom})`"
      >{{axisDataX.settings}}</g>
      <g
         class="axis axis-left"
         v-axis="axisDataY"
      >{{axisDataY.settings}}</g>

      <g
        v-for="s in series"
        :key="s.id"
      >
        <path v-if="s.type === 'line'" :style="seriesLineStyle(s.styles)" class="line-chart__line" :d="path(s.data)" />
        <template v-if="s.type === 'scatter'">
          <template v-if="s.sign === 'circle'">
            <circle  v-for="point in s.data"
                     :key="point.x"
                     :style="seriesScatterStyle(s.styles)"
                     :r="getWidth(s.styles.width) / 2" :cx="axisDataX.scale(point.x)" :cy="axisDataY.scale(point.y)"></circle>
          </template>
          <template v-if="s.sign === 'square'">
            <rect v-for="point in s.data" :key="point.x"
                   :width="getWidth(s.styles.width)"
                   :height="getWidth(s.styles.width)"
                  :style="seriesScatterStyle(s.styles)"
                  :x="axisDataX.scale(point.x) - getWidth(s.styles.width) / 2"
                  :y="axisDataY.scale(point.y) - getWidth(s.styles.width) / 2">
            </rect>
          </template>
        </template>
      </g>

    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3'
import * as saveSvg from 'save-svg-as-png'
import katex from 'katex'
import { computed, toRefs, ref, onUpdated, onMounted, nextTick, reactive } from 'vue'
export default {

  props: {
    labels: {
      requred: true
    },
    axis: {
      required: true
    },
    series: {
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
    const paddingLeft = ref(60)
    const paddingRight = ref(60)
    const paddingTop = ref(20)
    const paddingBottom = ref(25)

    const { series, width, height, axis, labels } = toRefs(props)

    const getWidth = (width) => {
      return (Number.isInteger(parseInt(width))) ? parseInt(width) * 2 : 2
    }

    const strokeDashArray = {
      solid: 0,
      dash: 4,
      dot: '1, 5',
      dashdot: '5, 5, 1, 5'
    }

    const texConvert = (str) => {
      let tex = ''
      try {
        tex = katex.renderToString(str)
      } catch (e) {
      }
      return tex
    }

    const labelX = computed(() => texConvert(labels.value.x))

    const labelY = computed(() => texConvert(labels.value.y))

    const seriesLineStyle = (styles) => {
      return {
        stroke: styles.color || 'black',
        'stroke-width': styles.width || 1,
        'stroke-dasharray': strokeDashArray[styles.linetype || 'solid']
      }
    }

    const seriesScatterStyle = (styles) => {
      const color = styles.color || 'black'
      return {
        fill: (styles.fill) ? color : 'none',
        stroke: (styles.fill) ? 'none' : color,
        'stroke-width': 1
      }
    }

    const updatePadding = () => {
      const tickHtml = document.querySelectorAll('.axis-left .tick')
      const widths = Array.from(tickHtml, a => a.querySelector('.katex').offsetWidth)
      const maxWidth = widths.reduce((a, b) => (a > b) ? a : b, 0)
      for (const tick of tickHtml) {
        d3.select(tick).select('.katex-foreign').attr('width', maxWidth)
          .attr('y', -8).attr('x', -(maxWidth + 5))
      }
      paddingLeft.value = (maxWidth < 40) ? 40 : maxWidth
    }

    onMounted(() => {
      updatePadding()
    })

    onUpdated(() => {
      nextTick(() => {
        updatePadding()
      })
    })

    // const sortedData = computed(() => [...data.value].sort((a, b) => a.x - b.x))

    const rangeX = computed(() => {
      const widthX = width.value - paddingLeft.value - paddingRight.value
      return [0, widthX]
    })
    const rangeY = computed(() => {
      const heightY = height.value - paddingBottom.value - paddingTop.value
      return [heightY, 0]
    })

    const scaleX = computed(() => {
      return d3.scaleLinear().range(rangeX.value).domain([0, d3.max(series.value, d => {
        return d3.max(d.data, t => t.x)
      })])
    })

    const scaleY = computed(() => {
      return d3.scaleLinear().range(rangeY.value).domain([0, d3.max(series.value, d => {
        return d3.max(d.data, t => t.y)
      })])
    })

    const path = (s) => {
      return d3.line()
        .x(d => scaleX.value(d.x))
        .y(d => scaleY.value(d.y))
        .curve(d3.curveBasis)(s)
    }

    const viewBox = computed(() => {
      return '0 0 500 270'
    })

    const axisDataX = computed(() => {
      return {
        scale: scaleX.value,
        settings: axis.value.x
      }
    })

    const axisDataY = computed(() => {
      return {
        scale: scaleY.value,
        settings: axis.value.y
      }
    })

    const downloadSVG = () => {
      axisDataY.value.exponential = false
    }

    // mainreturn
    return {
      viewBox,
      path,
      downloadSVG,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      axisDataX,
      axisDataY,
      seriesScatterStyle,
      seriesLineStyle,
      getWidth,
      labelX,
      labelY
    }
  },
  directives: {
    axis: {
      mounted (el, binding) {
        const arg = binding.value
        const scale = arg.scale
        const axis = arg.settings

        if (axis.position === 'left') {
          d3.select(el).call(d3.axisLeft(scale)
            .ticks(axis.ticks, '.4~f').tickSize(2))
        }
        if (axis.position === 'bottom') {
          d3.select(el).call(d3.axisBottom(scale)
            .ticks(axis.ticks, '.4~f').tickSize(2))
        }

        const ticksSelector = '.axis.axis-' + axis.position + ' .tick'
        const ticks = el.querySelectorAll(ticksSelector)

        for (const tick of ticks) {
          const self = d3.select(tick)
          const g = self.select('text')
          const value = g.text()
          g.remove()
          let texNotation = value
          if (axis.exponential && parseFloat(value) > 100) {
            const expNotation = parseFloat(value).toExponential()
            texNotation = expNotation.replace('e+',
              '⋅10^{') + '}'
          }
          const mathml = katex.renderToString(texNotation)
          const foreign = self.append('foreignObject').attr('width', 20)
            .attr('height', 20).attr('y', 8).attr('x', -10).attr('class', 'katex-foreign')
          foreign.append('xhtml:div').html(mathml)
        }
      },
      updated (el, binding) {
        const arg = binding.value
        const scale = arg.scale
        const axis = arg.settings

        d3.select('.katex-foreign').remove()
        const ticksSelector = '.axis.axis-' + axis.position + ' .tick'

        d3.selectAll(ticksSelector).remove()
        d3.select('.axis.axis-' + axis.position + '  path').remove()
        if (axis.position === 'left') {
          d3.select(el).call(d3.axisLeft(scale)
            .ticks(axis.ticks, '.4~f').tickSize(2))
        }
        if (axis.position === 'bottom') {
          d3.select(el).call(d3.axisBottom(scale)
            .ticks(axis.ticks, '.4~f').tickSize(2))
        }

        const ticks = el.querySelectorAll(ticksSelector)

        for (const tick of ticks) {
          const self = d3.select(tick)
          const g = self.select('text')
          if (g.empty()) continue
          const value = g.text()
          g.remove()
          let texNotation = value
          if (axis.exponential && parseFloat(value) > 10) {
            const expNotation = parseFloat(value).toExponential()
            texNotation = expNotation.replace('e+',
              '⋅10^{') + '}'
          }
          g.remove()
          const mathml = katex.renderToString(texNotation)
          const foreign = self.append('foreignObject').attr('width', 20)
            .attr('height', 20).attr('y', 8).attr('x', -10).attr('class', 'katex-foreign')
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
  .katex-foreign {
    overflow: visible;
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
  .label {
    font-size: 12px;
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
