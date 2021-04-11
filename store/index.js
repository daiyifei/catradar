import Vue from "vue"
import Vuex from "vuex"
Vue.use(Vuex)

const store = new Vuex.Store({  
	state: {  
		hasLogin: false,
		userInfo: {},
		hasBase: false,
		baseInfo: {}
	},  
	mutations: {  
		login(state, userInfo) {
			userInfo.favs = userInfo.favs || []
			userInfo.subscribes = userInfo.subscribes || []
			state.userInfo = userInfo
			uni.setStorageSync('user_info', userInfo)
			state.hasLogin = true
		},
		logout(state) {
			state.userInfo = {}
			state.hasLogin = false
			state.baseInfo = {}
			state.hasBase = false
			uni.clearStorage()
		},
		enter(state, baseInfo) {
			state.baseInfo = baseInfo
			uni.setStorageSync('base_info', baseInfo)
			state.hasBase = true
		},
		exit(state) {
			state.baseInfo = {}
			state.hasBase = false
			uni.removeStorageSync('base_info')
		}
	}
}) 
export default store