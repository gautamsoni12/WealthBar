import Vue from 'vue'
import WBCalculator from '@/components/WBCalculator'

describe('WBCalculator.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(WBCalculator)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.hello h1').textContent)
      .toEqual('Welcome to Your Vue.js App')
  })
  it('calculate the RRSP amount', () => {
    const value = new Vue(WBCalculator).calculate().RRSPAfterTaxFV
    expect(value).equals(161.05)
  })
})
