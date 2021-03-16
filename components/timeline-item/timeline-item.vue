<template>
	<view>
		<!-- 内容区域 -->
		<view class="flex padding bg-white solid-bottom wrapper">
			<!-- 头像 -->
			<view>
				<navigator :url="'/pages/list/detail?id='+item.cat[0]._id" class="margin-right-sm" v-if="isLink">
					<image :src="item.cat[0].avatar" mode="aspectFill" class="cu-avatar radius"></image>
				</navigator>
			</view>
			<!-- 主体 -->
			<view class="response">
				<!-- 操作按钮 -->
				<view class="margin-top-xs fr cuIcon-moreandroid text-gray text-xxl"
					v-if="userInfo.scope==9||userInfo._id==item.user[0]._id" @tap="showMenu(item._id)">
				</view>
				<view class="text-grey text-lg" v-if="isLink">{{item.cat[0].name}}</view>
				<view class="text-content" @tap="toDetail">{{item.text}}</view>
				<view class="grid grid-square col-3 margin-top-sm" @tap="toDetail">
					<view class="bg-img" v-for="(pic,idx) in item.album" :key="idx">
						<image :src="pic" mode="aspectFill" @tap.stop.prevent="preview(item.album, idx)"></image>
					</view>
				</view>
				<!-- 发布信息区域 -->
				<view class="flex justify-between">
					<view class="text-gray">
						<image :src="item.user[0].avatar" mode="aspectFill" class="cu-avatar sm round margin-right-xs">
						</image>
						<text>{{item.user[0].nickname}} 发布于{{item.create_date|timeFrom}}</text>
					</view>
				</view>

				<!-- 留言区域 -->
				<message-board :timeline="item" :list="item.comments"></message-board>
			</view>
		</view>

		<!--操作菜单-->
		<u-action-sheet :list="actions" @click="click" v-model="show"></u-action-sheet>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		name: "timeline-item",
		props: {
			item: Object,
			isLink: Boolean
		},
		data() {
			return {
				actions: [{
					text: '编辑'
				}, {
					text: '同步到相册'
				}, {
					text: '删除',
					color: 'red'
				}],
				show: false,
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
		methods: {
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
				this.show = true
			},
			click(index) {
				switch(index) {
					case 0:
						uni.navigateTo({
							url: 'edit?id=' + this.item._id
						})
						break
					case 1:
						uni.navigateTo({
							url: `/pages/list/edit?id=${this.item.cat_id}&path=${JSON.stringify(this.item.album)}`
						})
						break
					case 2:
						uni.showModal({
							content: '是否删除这条情报？',
							success: async res => {
								if (res.confirm) {
									await db.collection('timeline').doc(this.id).remove()
									await db.collection('comments').where({
										timeline_id: this.id
									}).remove()
									const index = this.list.findIndex(item => {
										return item._id === this.id
									})
									this.list.splice(index, 1)
									uni.showToast({
										title: '删除成功'
									})
								}
							}
						})
						break
					default:
						break
				}
			}
		}
	}
</script>

<style>
</style>
