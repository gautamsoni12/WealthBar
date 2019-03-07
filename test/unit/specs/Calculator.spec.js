import Vue from 'vue'
import WBCalculator from '@/components/WBCalculator'
import {mount} from '@vue/test-utils'
import { expect } from 'chai'

describe('WBCalculator.vue', () => {
  it('renders a div with class bar', () => {
    const wrapper = mount(WBCalculator)
    wrapper.find('button.calculate').trigger('click')
    expect(wrapper.is('div')).to.equal(true)
    expect(wrapper.classes()).to.contain('bar')
  })
  it('renders 4 list elements inside .parent-ul', () => {
    const wrapper = mount(WBCalculator)
    const listElements = wrapper.find('.parent-ul li')
    expect(listElements.length).to.equal(4)
  })
})
