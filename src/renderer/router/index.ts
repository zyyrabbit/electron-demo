/*
 * @Description: fun desc of file
 * @Date: 2020-01-06 16:40:56
 * @Author: Lemon
 * @LastEditors  : Lemon
 * @LastEditTime : 2020-01-16 09:32:30
 */
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/renderer/views/login/index.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/renderer/views/home/index.vue')
    },
    {
      path: '/updater',
      name: 'updater',
      component: () => import('@/renderer/views/updater/index.vue')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
