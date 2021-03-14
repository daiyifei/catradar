<script>
	const db = uniCloud.database()
	import Vue from 'vue'
	import { mapState, mapMutations, mapActions } from 'vuex'
	export default {
		onLaunch() {
			this.autoLogin()
			
		},
		onShow: function() {},
		onHide: function() {},
		methods: {
			...mapMutations(['login','logout']),
			...mapActions(['getBaseInfo']),
			async autoLogin() {
				if(!uni.getStorageSync('uni_id_token'))
					return
				try{
					const { token, tokenExpired, userInfo } = await this.$request('user-center','checkToken')
					if(token) {
						uni.setStorage({
							key: 'uni_id_token',
							data: token
						})
						uni.setStorage({
							key: 'uni_id_token',
							data: tokenExpired
						})
					}
					this.login(userInfo)
					this.getBaseInfo()
				}catch(e){
					console.log(e)
					this.logout()
				}
			},
			autoUpdate() {
				// #ifdef APP-PLUS
				plus.runtime.getProperty(plus.runtime.appid, ({
					version
				}) => {
					this.$request('check-update', '', {
						version
					}).then(res => {
						if (res.update) {
							uni.showModal({
								title: '检测到新版本',
								content: res.version + '\n' + res.note,
								confirmText: '立即更新',
								cancelText: '以后再说',
								success: ({ confirm }) => {
									if (confirm) {
										const downloadTask = uni.downloadFile({
											url: res.url,
											success: (res) => {
												if (res.statusCode === 200) {
													plus.nativeUI.closeWaiting()
													plus.runtime.install(res.tempFilePath, {
														force: false
													}, (e) => {
														uni.showToast({
															title: '更新成功',
															icon: 'none',
															duration: 1000
														})
														setTimeout(() => {
															plus.runtime.restart()
														},1000)
													}, (e) => {
														uni.showToast({
															title: e.message,
															icon: 'none'
														})
													})
												}
											}
										})
										plus.nativeUI.showWaiting()
									}
								}
							})
						}
					})
				});
				// #endif
			}
		}
	}
</script>

<style lang="scss">
	/* #ifndef APP-PLUS-NVUE */
	@import "colorui/main.css";
	@import "colorui/icon.css";

	.cu-form-group .title {
		min-width: calc(4em + 15px);
	}
	.gender {
		color: #87CEEB;
	}
	
	.gender.female {
		color: #FFC0CB;
	}
	/* #endif */
</style>
