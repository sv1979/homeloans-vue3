import { createRouter, createWebHistory } from 'vue-router'
// import App from '../App.vue'
import Calculator from '../components/steps/_calculator.vue'

const router = createRouter({
  history: createWebHistory(), 
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: App,
    //   // redirect: '/calculator'
    // },
    {
      path: '/calculator',
      name: 'calculator',
      component: Calculator
    },
    // {
    //   path: '/authors',
    //   name: 'authors',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AuthorsView.vue')
    // },
    // { path: '/post/:id', name: 'post', component: PostView },
    // { path: '/author/:username', name: 'author', component: AuthorView }
  ]
})

export default router
