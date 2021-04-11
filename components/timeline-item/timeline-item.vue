<template>
	<view v-if="item">
		<!-- 内容区域 -->
		<view class="flex padding bg-white solid-bottom item">
			<!-- 头像 -->
			<view>
				<navigator :url="'/pages/list/detail?id='+item.cat_id[0]._id" class="margin-right-sm">
					<image :src="item.cat_id[0].avatar" mode="aspectFill" class="cu-avatar radius"></image>
				</navigator>
			</view>
			<!-- 主体 -->
			<view class="response">
				<view class="fr flex flex-direction align-end">
					<view class="text-sm">{{item.create_date|timeFrom}}</view>
					<!-- 操作按钮 -->
					<view class="margin-top-xs margin-left-xs padding-xs cuIcon-moreandroid bg-gray radius"
						v-if="userInfo.role||userInfo._id==item.uid[0]._id" @tap="showMenu(item._id)">
					</view>
				</view>
				<view class="text-grey text-lg text-bold">{{item.cat_id[0].name}}</view>
				<view class="text-content text-lg" @tap="toDetail">{{item.text}}</view>
				<view class="flex" v-if="item.content_type" @tap="toDetail">
					<video-item :src="item.album[0]" class="basis-lg" @tap.stop />
				</view>
				<view class="grid grid-square margin-top-sm" :class="item.album.length>1?'col-3':'col-2'" @tap="toDetail" v-else>
					<view v-for="(pic,idx) in item.album" :key="idx" @tap.stop.prevent="preview(item.album,idx)">
						<u-lazy-load :image="pic" img-mode="aspectFill" :height="item.album.length>1?'200rpx':'300rpx'" border-radius="6"></u-lazy-load>
					</view>
				</view>
				<!-- 作者信息 -->
				<image :src="item.uid[0].avatar" mode="aspectFill" class="cu-avatar sm round margin-right-xs" />
				<text class="text-gray">{{item.uid[0].nickname}}</text>
				<!-- 留言区域 -->
				<message-board :timeline="item" :list="item.comments" @focus="onFocus" />
			</view>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		name: "timeline-item",
		props: {
			item: Object,
			isLink: Boolean
		},
		methods: {
			onFocus() {
				uni.createSelectorQuery().in(this).select('.item').boundingClientRect(data => {
					this.$emit('focus', data)
				}).exec()
			},
			preview(urls, current) {
				uni.previewImage({
					urls,
					current
				})
			},
			toDetail() {
				if (this.isLink) {
					uni.navigateTo({
						url: '/pages/timeline/detail?id=' + this.item._id
					})
				}
			},
			showMenu() {
				const itemList = ['编辑','删除']
				if (this.item.content_type === 0 && 
					(this.userInfo._id === this.item.cat_id[0].uid || this.userInfo.role)) {
					itemList.push('同步到相册')
				}
				uni.vibrateShort()
				uni.showActionSheet({
					itemList,
					success: ({tapIndex}) => {
						switch (tapIndex) {
							case 0:
								uni.navigateTo({
									url: '/pages/timeline/edit?id=' + this.item._id
								})
								break
							case 1:
								this.$emit('del', this.item._id)
								break
							case 2:
								uni.navigateTo({
									url: `/pages/list/edit?id=${this.item.cat_id[0]._id}&path=${JSON.stringify(this.item.album)}`
								})
								break
							default:
								break
						}
					}
				})
			},
			onShareAppMessage() {
				return this.shareObj
			}
		}
	}
</script>

<style>
</style>
