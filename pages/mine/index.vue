<template>
	<view>			
		<!-- 头部 -->
		<user-info ref="userInfo" @update-user="updateUser" :value="userInfo"></user-info>
			
		<!-- 菜单 -->
		<view class="cu-list menu card-menu margin-top-xl margin-bottom-xl shadow-lg radius" v-if="hasLogin">
			<navigator class="cu-item" :url="`/pages/radar/detail?id=${baseInfo._id}`" v-if="hasBase">
				<view class="content">
					<text class="cuIcon-group text-grey"></text>
					<text class="text-grey">成员列表</text>
				</view>
			</navigator>
			<!-- #ifdef APP-PLUS -->
			<view class="cu-item" @tap="bindWeixin" v-if="!userInfo.wx_openid">
				<button class="cu-btn content">
					<text class="cuIcon-weixin text-green"></text>
					<text class="text-grey">绑定微信</text>
				</button>
			</view>
			<view class="cu-item" @tap="unbindWeixin" v-else>
				<button class="cu-btn content">
					<text class="cuIcon-weixin text-grey"></text>
					<text class="text-grey">解绑微信</text>
				</button>
			</view>
			<!-- #endif -->
			<!-- #ifdef MP-WEIXIN -->
			<view class="cu-item">
				<button class="cu-btn content" open-type="contact">
					<text class="cuIcon-service text-grey"></text>
					<text class="text-grey">联系客服</text>
				</button>
			</view>
			<!-- #endif -->
			<!-- #ifndef H5 -->
			<view class="cu-item">
				<button class="cu-btn content" open-type="feedback">
					<text class="cuIcon-comment text-grey"></text>
					<text class="text-grey">意见反馈</text>
				</button>
			</view>
			<!-- #endif -->
			<view class="cu-item">
				<button class="cu-btn content" @tap="logout">
					<text class="cuIcon-exit text-red"></text>
					<text class="text-red">退出登录</text>
				</button>
			</view>
		</view>
		
		<!-- 登录 -->
		<login ref="login"></login>
	</view>
</template>

<script>
	export default {
		onShow() {
			if(this.$refs.userInfo) {
				this.$refs.userInfo.fetchData()
			}
		},
		methods: {
			logout() {
				this.$refs.login.doLogout()
			},
			bindWeixin() {
				this.$refs.login.bindWeixin()
			},
			unbindWeixin() {
				this.$refs.login.unbindWeixin()
			},
			updateUser() {
				this.$refs.login.updateUser()
			},
			
		}
	}
</script>

<style>

</style>
