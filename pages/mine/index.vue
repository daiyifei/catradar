<template>
	<view>		
		<!-- 头部 -->
		<view class="UCenter-bg" @tap="updateUser">
			<image v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar"/>
			<view class="avatar cuIcon-my text-white" v-else></view>
			<view class="text-xl">{{hasLogin?userInfo.nickname:'请登录'}}</view>
			<view class="margin-top-sm" v-if="userInfo.scope===9">
				<text>管理员</text>
			</view>
			<image src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-6ee74e1a-9337-4754-92e2-f7b377cdd878/39d05c55-569f-4916-8ee3-59a12eeb5e3b.gif" mode="scaleToFill" class="gif-wave"></image>
		  </view>
		  <view class="padding flex text-center text-grey bg-white shadow-warp">
		    <view class="flex flex-sub flex-direction solid-right">
		      <view class="text-xxl text-orange">{{visitTotal}}</view>
		      <view class="margin-top-sm">
		        <text class="cuIcon-attentionfill"></text>
						<text class="margin-left-xs">浏览</text>
					</view>
		    </view>
		    <view class="flex flex-sub flex-direction solid-right">
		      <view class="text-xxl text-blue">{{starCount}}</view>
		      <view class="margin-top-sm">
		        <text class="cuIcon-favorfill"></text>
						<text class="margin-left-xs">收藏</text>
					</view>
		    </view>
		    <view class="flex flex-sub flex-direction">
		      <view class="text-xxl text-green">{{forksCount}}</view>
		      <view class="margin-top-sm">
		        <text class="cuIcon-fork"></text>
						<text class="margin-left-xs">发布</text>
					</view>
		    </view>
		  </view>
			
			<!-- 菜单 -->
			<view class="cu-list menu card-menu margin-top-xl margin-bottom-xl shadow-lg radius" v-if="hasLogin">
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
				<view class="cu-item">
					<button class="cu-btn content" @tap="logout">
						<text class="cuIcon-exit text-red"></text>
						<text class="text-red">退出登录</text>
					</button>
				</view>
			</view>
			
			<login ref="login"></login>
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
				uCenter: {},
				starCount: 0,
				forksCount: 0,
				visitTotal: 0, 
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
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
			}
		}
	}
</script>

<style>
.UCenter-bg {
  background-image: url(https://image.weilanwl.com/color2.0/index.jpg);
  background-size: cover;
  height: 550rpx;
  display: flex;
  justify-content: center;
  padding-top: 40rpx;
  overflow: hidden;
  position: relative;
  flex-direction: column;
  align-items: center;
  color: #fff;
  font-weight: 300;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
}

.UCenter-bg text {
  opacity: 0.8;
}

.UCenter-bg .avatar {
	margin-bottom: 20rpx;
  width: 200rpx;
  height: 200rpx;
	line-height: 200rpx;
	text-align: center;
	font-size: 180rpx;
	border-radius: 50%;
	overflow: hidden;
}

.UCenter-bg .gif-wave{
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  z-index: 99;
  mix-blend-mode: screen;  
  height: 100rpx;   
}

map,.mapBox{
  left: 0;
  z-index: 99;
  mix-blend-mode: screen;  
  height: 100rpx;   
}

map,.mapBox{
  width: 750rpx;
  height: 300rpx;
}
</style>
