<template>
	<view>
		<cu-custom bgColor="bg-gradual-blue">
			<block slot="content">我的</block>
		</cu-custom>
		<login @login="onLogin" v-if="!userInfo"></login>
		<view class="user-info" v-else>
			<view class="bg-white text-center">
				<view class="solid-bottom text-xsl padding">
					<text class="cuIcon-my text-gray"></text>
				</view>
				<view class="padding">{{userInfo.username}}</view>
			</view>
			<button class="cu-btn block bg-red margin lg" :loading="loading" @click="logout">退出</button>
		</view>
	</view>
</template>

<script>
	import login from '@/components/login.vue'
	export default {
		components: {
			login
		},
		data() {
			return {
				loading: false,
				logged: false,
				userInfo: false
			}
		},
		mounted() {
			const expired = uni.getStorageSync('uni_id_token_expired')
			if(expired && expired > new Date().getTime()) {
				this.userInfo = uni.getStorageSync('userInfo')
			}
		},
		methods: {
			logout() {
				uni.showModal({
					content: '确定要退出登录吗？',
					showCancel: true,
					success: (res) => {
						if(res.confirm) {
							this.loading = true
							this.$request('user-center','logout').then(res => {
								uni.clearStorageSync('uniIdToken')
								uni.clearStorageSync('uni_id_token_expired')
								uni.clearStorageSync('userInfo')
								this.loading = false
								this.userInfo = null
							})
						}
					}
				})
			},
			onLogin(res) {
				this.userInfo = res
				this.loading = false
			}
		}
	}
</script>

<style>

</style>
