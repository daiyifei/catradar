<script>
	const db = uniCloud.database()
	import Vue from 'vue'
	export default {
		async onLaunch() {
			this.checkUpdate()
			this.autoLogin()
		},
		onShow: function() {},
		onHide: function() {},
		watch: {
			hasLogin(val) {
				if(val) {
					this.getBaseInfo()
					this.checkMsg()
				}
			},
			baseInfo(newVal, oldVal) {
				if(newVal && newVal._id !== oldVal._id) {
					this.getBaseInfo()
				}
			}
		},
		methods: {
			async autoLogin() {
				// #ifdef MP-WEIXIN
				try{
					uni.showLoading({
						title: '登录中'
					})
					const code = await new Promise(resolve => {
						uni.login({
							provider: 'weixin',
							success: ({code}) => {
								resolve(code)
							},
							fail: err => {
								this.$u.toast(err)
							}
						})
					})
					const { userInfo, token, tokenExpired } = await this.$request('user-center','loginByWeixin', { code })
					uni.setStorageSync('uni_id_token', token)
					uni.setStorageSync('uni_id_token_expired', tokenExpired)
					if(userInfo.gender) {
						this.login(userInfo)
					}
					uni.hideLoading()
				}catch(e) {
					this.logout()
					uni.showToast({
						title: e,
						icon: 'none'
					})
				}
				// #endif
				
				// #ifndef MP-WEIXIN
				if(!uni.getStorageSync('uni_id_token'))
					return
				try {
					uni.showLoading({
						title: '登录中'
					})
					const { token, tokenExpired, userInfo = {} } = await this.$request('user-center','checkToken')
					if(token) {
						uni.setStorageSync('uni_id_token', token)
						uni.setStorageSync('uni_id_token_expired', tokenExpired)
					}
					this.login(userInfo)
					uni.hideLoading()
				}catch(e){
					console.log(e)
					uni.showToast({
						title: e,
						icon: 'none'
					})
					this.logout()
				}
				// #endif
			},
			async getBaseInfo() {
				if(this.userInfo.base_id) {
					const baseInfo = uni.getStorageSync('base_info') || {}
					this.enter(baseInfo)
					try {
						const { result: { data = {} } } = await db.collection('bases').doc(this.userInfo.base_id).get({
							getOne: true
						})
						this.enter(data)
					}catch(e){
						this.exit()
					}
				}
			},
			checkMsg() {
				db.collection('messages').where(`touids=='${this.userInfo._id}'&&is_read==false`).count().then(res => {
					const { total } = res.result
					if(total > 0) {
						uni.setTabBarBadge({
						  index: 3,
						  text: total + ''
						})
					}
				})
			},
			checkUpdate() {
				// #ifdef MP
				const updateManager = uni.getUpdateManager();
				updateManager.onUpdateReady(function (res) {
				  uni.showModal({
				    title: '更新提示',
				    content: '新版本已经准备好，是否重启应用？',
				    success(res) {
				      if (res.confirm) {
				        updateManager.applyUpdate()
				      }
				    }
				  })
				})
				// #endif
				
				// #ifdef APP-PLUS
				plus.runtime.getProperty(plus.runtime.appid, ({
     0  				}) => {
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
	/* #endif */
	
	.fullscreen {
		width: 100vw;
		height: calc(100vh - var(--window-bottom));
	}
	.cu-form-group .title {
		min-width: calc(4em + 15px);
	}
	.gender {
		color: #87CEEB;
	}
	.gender.female {
		color: #FFC0CB;
	}
	.btn-transparent {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
		background: transparent;
		border: none;
	}
	.btn-transparent::after {
		border: none;
	}
	.btn-float {
		position: fixed;
		right: 0;
		bottom: var(--window-bottom);
		opacity: .9;
		line-height: 80rpx;
	}
	.cu-form-group.required .title::after {
		content: '*';
		display: inline-block;
		margin-left: 6rpx;
		color: #e54d42;
		font-size: 34rpx;
	}
</style>
