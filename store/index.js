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
			state.hasLogin = true
			state.userInfo = userInfo
		},
		logout(state) {
			state.userInfo = {}
			state.hasLogin = false
			state.baseInfo = {}
			state.hasBase = false
			uni.clearStorage('uni_id_token')
			uni.clearStorage('uni_id_token_expired')
		},
		enter(state, baseInfo) {
			state.hasBase = true
			state.baseInfo = baseInfo
		},
		quit(state) {
			state.baseInfo = {}
			state.hasBase = false
		}
	},
	actions: {
		async getBaseInfo({ commit, state }) {
			const { subscribe } = state.userInfo
			if(subscribe.length) {
				const db = uniCloud.database()
				const { result: { data } } = await db.collection('bases').doc(subscribe[0]).get()
				commit('enter', data[0])
			}
		}
	}
}) 
export default store