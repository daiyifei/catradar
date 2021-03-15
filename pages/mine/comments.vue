<template>
	<view>
		<view class="nav bg-white">
			<view class="cu-item" :class="formOther?'text-blue cur':''" @tap="formOther=true">我收到的</view>
			<view class="cu-item" :class="!formOther?'text-blue cur':''" @tap="formOther=false">我发出的</view>
		</view>
		<unicloud-db ref="udb" v-slot:default="{data, loading, error, options, hasMore}" 
			collection="comments,uni-id-users,list,timeline"
			field="_id,user_id{_id,nickname,avatar},reply_user_id{_id,nickname,avatar},timeline_id{_id,cat_id{_id,name,avatar}},content,create_date"
			orderby="create_date desc"
			manual
			:where="condition"
			@load="loaded">

			<view class="cu-load loading text-gray" v-if="loading"></view>
			<view class="cu-list menu-avatar" v-else>
				<navigator class="cu-item" 
					v-for="(item, index) in data" :key="index" 
					:url="`/pages/timeline/detail?id=${item.timeline_id[0]._id}`">
					<image class="cu-avatar round lg" :src="item.user_id[0].avatar" />
					<view class="content">
						<view class="text-grey">
							<text>{{item.user_id[0].nickname}}</text>
							<text class="text-xs margin-left-xs">{{item.create_date}}</text>
						</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">
								<text v-if="item.content">
									<text v-if="item.reply_user_id.length">回复了{{item.reply_user_id[0].nickname}}</text>
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
				type: 0,
				formOther: true //收到的消息
			}
		},
		computed: {
			...mapState(['hasLogin', 'userInfo']),
			condition() {
				return this.formOther ? `comment_type==${this.type}&&reply_user_id._id=='${this.userInfo._id}'`
					: `comment_type==${this.type}&&user_id._id=='${this.userInfo._id}'`
			}
		},
		onLoad(options) {
			this.type = parseInt(options.type)
			uni.setNavigationBarTitle({
				title: this.type ? '评论' : '赞'
			})
		},
		onReady() {
			this.$refs.udb.loadData()
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
