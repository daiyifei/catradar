import Vue from 'vue'
import App from './App'

import moment from 'moment'

import db from '@/js_sdk/uni-clientDB/index.js'
const dbCmd = db.command

import cuCustom from './colorui/components/cu-custom.vue'
Vue.component('cu-custom', cuCustom)

import radar from './pages/radar/index.vue'
Vue.component('radar', radar)

import cats from './pages/list/index.vue'
Vue.component('cats', cats)

import mine from './pages/mine/index.vue'
Vue.component('mine', mine)

Vue.config.productionTip = false

Vue.filter('age', function (value) {
  if (!value) return '年龄不详'
  return Math.ceil(moment().diff(value, 'year',true)) + '岁'
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
  return ['三花', '橘猫', '奶牛', '白猫', '狸花', '玳瑁'][value]
})

Vue.filter('location', function (value) {
  if (value === undefined) return '未知'
  return Array.from(Array(19),(v,k)=>k+17+'幢')[value]
})

Vue.prototype.$get = (collection,condition = {},limit) => {
	return new Promise((resolve, reject) => {
		let query = typeof(condition)==='string' ?
						db.collection(collection).doc(condition) :
						db.collection(collection).where(condition)
		if(limit) {
			query = query.limit(limit)
		}
		uniCloud.callFunction({
			name: 'uni-clientDB',
			data: {
				command: query.get()
			},
			success({result}) {
				resolve(result)
			},
			fail(err) {
				console.error(err)
				reject(err)
			}
		})
	})
}

Vue.prototype.$request = (name, action, params) => {
	return new Promise((resolve, reject) => {
		uniCloud.callFunction({
			name,
			data: {
				action,
				params
			},
			success({result}) {
				if(result.msg) {
					uni.showToast({
						icon: 'none',
						title: result.msg
					})
					if(result.code === 0) {
						resolve(result)
					}else {
						reject(result.msg)
					}
				}else {
					resolve(result)
				}
			},
			fail(err) {
				reject(err)
			}
		})
	})
}

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
