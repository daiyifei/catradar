<template>
	<view>
		<template v-if="!hasLogin">
			<form @submit="loginByPwd" class="cu-list menu card-menu margin-top-xl margin-bottom-xl shadow-lg radius">
				<view class="cu-form-group">
					<view class="title">用户名</view>
					<input placeholder="请输入用户名" name="username"></input>
				</view>
				<view class="cu-form-group">
					<view class="title">密码</view>
					<input placeholder="请输入密码" name="password" type="password"></input>
				</view>
				<view class="cu-form-group">
					<button form-type="submit" class="cu-btn block bg-blue" style="width: 100%;">登录</button>
				</view>
			</form>
			
			<!-- 微信登录 -->
			<!-- #ifdef APP-PLUS || MP-WEIXIN -->
			<view class="weixin cuIcon-weixin text-green" @tap="loginByWeixin"></view>
			<!-- #endif -->
		</template>
	</view>
</template>

<script>
	let weixinAuthService
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		name: 'login',
		data() {
			return {
				loading: false,
				hasWeixinAuth: false
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
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
			...mapMutations(['login','logout']),
			register(e) {
				this.$request('user-center','register',e.detail.value)
			},
			loginByPwd(e) {
				if(!e.detail.value.username) {
					uni.showToast({
						title: '请输入用户名',
						icon: 'none'
					})
					return
				}
				if(!e.detail.value.username) {
					uni.showToast({
						title: '请输入密码',
						icon: 'none'
					})
					return
				}
				uni.showLoading()
				this.$request('user-center','login',e.detail.value)
					.then(res => {
						uni.setStorageSync('uni_id_token', res.token)
						uni.setStorageSync('uni_id_token_expired', res.tokenExpired)
						this.login(res.userInfo)
						uni.hideLoading()
					})
					.catch(msg => {
						uni.hideLoading()
						uni.showToast({
							title: msg,
							icon: 'none'
						})
					})
			},
			loginByWeixin() {
				uni.showLoading()
				this.getWeixinCode().then((code) => {
					this.$request('user-center','loginByWeixin', {code})
						.then(res => {
							uni.setStorageSync('uni_id_token', res.token)
							uni.setStorageSync('uni_id_token_expired', res.tokenExpired)
							this.login(res.userInfo)
							uni.hideLoading()
						})
						.catch((e) => {
							uni.hideLoading()
							uni.showModal({
								showCancel: false,
								content: '微信登录失败，请稍后再试'
							})
						})
					})
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
			refresh() {
				this.$request('user-center','getUserInfo').then(res => {
					this.login(res.userInfo)
					uni.hideLoading()
				})
			},
			updateUser() {
				// #ifdef APP-PLUS
				uni.login({
				  provider: 'weixin',
				  success: (loginRes) => {
				    // 获取用户信息
				    uni.getUserInfo({
				      provider: 'weixin',
				      success: ({userInfo}) => {
								const { nickName, avatarUrl, gender } = userInfo
								this.$request('user-center','updateUser', {
									nickname: nickName,
									avatar: avatarUrl,
									gender
								}).then(res => {
									uni.showToast({
										title: '头像昵称已同步',
										icon: 'none'
									})
									this.refresh()
								})
				      }
				    })
				  }
				});
				// #endif
			},
			doLogout() {
				uni.showModal({
					content: '确定要退出登录吗？',
					showCancel: true,
					success: res => {
						if(res.confirm) {
							uni.showLoading()
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
	.weixin {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: 50rpx;
		width: 100rpx;
		height: 100rpx;
		line-height: 90rpx;
		text-align: center;
		font-size: 50rpx;
		background-color: #fff;
		border-radius: 50%;
		border: 1px solid #eee;
	}
</style>
