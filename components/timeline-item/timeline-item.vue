<template>
	<view>
		<!-- 内容区域 -->
		<view class="flex padding bg-white solid-bottom item">
			<!-- 头像 -->
			<view>
				<navigator :url="'/pages/list/detail?id='+item.cat[0]._id" class="margin-right-sm">
					<image :src="item.cat[0].avatar" mode="aspectFill" class="cu-avatar radius"></image>
				</navigator>
			</view>
			<!-- 主体 -->
			<view class="response">
				<view class="fr text-xl flex flex-direction align-end" >
					<view class="text-sm">{{item.create_date|timeFrom}}</view>
					<!-- 操作按钮 -->
					<view class="padding-xs cuIcon-moreandroid text-gray" 
						v-if="userInfo.role||userInfo._id==item.user[0]._id" 
						@tap="showMenu(item._id)">
					</view>
				</view>
				<view class="text-grey text-lg text-bold">{{item.cat[0].name}}</view>
				<view class="text-content text-lg" @tap="toDetail">{{item.text}}</view>
				<view class="grid grid-square col-3 margin-top-sm" @tap="toDetail">
					<view class="bg-img" v-for="(pic,idx) in item.album" :key="idx">
						<image :src="pic" mode="aspectFill" @tap.stop.prevent="preview(item.album, idx)"></image>
					</view>
				</view>
				<!-- 作者信息 -->
				<image :src="item.user[0].avatar" mode="aspectFill" class="cu-avatar sm round margin-right-xs">
				</image>
				<text class="text-gray">{{item.user[0].nickname}}</text>
				<!-- 留言区域 -->
				<message-board :timeline="item" :list="item.comments" @focus="onFocus"></message-board>
			</view>
		</view>

		<!--操作菜单-->
		<u-action-sheet :list="actions" @click="click" v-model="show"></u-action-sheet>
	</view>
</template>

<script>
	const db = uniCloud.database()
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
				},{
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
									await db.collection('timeline').doc(this.item._id).remove()
									await db.collection('comments').where({
										timeline_id: this.item._id
									}).remove()
									uni.$emit('refresh', this.item._id)
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
