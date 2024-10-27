import Vue from 'vue'
import Router from 'vue-router'
import Chat from '@/view/chatbox/index'

Vue.use(Router)

export default new Router({
  mode: 'history', // 使用 HTML5 history 模式（避免 hash #）
  routes: [
    {
      path: '/',
      name: 'Chat',
      component: Chat
    }
  ]
})
