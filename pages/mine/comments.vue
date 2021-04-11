<template>
	<view>
		<view class="nav bg-white">
			<view class="cu-item" :class="currTab==0?'text-green cur':''" @tap="switchTab(0)">收到的</view>
			<view class="cu-item" :class="currTab==1?'text-green cur':''" @tap="switchTab(1)">发出的</view>
		</view>
		
		<unicloud-db ref="udb" v-slot:default="{data, loading, hasMore}" manual
			collection="comments,uni-id-users,list,timeline"
			field="_id,uid{_id,nickname,avatar},reply_uid{_id,nickname,avatar},timeline_id{_id,uid{_id,nickname,avatar},cat_id{_id,name,avatar}},content,create_date"
			orderby="create_date desc"
			:where="condition"
			@load="loaded">
			<view class="cu-list menu-avatar">
				<navigator class="cu-item"
					@tap="requestMsg"
					v-for="(item, index) in data" :key="index" 
					:url="`/pages/timeline/detail?id=${item.timeline_id[0]._id}`" v-if="item.timeline_id.length">
					<image class="cu-avatar round lg" :src="item.uid[0].avatar" />
					<view class="content">
						<view class="text-grey">
							<text>{{item.uid[0].nickname}}</text>
							<text class="text-xs margin-left-xs">{{item.create_date}}</text>
						</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">
								<text v-if="item.content">
									<text v-if="item.reply_uid.length">回复了{{item.reply_uid[0].nickname}}</text>
									<text v-else>评论了{{item.timeline_id[0].cat_id[0].name}}</text>
									<text>: {{item.content}}</text>
								</text>
								<text v-else>赞了{{item.timeline_id[0].cat_id[0].name}}</text>
							</view>
						</view>
					</view>
					<navigator 
						class="action" 
						:url="`/pages/list/detail?id=${item.timeline_id[0].cat_id[0]._id}`"
						@tap.stop.prevent
						v-if="item.timeline_id.length">
						<view class="text-grey text-xs"></view>
						<image class="cu-avatar radius" :src="item.timeline_id[0].cat_id[0].avatar"></image>
					</navigator>
				</navigator>
				<view class="cu-load loading text-gray" v-if="loading"></view>
				<view class="cu-load text-gray text-sm" v-else-if="!hasMore">没有更多了</view> 
			</view>
		</unicloud-db>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				uid: '',
				currTab: 0
			}
		},
		computed: {
			condition() {
				const { uid } = this
				return this.currTab === 0 ? `uid._id!='${uid}'&&(timeline_id.uid._id=='${uid}'||reply_uid.id=='${uid}')`
						: `uid._id=='${uid}'`
			}
		},
		onLoad(options) {
			this.uid = options.uid
		},
		onReady() {
			if(this.hasLogin) {
				this.$refs.udb.loadData()
			}else {
				this.$u.toast('请先登录')
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/mine/index'
					})
				},1000)
			}
		},
		onPullDownRefresh() {
			this.$refs.udb.loadData({
				clear: true
			},() => {
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			this.$refs.udb.loadMore()
		},
		methods: {
			loaded(data) {
				data.map(item => {
					item.create_date = this.$u.timeFrom(item.create_date)
				})
			},
			switchTab(index) {
				this.currTab = index
			},
			requestMsg() {
				// #ifdef MP-WEIXIN
				uni.requestSubscribeMessage({
					tmplIds: ['73TwwDG5U8hoQT_WCOC85kt7Rr5lr_v8aZb-a9M_hl8']
				})
				// #endif
			}
		}
	}
</script>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 9;
	}
</style>
