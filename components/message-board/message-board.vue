<template>
	<view style="margin-top: -50rpx;">
		<!-- 功能按钮 -->
		<view class="flex justify-end align-center text-grey comments" id="comments" @tap.stop>
			<view class="padding-lr like-loading cu-load load-cuIcon loading" v-if="likeLoading"></view>
			<view class="padding-lr" :class="'cuIcon-like'+(likeId?'fill':'')" @tap="like" v-else>{{(likeId?'取消':'赞')}}</view>
			<view class="cuIcon-message" @tap="comment">评论</view>
			<view style="position: relative;" class="padding-left">
				<button class="btn-transparent" open-type="share" :data-shareInfo="shareInfo"></button>
				<text class="cuIcon-share">分享</text>
			</view>
		</view>
		
		<view class="bg-gray radius margin-top-sm">
			<unicloud-db
				ref="udb"
				manual
				v-slot:default="{data, loading}"
				collection="comments,uni-id-users"
				:where="condition"
				field="timeline_id,uid{_id,nickname,avatar},reply_uid{_id,nickname,avatar},content,comment_type,create_date"
				orderby="create_date desc"
				@load="loaded">
				<view class="cu-load load-cuIcon loading text-gray" v-if="!data.length&&loading"></view>
			</unicloud-db>
			<!-- 点赞列表 -->
			<view class="flex flex-wrap align-center padding-lr-sm">
				<text v-for="(item, index) in likeList" :key="item._id"
					class="margin-tb-sm text-bold text-grey">
					<text class="cuIcon-like" v-if="index==0"></text>
					<text v-else>,</text>
					<text class="margin-lr-xs">{{item.uid[0].nickname}}</text>
				</text>
			</view>
			<!-- 评论列表 -->
			<view class="padding-sm" v-for="(item, index) in commentList" :key="item._id"
				@tap="replyOrRemove(item)" 
				@longpress="adminRemove(item._id)">
				<view>
					<image :src="item.uid[0].avatar" mode="aspectFill" class="cu-avatar sm round margin-right-xs"></image>
					<text class="text-grey text-bold">{{item.uid[0].nickname}}</text>
					<text v-if="item.reply_uid.length">回复<text class="text-grey text-bold">{{item.reply_uid[0].nickname}}</text></text>
					<text class="margin-right-xs">:</text>
					<text v-for="(i, idx) in parseEmoji(item.content)" :key="idx">
						<text v-if="i.type === 1">{{i.content}}</text>
						<text class="emoji-wrp" v-if="i.type === 2">
							<text class="emoji-icon" :class="i.imageClass"></text>
						</text>
					</text>
				</view>
				<view class="text-gray text-sm margin-top-xs">
					<text>{{item.create_date | timeFrom}}</text>
					<text class="margin-left">{{item.uid[0]._id===userInfo._id?'删除':'回复'}}</text>
				</view>
			</view>
		</view>
		
		<!-- 输入区域 -->
		<view class="cu-modal bottom-modal" :class="showInput ? 'show' : ''" @tap.stop="hideInput" @touchmove.stop.prevent>
			<view class="cu-dialog" @tap.stop.prevent v-if="showInput">
				<view class="cu-bar input">
					<input
						class="bg-white round text-left padding-lr"
						confirm-type="send"
						:focus="focus"
						:adjust-position="false"
						:placeholder="reply_nickname?'回复'+reply_nickname:'评论'" 
						:value="form.content"
						cursor-spacing="10" 
						:maxlength="140"
						@focus="onFocus"
						@input="onInput"
						@blur="keyboardHeight=0"
						@confirm="addComment" />
					<view class="action" @tap="showEmoji=!showEmoji">
						<text class="text-grey" :class="showEmoji?'cuIcon-keyboard':'cuIcon-emoji'"></text>
					</view>
					<button class="cu-btn bg-blue round" :disabled="!form.content" :loading="commentLoading" @tap="addComment">发送</button>
				</view>
				<view :style="{bottom: 0,height: keyboardHeight + 'px'}"></view>
				<emoji ref="emoji" v-if="showEmoji" class="text-left" background-color="#f0f0f0" @insertemoji="insertemoji" @delemoji="onDel" @send="addComment"/>
			</view>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database()
	import { parseEmoji } from '../emoji/parser.js'
	export default {
		props: {
			timeline: {
				type: Object,
				default: () => {}
			},
		},		
		data() {
			return {
				likeId: '',
				likeList: [],
				commentList: [],
				likeLoading: false,
				commentLoading: false,
				showInput: false,
				showEmoji: false,
				focus: false,
				reply_nickname: '',
				form: {},
				keyboardHeight: 0,
				condition: `timeline_id=='${this.timeline._id}'`,
				shareInfo: {
					title: this.timeline.text,
					path: '/pages/timeline/detail?id=' + this.timeline._id,
					imageUrl: this.timeline.album[0]
				}
			}
		},
		watch: {
			showEmoji(val) {
				if(val) {
					this.focus = false
					uni.hideKeyboard()
					this.keyboardHeight = 0
				}else {
					this.focus = true
				}
			}
		},
		mounted() {
			setTimeout(() => {
				const observer = uni.createIntersectionObserver(this)
				observer.relativeToViewport({
					bottom: 500,
				}).observe('#comments', res => {
					if (res.intersectionRatio > 0) {
						observer.disconnect()
						this.$refs.udb.loadData()
					}
				})
			}, 30)
		},
		methods: {
			loaded(data) {
				const liked = data.find(v => v.comment_type == 0 && v.uid[0]._id == this.userInfo._id)
				this.likeId = liked ? liked._id : ''
				this.likeList = data.filter(v => v.comment_type == 0)
				this.commentList = data.filter(v => v.comment_type == 1)
			},
			parseEmoji(data) {
				return parseEmoji(data)
			},
			refresh(cb) {
				this.$refs.udb.loadData({
					clear: true
				}, cb)
			},
			async like() {
				this.likeLoading = true
				if(this.likeId) {
					// 取消
					await db.collection('comments').doc(this.likeId).remove()
				}else {
					// 点赞
					await db.collection('comments').add({
						timeline_id: this.timeline._id,
						comment_type: 0
					})
					this.sendMsg()
				}
				this.refresh(() => {
					this.likeLoading = false
				})
			},
			onFocus(e) {
				const { height } = e.detail
				const { screenHeight, windowHeight } = uni.getSystemInfoSync()
				const bottom = screenHeight - windowHeight
				const pages = getCurrentPages()
				const { route } = pages[pages.length - 1]
				if(route.split('/').pop() === 'index') {
					this.keyboardHeight = height - (bottom > 0 ? bottom : 0)
				}else {
					this.keyboardHeight = height
				}
				this.showEmoji = false
				this.$emit('focus', this.keyboardHeight)
			},
			onInput(e) {
				const { value } = e.detail
				if(this.form.content && value.length < this.form.content.length) {
					this.onDel()
				}else {
					this.$set(this.form,'content',value)
				}
			},
			insertemoji(val) {
				if(this.form.content) {
					this.form.content += val
				}else {
					this.$set(this.form,'content',val)
				}
			},
			onDel() {
				const str = this.form.content
				const matchs = str.match(/\[([\u4e00-\u9fa5\w]+)\]$/g)
				this.form.content = matchs ? str.substring(0, str.lastIndexOf(matchs[0]))
					: str.substring(0, str.length - 1)
			},
			comment(e) {
				this.showInput = true
				this.focus = true
				this.form.timeline_id = this.timeline._id
				this.form.comment_type = 1
			},
			reply(item) {
				const { _id, nickname, avatar } = item.uid[0]
				this.form.reply_uid = _id
				this.reply_nickname = nickname
				this.comment()
			},
			replyOrRemove(item) {
				item.uid[0]._id == this.userInfo._id ? this.remove(item._id) : this.reply(item)
			},
			hideInput() {
				this.form = {}
				this.reply_nickname = ''
				this.focus = false
				this.commentLoading = false
				this.showInput = false
			},
			async addComment() {
				if(!this.form.content)
					return
					
				this.commentLoading = true
				await this.$requestMsg()
				try{
					await this.$request('weixin', 'msgCheck', {
						content: this.form.content
					})
				}catch(e){
					this.hideInput()
					this.$u.toast('包含敏感内容')
					return
				}
				
				await db.collection('comments').add(this.form)
				this.refresh(() => {
					this.hideInput()
				})
				this.sendMsg()
			},
			sendMsg() {
				this.$sendMsg({
					type: 'comment',
					touid: this.form.reply_uid || this.timeline.uid[0]._id,
					data: [
						this.timeline.cat_id[0].name,
						this.form.content || '赞了您',
						this.userInfo.nickname
					]
				})
			},
			remove(id) {
				this.$refs.udb.remove(id, {
					confirmContent: '是否删除该条评论？',
					success: () => {
						this.refresh()
					}
				})
			},
			adminRemove(id) {
				if(this.userInfo.role) {
					this.remove(id)
				}
			}
		}
	}
</script>

<style>
	@import '../emoji/emoji_positon.css';
	
	.cu-bar.input {
		margin-right: 0;
		background-color: #f0f0f0;
	}
	
	.cu-bar.input input {
		margin-right: 0;
	}
	
	.like-loading {
		display: inline-block;
		line-height: 1em;
	}
	
	.emoji-wrp {
		display: inline-block;
	  width: 24px;
	  height: 24px;
		overflow: hidden;
		line-height: 24px;
		vertical-align: middle;
	}
	
	.emoji-icon {
		display: block;
		width: 64px;
		height: 64px;
	  transform-origin: 0 0;
	  transform: scale(0.35);
		background-image: url("https://res.wx.qq.com/wxdoc/dist/assets/img/emoji-sprite.b5bd1fe0.png");
	}
</style>
