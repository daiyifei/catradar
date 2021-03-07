<template>
	<view>
		<!-- 搜索栏 -->
		<view class="cu-bar bg-white search">
			<view class="search-form round">
				<text class="cuIcon-search"></text>
				<input type="text" placeholder="搜索" confirm-type="search" @input="onSearch"></input>
			</view>
			<list-filter class="margin-right" v-model="condition" />
			<statistics class="margin-right" />
		</view>
		
		<!-- 列表 -->
		<index-list :scrollTop="scrollTop" :condition="condition" ref="indexList">
			<view slot="top">
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
				</view>
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
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				scrollTop: 0,
				condition: {}
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
		onPageScroll(e) {
			this.scrollTop = e.scrollTop
		},
		onPullDownRefresh() {
			this.$refs.indexList.fetchData()
		},
		methods: {
			onSearch(e) {
				const db = uniCloud.database()
				this.condition = db.command.or({
					name: new RegExp('.*' + e.detail.value,'i')
				},{
					py: new RegExp('.*' + e.detail.value,'i')
				})
			}
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
