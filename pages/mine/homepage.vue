<template>
	<view>
		<u-navbar :background="background" back-icon-color="#fff" title-color="#fff" immersive :title="title" :title-color="titleColor"></u-navbar>
		
		<!-- 头部 -->
		<user-info :value="user" class="user-info"></user-info>
		
		<!-- 时间轴 -->
		<view class="padding">
			<unicloud-db
				ref="udb"
				v-slot:default="{data, loading, hasMore}" 
				collection="timeline,list"
				manual
				:where="condition"
				:page-size="5"
				field="text,album,cat_id{_id,name,avatar},content_type,create_date"
				orderby="create_date desc"
				@load="timelineLoaded">
				<view v-for="(item,index) in data" :key="index" class="cu-timeline">
					<view class="cu-time margin-left">{{item.time}}</view>
					<view class="cu-item" :class="index?'':'text-blue'">
						<navigator class="margin-bottom flex align-center" :url="`/pages/list/detail?id=${item.cat_id[0]._id}`">
							<image :src="item.cat_id[0].avatar" mode="aspectFit" class="cu-avatar round"></image>
							<view class="text-grey text-lg text-bold margin-left-xs">{{item.cat_id[0].name}}</view>
						</navigator>
						<navigator class="content" :url="`/pages/timeline/detail?id=${item._id}`">
							<view class="text-content">{{item.text}}</view>
							<album :urls="item.album" />
						</navigator>
					</view>
				</view>
				<view class="text-sm text-gray text-center padding" v-if="!hasMore">暂无更多</view>
			</unicloud-db>
		</view>
		
		<!--操作按钮-->
		<view class="btn-float cu-avatar cuIcon-top round lg bg-gradual-blue margin"  @tap="backTop" v-if="showBackToTop"></view>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				user: {},
				condition: '',
				background: {
					background: ''
				},
				title: '',
				titleColor: '',
				showBackToTop: false,
			}
		},
		onLoad(options) {
			db.collection('uni-id-users').doc(options.uid).field('nickname,avatar,gender,favs').get({
				getOne: true
			}).then(res => {
				this.user = res.result.data
				this.condition = `base_id=='${this.baseInfo._id}'uid=='${options.uid}'`
			})
		},
		onPageScroll(e) {
			const opacity = e.scrollTop / 100
			this.title = this.user.nickname
			this.titleColor = `rgba(255,255,255,${opacity})`
			this.background.background = `linear-gradient(45deg, rgba(57,181,74,${opacity}), rgba(141,198,63,${opacity}))`
			if(e.scrollTop > 1000) {
				this.showBackToTop = true
			}else {
				this.showBackToTop = false
			}
		},
		onReachBottom() {
			this.$refs.udb.loadMore()
		},
		methods: {
			timelineLoaded(data) {
				data.map(item => {
					item.time = this.$u.timeFrom(item.create_date, 'yyyy/mm/dd')
				})
			},
			backTop() {
				uni.pageScrollTo({
					scrollTop: 0
				})
			}
		}
	}
</script>

<style>

</style>
