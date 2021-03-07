import Vue from 'vue'
import App from './App'
import store from './store'

import moment from 'moment'

import uView from 'uview-ui'
Vue.use(uView)

import radar from './pages/radar/index.vue'
Vue.component('radar', radar)

import cats from './pages/list/index.vue'
Vue.component('cats', cats)

import mine from './pages/mine/index.vue'
Vue.component('mine', mine)

Vue.config.productionTip = false

Vue.filter('age', function (value) {
  if (!value) return '年龄不详'
	const year = parseInt(moment().diff(value, 'year',true))
	const month = moment().subtract(year, 'year').diff(value, 'month')
  return year ? year + '岁' : month + '个月'
})

Vue.filter('female', function (value) {
  if (value === undefined) return '未知'
  return value ? '母' : '公'
})

Vue.filter('neuter', function (value) {
  if (value === undefined) return '未知'
  return value ? '已绝育' : '未绝育'
})

Vue.filter('color', function (value) {
  if (value === undefined) return '未知'
  return ['三花', '橘猫', '奶牛', '白猫', '狸花', '玳瑁', '黑猫'][value]
})

Vue.filter('location', function (value) {
  if (value === undefined) return '未知'
  return Array.from(Array(19),(v,k)=>k+17+'幢')[value]
})

Vue.prototype.$request = (name, action, params) => {
	return new Promise((resolve, reject) => {
		uniCloud.callFunction({
			name,
			data: {
				action,
				params
			},
			success({result}) {
				if(result.code === 0) {
					resolve(result)
				}else {
					reject(result)
				}
			},
			fail(err) {
				reject(err)
			}
		})
	})
}

Vue.prototype.$store = store

App.mpType = 'app'

const app = new Vue({
	...App,
	 store
})
app.$mount()
