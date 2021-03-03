import Vue from "vue"
import Vuex from "vuex"
Vue.use(Vuex)

const store = new Vuex.Store({  
	state: {  
		hasLogin: false,
		userInfo: {}
	},  
	mutations: {  
		login(state, userInfo) {
			state.hasLogin = true
			state.userInfo = userInfo
		},
		logout(state) {
			state.userInfo = {}
			state.hasLogin = false
		}
	},
}) 
export default store