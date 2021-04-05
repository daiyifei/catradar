<template>
	<view>
		<template v-if="!hasLogin">
			<!-- 账号登录 -->
			<!-- #ifndef APP-PLUS || MP-WEIXIN -->
			<form @submit="loginByPwd" class="cu-list menu card-menu margin-xl shadow-lg radius">
				<view class="cu-form-group">
					<view class="title">用户名</view>
					<input placeholder="请输入用户名" name="username" v-model="form.username"></input>
				</view>
				<view class="cu-form-group">
					<view class="title">密码</view>
					<input placeholder="请输入密码" name="password" type="password" v-model="form.password"></input>
				</view>
				<view class="cu-form-group">
					<button form-type="submit" class="cu-btn block bg-blue" style="width: 100%;" :disabled="!form.username||!form.password">登录</button>
				</view>
			</form>
			<!-- #endif -->
			
			<!-- 微信登录 -->
			<!-- #ifdef APP-PLUS || MP-WEIXIN -->
			<button class="margin-xl cu-btn bg-green block lg" @getuserinfo="loginByWeixin" open-type="getUserInfo">
				<text class="cuIcon-weixin margin-right-xs"></text>
				<text>微信登录</text>
			</button>
			<!-- #endif -->
		</template>
	</view>
</template>

<script>
	let weixinAuthService
	export default {
		name: 'login',
		data() {
			return {
				hasWeixinAuth: false,
				form: {
					username: '',
					password: ''
				}
			}
		},
		created() {
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
			register(e) {
				this.$request('user-center','register',e.detail.value)
			},
			loginByPwd() {
				uni.showLoading({
					title: '登录中'
				})
				this.$request('user-center','login', this.form)
					.then(res => {
						uni.setStorageSync('uni_id_token', res.token)
						uni.setStorageSync('uni_id_token_expired', res.tokenExpired)
						this.login(res.userInfo)
						uni.hideLoading()
					})
					.catch(msg => {
						uni.hideLoading()
						this.logout()
						uni.showToast({
							title: msg,
							icon: 'none'
						})
					})
			},
			async loginByWeixin(e) {
				uni.showLoading({
					title: '登录中'
				})
				// #ifdef MP-WEIXIN
				if(!e.detail.userInfo) {
					uni.hideLoading()
					return
				}
				// #endif
				
				try{
					const code = await this.getWeixinCode()
					const { userInfo, token, tokenExpired } = await this.$request('user-center','loginByWeixin', { code })
					uni.setStorageSync('uni_id_token', token)
					uni.setStorageSync('uni_id_token_expired', tokenExpired)
					if(userInfo.nickname && userInfo.avatar) {
						this.login(userInfo)
					}else {
						await this.updateUser()
					}
					uni.hideLoading()
				}catch(msg) {
					uni.hideLoading()
					this.logout()
					uni.showToast({
						title: msg,
						icon: 'none'
					})
				}
			},
			getWeixinCode() {
				return new Promise((resolve, reject) => {
					// #ifdef APP-PLUS
					weixinAuthService.authorize(function(res) {
						resolve(res.code)
					}, function(err) {
						console.log(err)
						reject(new Error('微信登录失败'))
					});
					// #endif
					// #ifdef MP-WEIXIN
					uni.login({
						provider: 'weixin',
						success(res) {
							resolve(res.code)
						},
						fail(err) {
							reject(new Error('微信登录失败'))
						}
					})
					// #endif
				})
			},
			bindWeixin() {
				uni.showLoading()
				this.getWeixinCode().then(code => {
					this.$request('user-center','bindWeixin',{ code }).then(res => {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						this.refresh()
					})
				})
			},
			unbindWeixin() {
				uni.showLoading()
				this.$request('user-center','unbindWeixin').then(res => {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					this.refresh()
				})
			},
			async refresh() {
				const { userInfo } = await this.$request('user-center','getUserInfo')
				this.login(userInfo)
				uni.hideLoading()
			},
			async updateUser() {
				// #ifdef APP-PLUS || MP-WEIXIN
				uni.showLoading()
				const userInfo = await new Promise((resolve,reject) => {
					uni.login({
					  provider: 'weixin',
					  success: res => {
							// 获取用户信息
							uni.getUserInfo({
							  provider: 'weixin',
							  success: ({userInfo}) => {
									resolve(userInfo)
							  },
								fail: err => {
									reject(err)
								}
							})
						},
						fail: err => {
							reject(err)
						}
					})
				})
				const { nickName, avatarUrl, gender } = userInfo
				await	this.$request('user-center','updateUser', {
					nickname: nickName,
					avatar: avatarUrl,
					gender
				})
				await this.refresh()
				uni.showToast({
					title: '用户信息已同步',
					icon: 'none'
				})
				// #endif
			},
			doLogout() {
				uni.showModal({
					content: '确定要退出登录吗？',
					showCancel: true,
					success: res => {
						if(res.confirm) {
							uni.showLoading({
								title: '退出中'
							})
							this.$request('user-center','logout')
								.then(res => {
									this.logout()
									uni.hideLoading()
								})
								.catch(err => {
									this.logout()
									uni.hideLoading()
								})
						}
					}
				})
			}
		}
	}
</script>

<style>
	.btn-bottom {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		margin: 30rpx auto;
	}
	
	.weixin {
		margin-bottom: 10rpx;
		width: 100rpx;
		height: 100rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding-bottom: 10rpx;
		font-size: 50rpx;
		background-color: #fff;
		border-radius: 50%;
		border: 1px solid #eee;
	}
	.weixin::after {
		border: none;
	}
</style>
