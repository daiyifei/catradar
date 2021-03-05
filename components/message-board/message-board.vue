<template>
	<view>
		<!-- 功能按钮 -->
		<view class="text-right margin-bottom-sm text-grey" style="margin-top: -50rpx;">
			<text :class="'cuIcon-like'+(likeId?'fill':'')" @tap="like">{{(likeId?'取消':'点赞')}}</text>
			<text class="cuIcon-message margin-left-sm" @tap="comment">留言</text>
		</view>
		
		<view class="bg-gray radius">
			<unicloud-db ref="like" 
				v-slot:default="{data, loading, error, options}" 
				collection="comments,uni-id-users" 
				:where="`timeline_id=='${id}'&&comment_type==0`" 
				field="user_id{_id,nickname}" 
				orderby="create_date asc" 
				@load="likeLoad">
				<!-- 点赞列表 -->
				<view class="flex padding-sm text-grey text-bold" v-if="data.length">
					<text class="cuIcon-like"></text>
					<text v-for="(item, index) in data" :key="index" class="margin-left-xs">
						{{index?' , ':''+item.user_id[0].nickname}}
					</text>
				</view>
			</unicloud-db>
			
			<unicloud-db 
				ref="comment"
				v-slot:default="{data, loading, error, options}" 
				collection="comments,uni-id-users" 
				:where="`timeline_id=='${id}'&&comment_type==1`" 
				field="content,create_date,user_id{_id,nickname,avatar},reply_user_id{nickname,avatar}" 
				orderby="create_date asc">
				<!-- 评论列表 -->
				<view class="padding-sm" v-if="data.length">
					<view v-for="(item, index) in data" :key="index" @tap="item.user_id[0]._id===userInfo._id?remove(item._id):reply(item.user_id[0])">
						<view>
							<image :src="item.user_id[0].avatar" mode="aspectFill" class="cu-avatar sm round margin-right-xs"></image>
							<text>{{item.user_id[0].nickname}}</text>
							<text v-if="item.reply_user_id.length">回复{{item.reply_user_id[0].nickname}}</text>
							<text>: {{item.content}}</text>
						</view>
						<view class="text-gray text-xs">
							<text>{{item.create_date|timeFrom}}</text>
							<text class="margin-left">{{item.user_id[0]._id===userInfo._id?'删除':'回复'}}</text>
						</view>
					</view>
				</view>
			</unicloud-db>
		</view>
		
		<!-- 输入区域 -->
		<view class="cu-modal bottom-modal" :class="showInput ? 'show' : ''" @tap.stop="hideInput">
			<view class="cu-dialog" @tap.stop.prevent>
				<view class="cu-form-group">
					<u-input
						:custom-style="{'padding':'10rpx 20rpx','border-radius':'30rpx','background-color':'#f0f0f0'}"
						v-model="form.content"
						:height="60"
						:clearable="false"
						auto-height
						type="textarea"
						:cursor-spacing="10"
						:placeholder="reply_nickname?'回复'+reply_nickname:'留下你的精彩评论吧'"/>
					<button type="primary" size="mini" class="round margin-left-sm" :disabled="!form.content" :loading="sending" @tap="addComment">发送</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		props: {
			id: String
		},		
		data() {
			return {
				likeId: '',
				showInput: false,
				reply_nickname: '',
				form: {},
				sending: false
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
		methods: {
			likeLoad(data) {
				this.likeId = ''
				data.forEach(item => {
					if(item.user_id[0]._id === this.userInfo._id) {
						this.likeId = item._id
					}
				})
			},
			like() {
				const db = uniCloud.database()
				const query = this.likeId ?
					db.collection('comments').doc(this.likeId).remove() :
					db.collection('comments').add({
						timeline_id: this.id,
						comment_type: 0
					})
				query.then(() => {
					this.$refs.like.loadData({
						clear: true
					})
				})
			},
			comment() {
				this.form = {}
				this.reply_nickname = ''
				this.form.timeline_id = this.id
				this.form.comment_type = 1
				this.showInput = true
			},
			hideInput() {
				this.form = {}
				this.showInput = false
			},
			reply(user) {
				this.reply_nickname = user.nickname
				this.form.timeline_id = this.id
				this.form.reply_user_id = user._id
				this.form.comment_type = 1
				this.showInput = true
			},
			addComment() {
				this.sending = true
				const db = uniCloud.database()
				db.collection('comments').add(this.form).then(() => {
					this.sending = false
					this.showInput = false
					this.$refs.comment.loadData({
						clear: true
					})
				})
			},
			remove(id) {
				this.$refs.comment.remove(id, {
					confirmContent: '是否删除该条留言？'
				})
			}
		}
	}
</script>

<style>
</style>
