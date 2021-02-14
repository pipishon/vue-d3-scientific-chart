import { mount } from '@vue/test-utils'
import VueD3Chart from '@/components/VueD3Chart.vue'
import {ref} from "vue";

const series = [
  {
    data: [
      {
        x: 1,
        y: 1
      },
      {
        x: 100,
        y: 100
      }
    ]
  }
]

const axis = ref({
  x: {
    position: 'bottom',
    exponential: false,
    scale: 'linear',
    size: '14',
    ticks: 10
  },
  y: {
    position: 'bottom',
    exponential: false,
    scale: 'linear',
    size: '14',
    ticks: 10
  }
})

describe('Chart data', () => {
  it('Contains x and y', () => {
    const wrapper = mount(VueD3Chart, {
      props: {
        series,
        axis
      }
    })
    expect(wrapper.props().series[0].data.length > 0).toBeTruthy()
    expect(typeof (wrapper.props().series[0].data[0].x) !== 'undefined').toBeTruthy()
    expect(typeof (wrapper.props().series[0].data[0].y) !== 'undefined').toBeTruthy()
  })

  it('Scale changes after data change', () => {
    const wrapper = mount(VueD3Chart, {
      props: {
        series,
        axis
      }
    })
    const n = 5
    const xVal = wrapper.vm.axisDataX.scale(n)
    const yVal = wrapper.vm.axisDataY.scale(n)
    series[0].data.push({
      x: 200,
      y: 200
    })

    wrapper.setProps({
      series: [...series]
    })

    wrapper.vm.$nextTick(() => {
      expect(xVal !== wrapper.vm.axisDataX.scale(n)).toBeTruthy()
      expect(yVal !== wrapper.vm.axisDataY.scale(n)).toBeTruthy()
    })
  })
})
