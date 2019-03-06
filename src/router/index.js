import Vue from 'vue'
import Router from 'vue-router'
import WBCalculator from '@/components/WBCalculator'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'WBCalculator',
      component: WBCalculator
    }
  ]
})
