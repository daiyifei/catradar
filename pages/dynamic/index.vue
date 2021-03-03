<template>
	<view>
		<!--列表主体-->
		<unicloud-db
			ref="udb"
			v-slot:default="{data, loading, hasMore, error, options}" 
			collection="timeline,list,uni-id-users"
			field="cat_id{_id,name,avatar},user_id{nickname,avatar},text,album,create_date"
			:page-size="5"
			orderby="create_date desc">
			<view class="cu-list menu-avatar comment solids-top">
				<view class="cu-item" v-for="(item, index) in data" :key="index">
					<navigator :url="'/pages/list/detail?id='+item.cat_id[0]._id" class="cu-avatar">
						<image :src="item.cat_id[0].avatar" mode="aspectFill" class="cu-avatar radius"></image>
					</navigator>
					<view class="content">
						<view class="text-grey">{{item.cat_id[0].name}}</view>

						<!-- 内容区域 -->
						<view class="text-content">{{item.text}}</view>
						<view class="grid grid-square col-3 margin-top-sm">
							<view class="bg-img" v-for="(pic,idx) in item.album" :key="idx">
								<image :src="pic" mode="aspectFill" @tap.stop="preview(item.album, idx)"></image>
							</view>
						</view>

						<!-- 发布信息区域 -->
						<view class="margin-top-sm flex justify-between">
							<view class="text-gray">
								<image :src="item.user_id[0].avatar" mode="aspectFill" class="cu-avatar sm round margin-right-xs"></image>
								<text>{{item.user_id[0].nickname}} 发布于</text>
								<uni-dateformat :date="item.create_date" format="yyyy年M月d日" :threshold="[60000, 3600000*24]" />
							</view>
							
						</view>
						
						<message-board :ref="item._id" :id="item._id" @input="showInputArea"></message-board>
					</view>
				</view>
			</view>
				
			<view class="cu-item">
				<view class="content">
					<text class="cu-load text-gray text-sm loading" v-if="loading"></text>
					<text class="cu-load text-gray text-sm" v-else>{{hasMore ? '加载更多' : '没有更多了'}}</text>
				</view>
			</view>
		</unicloud-db>
		
		<!--新建按钮-->
		<btn-new v-if="userInfo" choose-image/>
	</view>
</template>

<script>
	import uniDateformat from "@/components/uni-dateformat/uni-dateformat.vue"
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		components: {
			uniDateformat
		},
		data() {
			return {
				showInput: false,
				reply_username: '',
				form: {},
				sending: false
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
		onShow() {
			this.$refs.udb.loadData({
				clear: true
			})
		},
		onPullDownRefresh() {
			this.$refs.udb.loadData({
				clear: true
			}, () => {
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			this.$refs.udb.loadMore()
		},
		methods: {
			preview(urls, current) {
				uni.previewImage({
				  urls,
				  current
				})
			},
			showInputArea(item) {
				this.reply_username = ''
				this.form.timeline_id = item._id
				this.showInput = true
			},
			reply(e) {
				this.reply_username = e.reply_username
				this.form.timeline_id = e.timeline_id
				this.form.reply_user_id = e.reply_user_id
				this.showInput = true
			},
			hideInputArea() {
				this.form = {}
				this.showInput = false
			},
			addComment() {
				this.sending = true
				this.$refs["'" + this.form.timeline_id + "'"].add(this.form)
				const db = uniCloud.database()
				db.collection('comments').add(this.form).then(() => {
					this.sending = false
					this.showInput = false
					
				})
			}		
		}
	}
</script>

<style>

</style>
