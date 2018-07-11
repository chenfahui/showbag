import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'showbag',
      component: resolve => require(['../views/showbag'], resolve)
    }
  ]
})
