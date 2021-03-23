<template>
	<view class="text-content" style="margin-top: -50rpx;">
		<!-- 功能按钮 -->
		<view class="text-right text-grey">
			<text class="padding-lr like-loading cu-load load-cuIcon loading" v-if="likeLoading"></text>
			<text class="padding" :class="'cuIcon-like'+(likeId?'fill':'')" @tap="like" v-else>{{(likeId?'取消':'赞')}}</text>
			<text class="padding-tb cuIcon-message" @tap="comment">评论</text>
		</view>
		
		<view class="bg-gray radius margin-top-sm" v-if="data.length">
			<!-- 点赞列表 -->
			<view class="flex flex-wrap padding-sm text-grey text-bold" v-if="likeList.length">
				<text class="cuIcon-like"></text>
				<text v-for="(item, index) in likeList" :key="index" class="margin-left-xs" v-if="item.comment_type===0">
					{{(index?' , ':'')+item.user[0].nickname}}
				</text>
			</view>
			<!-- 评论列表 -->
			<view class="padding-sm"
				v-for="(item, index) in data" v-if="item.comment_type===1" :key="index" @tap="replyOrRemove(item)" @longpress="adminRemove(item)">
				<view class="comment-wrp">
					<image :src="item.user[0].avatar" mode="aspectFill" class="cu-avatar sm round margin-right-xs"></image>
					<text class="text-grey text-bold">{{item.user[0].nickname}}</text>
					<text v-if="item.reply_user.length">回复<text class="text-grey text-bold">{{item.reply_user[0].nickname}}</text></text>
					<text class="margin-right-xs">:</text>
					<text v-for="(i, idx) in parseEmoji(item.content)" :key="idx">
						<text v-if="i.type === 1">{{i.content}}</text>
						<text class="emoji-wrp" v-if="i.type === 2">
							<text class="emoji-icon" :class="i.imageClass"></text>
						</text>
					</text>
				</view>
				<view class="text-gray text-sm margin-top-xs">
					<text>{{item.create_date|timeFrom}}</text>
					<text class="margin-left">{{item.uid===userInfo._id?'删除':'回复'}}</text>
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
						hold-keyboard
						:placeholder="reply_nickname?'回复'+reply_nickname:'评论'" 
						:value="content"
						cursor-spacing="10" 
						:maxlength="140"
						@focus="onFocus"
						@input="onInput"
						@blur="keyboardHeight=0"
						@confirm="addComment" />
					<view class="action" @tap="showEmoji=!showEmoji">
						<text class="text-grey" :class="showEmoji?'cuIcon-keyboard':'cuIcon-emoji'"></text>
					</view>
					<button class="cu-btn bg-blue round" :disabled="!content" @tap="addComment">发送</button>
				</view>
				<view :style="{'height': keyboardHeight +'px'}"></view>
				<emoji ref="emoji" v-if="showEmoji" class="text-left" background-color="#f0f0f0" @insertemoji="insertemoji" @delemoji="onDel" @send="addComment"/>
			</view>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database()
	import { parseEmoji } from '../emoji/parser.js'
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
			timeline: {
				type: Object,
				default: () => {}
			},
		},		
		data() {
			return {
				content: '',
				data: this.list,
				likeLoading: false,
				showInput: false,
				showEmoji: false,
				focus: false,
				reply_nickname: '',
				form: {},
				keyboardHeight: 0
			}
		},
		computed: {
			...mapState(['hasLogin', 'userInfo']),
			likeList() {
				return this.data.filter(item => {
					return item.comment_type === 0
				})
			},
			likeId() {
				const liked = this.likeList.filter(item => {
					return item.uid===this.userInfo._id
				})
				return liked.length ? liked[0]._id : ''
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
		methods: {
			parseEmoji(data) {
				return parseEmoji(data)
			},
			async refresh() {
				const { data } = await this.$request('timeline', 'getCommentList', {
					timeline_id: this.timeline._id
				})
				this.data = data
			},
			async like() {
				this.likeLoading = true
				if(this.likeId) {
					await db.collection('comments').doc(this.likeId).remove()
				}else {
					await db.collection('comments').add({
						timeline_id: this.timeline._id,
						comment_type: 0
					})
				}
				await this.refresh()
				this.likeLoading = false
			},
			onFocus(e) {
				const { height } = e.detail
				const { screenHeight, windowHeight } = uni.getSystemInfoSync()
				const bottom = screenHeight - windowHeight
				if(getCurrentPages().length > 1) {
					this.keyboardHeight = height
				}else {
					this.keyboardHeight = height - (bottom > 0 ? bottom : 0)
				}
				this.showEmoji = false
			},
			onInput(e) {
				const { value } = e.detail
				if(value.length < this.content.length) {
					this.onDel()
				}else {
					this.content = value
				}
			},
			insertemoji(e) {
				this.content += e
			},
			onDel() {
				const str = this.content
				const matchs = str.match(/\[([\u4e00-\u9fa5\w]+)\]$/g)
				this.content = matchs ? str.substring(0, str.lastIndexOf(matchs[0]))
					: str.substring(0, str.length - 1)
			},
			comment() {
				this.form = {}
				this.reply_nickname = ''
				this.form.timeline_id = this.timeline._id
				this.form.comment_type = 1
				this.showInput = true
				this.focus = true
				this.$emit('focus')
			},
			hideInput() {
				this.form = {}
				this.content = ''
				this.focus = false
				this.showInput = false
			},
			async addComment() {
				if(!this.content) {
					this.$u.toast('请输入内容')
					return
				}
				uni.showLoading()
				let form = this.form
				form.content = this.content
				this.hideInput()
				await db.collection('comments').add(form)
				await this.refresh()
				uni.hideLoading()
			},
			repley(item) {
				const { _id, nickname, avatar } = item.user[0]
				this.reply_nickname = nickname
				this.form.timeline_id = this.timeline._id
				this.form.reply_uid = _id
				this.form.comment_type = 1
				this.showInput = true
				this.focus = true
				this.$emit('focus')
			},
			remove(item) {
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
			},
			replyOrRemove(item) {
				if(item.uid === this.userInfo._id) {
					this.remove(item)
				}else {
					this.repley(item)
				}
			},
			adminRemove(item) {
				if(this.userInfo.role) {
					this.remove(item)
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
	  transform: scale(0.375);
		background-image: url("https://res.wx.qq.com/wxdoc/dist/assets/img/emoji-sprite.b5bd1fe0.png");
	}
</style>
