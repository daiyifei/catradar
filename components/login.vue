<template>
	<view>
		<form @submit="login" class="margin">
			<view class="cu-form-group">
				<view class="title">用户名</view>
				<input placeholder="请输入用户名" name="username"></input>
			</view>
			<view class="cu-form-group">
				<view class="title">密码</view>
				<input placeholder="请输入密码" name="password" type="password"></input>
			</view>
			<button form-type="submit" class="cu-btn block bg-blue margin lg" :loading="loading">登录</button>
		</form>
	</view>
</template>

<script>
	export default {
		name: 'login',
		data() {
			return {
				loading: false
			}
		},
		methods: {
			register(e) {
				this.$request('user-center','register',e.detail.value)
			},
			login(e) {
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
				this.loading = true
				this.$request('user-center','login',e.detail.value)
					.then(res => {
						const userInfo = {
							username: res.username
						}
						this.loading = false
						uni.setStorageSync('uniIdToken', res.token)
						uni.setStorageSync('uni_id_token_expired', res.tokenExpired)
						uni.setStorageSync('userInfo', userInfo)
						this.$emit('login',userInfo)
					})
					.catch(() => {
						this.loading = false
					})
			},
			updatePwd() {
				uniCloud.callFunction({
					name: 'user-center',
					data: {
						action: 'updatePwd',
						params: {
							oldPassword: '123456',
							newPassword: '123456',
							password_confirmation: '123456'
						}
					},
					success(res) {
						uni.showModal({
							showCancel: false,
							content: res.result.msg
						})
					},
					fail(e) {
						console.error(e)
						uni.showModal({
							showCancel: false,
							content: '修改失败，请稍后再试'
						})
					}
				})
			},
			resetPwd() {
				uniCloud.callFunction({
					name: 'user-center',
					data: {
						action: 'resetPwd'
					},
					success(res) {
						if (res.result.code === 0) {
							uni.showModal({
								showCancel: false,
								content: '密码已重置为123456'
							})
						} else {
							uni.showModal({
								showCancel: false,
								content: res.result.msg
							})
						}
					},
					fail(e) {
						console.error(e)
						uni.showModal({
							showCancel: false,
							content: '重置失败，请稍后再试'
						})
					}
				})
			}
		}
	}
</script>

<style>

</style>
