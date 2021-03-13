<template>
	<view>
		<unicloud-db ref="udb" v-slot:default="{data, loading, error, options, hasMore}" 
			collection="comments,uni-id-users,list,timeline"
			field="_id,user_id{_id,nickname,avatar},timeline_id{_id,cat_id{_id,name,avatar}},content,create_date"
			orderby="create_date desc"
			:where="condition"
			@load="loaded">
			<view class="cu-load loading text-gray" v-if="loading"></view>
			<view class="cu-list menu-avatar" v-else>
				<view class="cu-item" v-for="(item, index) in data" :key="index">
					<image class="cu-avatar round lg" :src="item.user_id[0].avatar" />
					<view class="content">
						<view class="text-grey">
							<text>{{item.user_id[0].nickname}}</text>
							<text class="text-xs margin-left-xs">{{item.create_date}}</text>
						</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">{{item.content}}</view>
						</view>
					</view>
					<view class="action" v-if="item.timeline_id.length ">
						<view class="text-grey text-xs"></view>
						<image class="cu-avatar radius" :src="item.timeline_id[0].cat_id[0].avatar"></image>
					</view>
				</view>
				<view class="cu-load text-gray" v-if="!hasMore">没有更多了</view>
			</view>
		</unicloud-db>
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
				list: [],
				type: 0
			}
		},
		computed: {
			...mapState(['hasLogin', 'userInfo']),
			condition() {
				return `user_id._id=='${this.userInfo._id}'&&comment_type==${this.type}`
			}
		},
		onLoad(options) {
			this.type = parseInt(options.type)
			uni.setNavigationBarTitle({
				title: this.type ? '评论' : '赞'
			})
		},
		onReachBottom() {
			this.$refs.udb.loadMore()
		},
		methods: {
			loaded(data) {
				data.map(item => {
					item.create_date = this.$root.$options.filters.timeFrom(item.create_date)
				})
			}
		}
	}
</script>

<style>

</style>
