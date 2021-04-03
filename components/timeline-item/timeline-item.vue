<template>
	<view>
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
				<view class="fr text-xl flex flex-direction align-end" >
					<view class="text-sm">{{item.create_date|timeFrom}}</view>
					<!-- 操作按钮 -->
					<view class="padding-xs cuIcon-moreandroid text-gray" 
						v-if="userInfo.role||userInfo._id==item.uid[0]._id" 
						@tap="showMenu(item._id)">
					</view>
				</view>
				<view class="text-grey text-lg text-bold">{{item.cat_id[0].name}}</view>
				<view class="text-content text-lg" @tap="toDetail">{{item.text}}</view>
				<view class="flex" v-if="item.content_type" @tap="toDetail">
					<video-item :src="item.album[0]" class="basis-lg" @tap.stop/>
				</view>
				<view class="grid grid-square col-3 margin-top-sm" @tap="toDetail" v-else>
					<view v-for="(pic,idx) in item.album" :key="idx" @tap.stop.prevent="preview(item.album,idx)">
						<u-lazy-load :image="pic" img-mode="aspectFill" height="200rpx" border-radius="6"></u-lazy-load>
					</view>
				</view>
				<!-- 作者信息 -->
				<image :src="item.uid[0].avatar" mode="aspectFill" class="cu-avatar sm round margin-right-xs" />
				<text class="text-gray">{{item.uid[0].nickname}}</text>
				<!-- 留言区域 -->
				<message-board :timeline="item" :list="item.comments" @focus="onFocus" />
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
				show: false,
				fullscreen: false
			}
		},
		computed: {
			...mapState(['hasLogin', 'userInfo']),
			actions() {
				const actions = [{
					text: '编辑',
					action: 'edit'
				}, {
					text: '删除',
					color: 'red',
					action: 'del'
				}]
				if((this.userInfo._id === this.item.cat_id[0].uid || this.userInfo.role) && !this.item.content_type) {
					actions.unshift({
						text: '同步到相册',
						action: 'sync'
					})
				}
				return actions
			}
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
				this.show = true
			},
			click(index) {
				switch(this.actions[index].action) {
					case 'edit':
						uni.navigateTo({
							url: 'edit?id=' + this.item._id
						})
						break
					case 'sync':
						uni.navigateTo({
							url: `/pages/list/edit?id=${this.item.cat_id[0]._id}&path=${JSON.stringify(this.item.album)}`
						})
						break
					case 'del':
						this.$emit('del', this.item._id)
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
