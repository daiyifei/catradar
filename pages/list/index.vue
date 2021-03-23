<template>
	<view>
		<view class="fullscreen" v-if="!hasLogin">
			<u-empty text="请先登录" mode="permission">
				<navigator url="/pages/mine/index" class="cu-btn bg-blue margin radius" slot="bottom" open-type="switchTab">去登录</navigator>
			</u-empty>
		</view>
		<view class="fullscreen" v-else-if="!hasBase">
			<u-empty text="未加入任何猫区" mode="list">
				<navigator url="/pages/radar/index" class="cu-btn bg-blue margin radius" slot="bottom" open-type="switchTab">去选择</navigator>
			</u-empty>
		</view>
		
		<view v-else>
			<u-navbar :is-back="false" class="navbar">
				<!-- 搜索栏 -->
				<view class="cu-bar search response">
					<view class="search-form round">
						<text class="cuIcon-search"></text>
						<input placeholder="搜索" confirm-type="search" v-model="searchValue"></input>
						<text class='cuIcon-close text-gray' v-if="searchValue" @tap="searchValue=''"></text>
					</view>
					<list-filter class="margin-right" v-model="condition" @change="onFilterChange" />
					<statistics class="margin-right" />
				</view>
			</u-navbar>
			
			<!-- 列表 -->
			<index-list :scrollTop="scrollTop" :offsetTop="offsetTop" :list="list">
				<view class="cu-list menu">
					<navigator class="cu-item" url="subpage?state=1">
						<view class="content">
							<text class="cuIcon-explorefill text-blue"></text>
							<text class="text-grey">失踪中</text>
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
				v-if="hasLogin"></navigator>
		</view>
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
				condition: {
					state: 0
				},
				scrollTop: 0,
				offsetTop: 0,
				searchValue: ''
			}
		},
		computed: mapState(['hasLogin', 'userInfo', 'hasBase']),
		watch: {
			condition(val) {
				this.fetchData()
			},
			searchValue(val) {
				this.$u.debounce(this.onSearch, 500)
			}
		},
		onLoad() {
			uni.$on('listUpdate',() => {
				this.fetchData()
			})
		},
		onShow() {
			if(!this.loading && !this.list.length) {
				this.fetchData()
			}
		},
		onReady() {
			this.$u.getRect('.navbar').then(res => {
				this.offsetTop = res.height
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
				const {result:{ data }} = await db.collection('list').field('_id,name,py,avatar,female,birthday,neuter').where(this.condition).orderBy('py','asc').get()
				this.list = data
				this.loading = false
			},
			onSearch() {
				this.condition = this.searchValue ? db.command.or({
					name: new RegExp('.*' + this.searchValue,'i')
				},{
					py: new RegExp('.*' + this.searchValue,'i')
				}) : {
					state: 0
				}
			},
			onFilterChange(e) {
				this.condition = e
			},
		}
	}
</script>

<style>
</style>
