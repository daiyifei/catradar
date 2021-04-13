<template>
	<view>
		<view class="UCenter-bg">
			<image v-if="value.avatar" :src="value.avatar" class="avatar" @tap="updateUser"/>
			<view class="avatar cuIcon-my text-white" v-else></view>
			<view class="text-xl">{{value.nickname}}</view>
			<view class="margin-top-sm" v-if="value.role">
				<text>猫司令</text>
			</view>
			<image src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-6ee74e1a-9337-4754-92e2-f7b377cdd878/39d05c55-569f-4916-8ee3-59a12eeb5e3b.gif" mode="scaleToFill" class="gif-wave"></image>
		  </view>
		  <view class="padding flex text-center text-grey bg-white shadow-warp">
		    <view class="flex flex-sub flex-direction solid-right" @tap="toDetail('comments')">
		      <view class="text-xxl text-green">{{commentTotal}}</view>
		      <view class="margin-top-sm">
		        <text class="cuIcon-commentfill"></text>
						<text class="margin-left-xs">评论</text>
					</view>
		    </view>
				<view class="flex flex-sub flex-direction solid-right" @tap="toDetail('favs')">
				  <view class="text-xxl text-blue">{{favTotal}}</view>
				  <view class="margin-top-sm">
				    <text class="cuIcon-favorfill"></text>
						<text class="margin-left-xs">收藏</text>
					</view>
				</view>
				<view class="flex flex-sub flex-direction" @tap="toDetail('adopted')">
				  <view class="text-xxl text-orange">{{adoptedTotal}}</view>
				  <view class="margin-top-sm">
				    <text class="cuIcon-crownfill"></text>
						<text class="margin-left-xs">领养</text>
					</view>
				</view>
		  </view>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		name:"user-info",
		props: {
			value: Object
		},
		watch: {
			value: {
				handler(val) {
					this.fetchData()
				},
				deep: true,
				immediate: true
			}
		},
		data() {
			return {
				commentTotal: 0,
				favTotal: 0,
				adoptedTotal: 0
			};
		},
		methods: {
			async fetchData() {
				if(!this.hasLogin) {
					this.commentTotal = 0
					this.favTotal = 0
					this.adoptedTotal = 0
					return
				}
				
				const { _id, favs = [] } = this.value
				const { result: { total: commentTotal } } = await db.collection('comments').where({
					uid: _id
				}).count()
				const favTotal = favs.length
				const { result: { total: adoptedTotal } } = await db.collection('list').where({
					state: 2,
					uid: _id
				}).count()
				
				// 数字动画
				const that = this
				let i = 0
				numAni()
				function numAni() {
					if (i < 20) {
						setTimeout(() => {
							that.commentTotal = i
							that.favTotal = i
							that.adoptedTotal = i
							i++
							numAni()
						}, 20)
					} else {
						that.commentTotal = commentTotal
						that.favTotal = favTotal
						that.adoptedTotal = adoptedTotal
					}
				}
			},
			updateUser() {
				this.$emit('updateUser')
			},
			toDetail(url) {
				if(!this.hasLogin) {
					this.$u.toast('请先登录')
					return
				}
				uni.navigateTo({
					url: url + '?uid=' + this.value._id
				})
			}
		}
	}
</script>

<style>
.UCenter-bg {
	position: relative;
  background-image: url(https://image.weilanwl.com/color2.0/index.jpg);
  background-size: cover;
  height: 550rpx;
  display: flex;
  justify-content: center;
  padding-top: 40rpx;
  overflow: hidden;
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
</style>
