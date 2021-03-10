<template>
	<view>
		<u-navbar :is-back="false">
			<!-- 搜索栏 -->
			<view class="cu-bar search response">
				<view class="search-form round">
					<text class="cuIcon-search"></text>
					<input placeholder="搜索" confirm-type="search" @input="onSearch"></input>
				</view>
				<list-filter class="margin-right" v-model="condition" @change="onFilterChange" />
				<statistics class="margin-right" />
			</view>
		</u-navbar>
		
		<!-- 列表 -->
		<index-list :scrollTop="scrollTop" :list="list">
			<view class="cu-list menu">
				<navigator class="cu-item" url="subpage?state=1">
					<view class="content">
						<text class="cuIcon-presentfill text-green"></text>
						<text class="text-grey">待领养</text>
					</view>
				</navigator>
				<navigator class="cu-item" url="subpage?state=2">
					<view class="content">
						<text class="cuIcon-crownfill text-orange"></text>
						<text class="text-grey">已领养</text>
					</view>
				</navigator>
				<navigator class="cu-item" url="subpage?state=3">
					<view class="content">
						<text class="cuIcon-explorefill text-blue"></text>
						<text class="text-grey">失踪中</text>
					</view>
				</navigator>
				<navigator class="cu-item" url="subpage?state=4">
					<view class="content">
						<text class="cuIcon-discoverfill text-grey"></text>
						<text class="text-grey">回喵星</text>
					</view>
				</navigator>
				<view class="cu-load loading text-gray" v-if="loading"></view>
				<view class="cu-load text-gray" v-else-if="!list.length">暂无结果</view>
			</view>
		</index-list>
		
		<!--新建按钮-->
		<navigator 
			class="cu-avatar round lg bg-gradual-blue cuIcon-add btn-new margin"
			url="edit"
			v-if="hasLogin&&userInfo.scope===9"></navigator>
	</view>
</template>

<script>
	const db = uniCloud.database()
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				list: [],
				loading: false,
				condition: {},
				scrollTop: 0
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
		watch: {
			condition(val) {
				this.fetchData()
			}
		},
		onLoad() {
			this.fetchData()
		},
		onShow() {
			uni.$on('refresh',() => {
				this.fetchData()
			})
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop
		},
		async onPullDownRefresh() {
			await this.fetchData()
			uni.stopPullDownRefresh()
		},
		methods: {
			async fetchData() {
				this.loading = true
				const {result:{ data }} = await db.collection('list').where(this.condition).orderBy('py','asc').get()
				this.list = data
				this.loading = false
			},
			onSearch(e) {
				this.condition = db.command.or({
					name: new RegExp('.*' + e.detail.value,'i')
				},{
					py: new RegExp('.*' + e.detail.value,'i')
				})
			},
			onFilterChange(e) {
				this.condition = e
			},
		}
	}
</script>

<style>
	.btn-new {
		position: fixed;
		right: 0;
		bottom: var(--window-bottom);
		opacity: .9;
		line-height: 80rpx;
	}
</style>
