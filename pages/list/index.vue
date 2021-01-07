<template>
	<view>
		<!-- 搜索栏 -->
		<view class="cu-bar bg-white search">
			<view class="search-form round">
				<text class="cuIcon-search"></text>
				<input type="text" :placeholder="loading?'加载中':'在'+total+'只猫咪中搜索'" confirm-type="search" @input="onSearch"></input>
			</view>
			<filters class="margin-right" v-model="params.condition" @change="fetchData"/>
			<statistics class="margin-right" />
		</view>
		
		<!-- 索引列表 -->
		<u-index-list :scrollTop="scrollTop" :index-list="indexList" class="index-list" v-if="list.length">
			<!-- 置顶项目 -->
			<view class="cu-list menu">
				<view class="cu-item">
					<view class="content">
						<text class="cuIcon-presentfill text-green"></text>
						<text class="text-grey">待领养</text>
					</view>
				</view>
				<view class="cu-item">
					<view class="content">
						<text class="cuIcon-crownfill text-orange"></text>
						<text class="text-grey">已领养</text>
					</view>
				</view>
				<view class="cu-item">
					<view class="content">
						<text class="cuIcon-explorefill text-blue"></text>
						<text class="text-grey">失踪中</text>
					</view>
				</view>
				<view class="cu-item">
					<view class="content">
						<text class="cuIcon-discoverfill text-grey"></text>
						<text class="text-grey">回喵星</text>
					</view>
				</view>
			</view>
			<view v-for="(item, index) in list" :key="index">
				<u-index-anchor :index="item.name" />
				<view class="cu-list menu-avatar no-padding">
					<item :data="item" v-for="(item,idx) in item.data" :key="idx" />
				</view>
			</view>
		</u-index-list>
		<view class="flex justify-center padding text-sm text-gray" v-else>
			<!-- 加载中 -->
			<view v-if="loading">加载中</view>
			<!-- 空状态 -->
			<view v-else>暂无内容</view>
		</view>
	</view>
</template>

<script>
	import item from './components/item.vue'
	import filters from './components/filters.vue'
	import statistics from './components/statistics.vue'
	export default {
		components: {
			item,
			filters,
			statistics
		},
		data() {
			return {
				scrollTop: 0,
				total: 0,
				list: [],
				indexList: [],
				loading: false,
				params: {
					condition: {},
					searchKey: 'name',
					searchValue: ''
				}
			}
		},
		onLoad() {
			this.fetchData()
		},
		onShow() {
			this.editable = false
			if (uni.getStorageSync('userInfo')) {
				this.editable = true
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		onPullDownRefresh() {
			this.fetchData()
		},
		methods: {
			fetchData() {
				this.list = []
				this.indexList = []
				this.loading = true
				this.$request('list', 'getList', this.params).then(res => {
					this.total = res.total
					this.list = res.data
					res.data.forEach(item => {
						this.indexList.push(item.name)
					})
					this.loading = false
					uni.stopPullDownRefresh()
				})
			},
			onSearch(e) {
				this.params.searchValue = e.detail.value
				this.fetchData()
			}
		}
	}
</script>

<style>
</style>
