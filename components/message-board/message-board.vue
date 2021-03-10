<template>
	<view>
		<!-- 功能按钮 -->
		<view class="text-right margin-bottom-sm text-grey" style="margin-top: -50rpx;">
			<text :class="'cuIcon-like'+(likeId?'fill':'')" @tap="like">{{(likeId?'取消':'赞')}}</text>
			<text class="cuIcon-message margin-left-sm" @tap="comment">评论</text>
		</view>
		
		<view class="bg-gray radius">
			<!-- 点赞列表 -->
			<view class="flex padding-sm text-grey text-bold" v-if="likeList.length">
				<text class="cuIcon-like"></text>
				<text v-for="(item, index) in likeList" :key="index" class="margin-left-xs">
					{{index?' , ':''+item.user[0].nickname}}
				</text>
			</view>
			<!-- 评论列表 -->
			<view class="padding-sm" 
				v-for="(item, index) in commentList" :key="index" 
				@tap="replyOrRemove(item)">
				<view>
					<image :src="item.user[0].avatar" mode="aspectFill" class="cu-avatar sm round margin-right-xs"></image>
					<text>{{item.user[0].nickname}}</text>
					<text v-if="item.reply_user.length">回复{{item.reply_user[0].nickname}}</text>
					<text>: {{item.content}}</text>
				</view>
				<view class="text-gray text-xs">
					<text>{{item.create_date|timeFrom}}</text>
					<text class="margin-left">{{item.user_id===userInfo._id?'删除':'回复'}}</text>
				</view>
			</view>
		</view>
		
		<!-- 输入区域 -->
		<view class="cu-modal bottom-modal" :class="showInput ? 'show' : ''" @tap.stop="hideInput">
			<view class="cu-dialog" @tap.stop.prevent>
				<view class="cu-bar input">
					<input :placeholder="reply_nickname?'回复'+reply_nickname:'评论'" v-model="content" cursor-spacing="10" class="bg-gray round text-left padding-lr" />
					<!-- <view class="action">
						<text class="cuIcon-emojifill text-grey"></text>
					</view> -->
					<button class="cu-btn bg-blue round" :disabled="!content" :loading="sending" @tap="addComment">发送</button>
				</view>
			</view>
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
		props: {
			list: {
				type: Array,
				default: () => []
			},
			timelineId: String
		},		
		data() {
			return {
				content: '',
				data: this.list,
				likeId: '',
				showInput: false,
				reply_nickname: '',
				form: {
					
				},
				sending: false
			}
		},
		computed: {
			...mapState(['hasLogin', 'userInfo']),
			likeList() {
				const likeList = this.data.filter(item => {
					return item.comment_type === 0
				})
				this.likeId = ''
				likeList.forEach(item => {
					if(item.user_id === this.userInfo._id) {
						this.likeId = item._id
					}
				})
				return likeList
			},
			commentList() {
				return this.data.filter(item => {
					return item.comment_type === 1
				})
			}
		},
		methods: {
			async refresh() {
				const $ = db.command.aggregate
				const _ = db.command
				const res = await db.collection('comments').aggregate()
					.match({
						timeline_id: this.timelineId
					})
					.lookup({
						from: 'uni-id-users',
						let: {
							id: '$user_id'
						},
						pipeline: $.pipeline()
							.match(_.expr(
								$.eq(['$_id', '$$id'])
							))
							.project({
								_id: 1,
								nickname: 1,
								avatar: 1
							})
							.done(),
						as: 'user',
					})
					.lookup({
						from: 'uni-id-users',
						let: {
							id: '$reply_user_id'
						},
						pipeline: $.pipeline()
							.match(_.expr(
								$.eq(['$_id', '$$id'])
							))
							.project({
								_id: 1,
								nickname: 1,
								avatar: 1
							})
							.done(),
						as: 'reply_user',
					})
					.sort({
						create_date: -1
					})
					.end()
				this.data = res.result.data
			},
			async like() {
				uni.showLoading()
				if(this.likeId) {
					await db.collection('comments').doc(this.likeId).remove()
				}else {
					await db.collection('comments').add({
						timeline_id: this.timelineId,
						comment_type: 0
					})
				}
				await this.refresh()
				uni.hideLoading()
			},
			comment() {
				this.form = {}
				this.reply_nickname = ''
				this.form.timeline_id = this.timelineId
				this.form.comment_type = 1
				this.showInput = true
			},
			hideInput() {
				this.form = {}
				this.showInput = false
			},
			async addComment() {
				this.sending = true
				this.form.content = this.content
				const { result: { id } } = await db.collection('comments').add(this.form)
				const { result: { data }} = await db.collection('comments').doc(id).get()
				this.sending = false
				this.showInput = false
				this.refresh()
			},
			replyOrRemove(item) {
				if(item.user_id === this.userInfo._id) {
					uni.showModal({
						content: '是否删除？',
						success: async res => {
							if(res.confirm) {
								uni.showLoading()
								await db.collection('comments').doc(item._id).remove()
								await this.refresh()
								uni.hideLoading()
							}
						}
					})
				}else {
					const { _id, nickname, avatar } = item.user[0]
					this.reply_nickname = nickname
					this.form.timeline_id = this.timelineId
					this.form.reply_user_id = _id
					this.form.comment_type = 1
					this.showInput = true
				}
			},
			remove(id) {
				
			}
		}
	}
</script>

<style>
</style>
