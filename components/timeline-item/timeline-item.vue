<template>
	<view>
		<!-- 内容区域 -->
		<view class="text-content" @tap="toDetail">{{item.text}}</view>
		<view class="grid grid-square col-3 margin-top-sm" @tap="toDetail">
			<view class="bg-img" v-for="(pic,idx) in item.album" :key="idx">
				<image :src="pic" mode="aspectFill" @tap.stop.prevent="preview(item.album, idx)"></image>
			</view>
		</view>
		<!-- 发布信息区域 -->
		<view class="margin-top-sm flex justify-between">
			<view class="text-gray">
				<image :src="item.user[0].avatar" mode="aspectFill" class="cu-avatar sm round margin-right-xs"></image>
				<text>{{item.user[0].nickname}} 发布于{{item.create_date|timeFrom}}</text>
			</view>
		</view>
		<!-- 留言区域 -->
		<message-board :timeline-id="item._id" :list="item.comments"></message-board>
	</view>
</template>

<script>
	export default {
		name:"timeline-item",
		props: {
			item: Object,
			isLink: Boolean
		},
		data() {
			return {
				
			};
		},
		methods: {
			preview(urls, current) {
				uni.previewImage({
				  urls,
				  current
				})
			},
			toDetail() {
				if(this.isLink) {
					uni.navigateTo({
						url: '/pages/timeline/detail?id=' + this.item._id
					})
				}
			}
		}
	}
</script>

<style>

</style>
