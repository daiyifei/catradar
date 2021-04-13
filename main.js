import Vue from 'vue'
import App from './App'
import store from './store'
Vue.prototype.$store = store

import uView from 'uview-ui'
Vue.use(uView)

import { mapState, mapMutations, mapActions } from 'vuex'

Vue.mixin({
	computed: mapState(['hasLogin', 'userInfo', 'hasBase', 'baseInfo']),
	methods: {
		...mapMutations(['login','logout','enter','exit']),
		...mapActions(['getBaseInfo'])
	}
})

import radar from './pages/radar/index.vue'
Vue.component('radar', radar)

import cats from './pages/list/index.vue'
Vue.component('cats', cats)

import mine from './pages/mine/index.vue'
Vue.component('mine', mine)

Vue.config.productionTip = false

Vue.prototype.$states = ['流浪中','失踪中','已领养','回喵星']
Vue.prototype.$colors = ['三花', '橘猫', '奶牛', '白猫', '狸花', '玳瑁', '黑猫', '其他']

import moment from 'moment'

Vue.filter('state', function (value) {
	if (value === undefined) return '未知'
	return Vue.prototype.$states[value]
})

Vue.filter('color', function (value) {
  if (value === undefined) return '未知'
  return Vue.prototype.$colors[value]
})

Vue.filter('age', function (birthday, deathDate) {
  if (!birthday) return '年龄不详'
	const year = parseInt(moment(deathDate).diff(birthday, 'year', true))
	const month = moment(deathDate).subtract(year, 'year').diff(birthday, 'month')
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

Vue.prototype.$upload = data => {
	return new Promise(async (resolve, reject) => {
		const list = data instanceof Array ? data : [data]
		await Promise.all(list.map(async (filePath, index) => {
			if(filePath && !~filePath.indexOf('https://')) {
				try{
					const { fileID } = await uniCloud.uploadFile({
						filePath,
						cloudPath: new Date().getTime() + (~filePath.indexOf('.') ? '.' + filePath.split('.').pop() : '.jpg')
					})
					list[index] = fileID
				}catch(e){
					reject(e)
				}
			}
		}))
		resolve(data instanceof Array ? list : list[0])
	})
}

Vue.prototype.$requestMsg = () => {
	// #ifdef MP-WEIXIN
	return new Promise(resolve => {
		uni.requestSubscribeMessage({
			tmplIds: ['73TwwDG5U8hoQT_WCOC85kt7Rr5lr_v8aZb-a9M_hl8','xY6bQVGDtKb7JSHYdBHhV2BvALcKbBG4kWvxEwr2WH8'],
			success: () => {
				resolve()
			}
		})
	})
	// #endif
}

Vue.prototype.$sendMsg = async params => {
	// #ifdef MP-WEIXIN
	const { type, touid, data, page } = params
	// 不发送给自己
	if(touid === store.state.userInfo._id)
		return
	data.push(moment().format('YYYY-MM-DD HH:MM'))
	
	return new Promise((resolve, reject) => {
		Vue.prototype.$request('weixin', 'sendMsg', {
			touid,
			type,
			data,
			page
		}).then(res => {
			resolve(res)
		}).catch(e => {
			console.log(e)
			reject(e)
		})
	})
	// #endif
}

App.mpType = 'app'

const app = new Vue({
	...App,
	 store
})
app.$mount()
