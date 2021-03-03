<template>
	<view>
		<login></login>
	</view>
</template>

<script>
	let weixinAuthService
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				hasWeixinAuth: false
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
		onLoad() {
			// #ifdef APP-PLUS
			plus.oauth.getServices((services) => {
				weixinAuthService = services.find((service) => {
					return service.id === 'weixin'
				})
				if (weixinAuthService) {
					this.hasWeixinAuth = true
				}
			});
			// #endif	
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
