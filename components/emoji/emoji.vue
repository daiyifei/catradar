<template>
	<view class="weui-emoji_area" :style="'height: ' + height + 'px; background-color: ' + backgroundColor">
		<scroll-view scroll-y :class="'weui-emotion_list ' + (hasSafeBottom ? 'weui-emoji_area__has-safe-bottom' : '')"
			:style="'padding-left: ' + padding + 'px; padding-right: ' + padding + 'px;'">
			<view v-if="showHistory && history.length">
				<view class="weui-emotion_head">最近使用</view>
				<block v-for="(item, index) in history" :key="index">
					<view class="weui-emotion_item" @tap="insertEmoji(item)"
						:style="'margin-right: ' + ((index + 1) % perLine ? extraPadding : 0) + 'px'">
						<view :class="'weui-icon_emotion ' + emotions[item].style"
							:style="'background-image: url(' + source + ');'"></view>
					</view>
				</block>
			</view>
			<!-- 图片32px，每个宽度40px -->
			<view class="weui-emotion_head" style="margin-top: 8px;">所有表情</view>
			<block v-for="(item, idx) in emotions" :key="idx">
				<view class="weui-emotion_item" @tap="insertEmoji(idx)"
					:style="'margin-right: ' + ((idx + 1) % perLine ? extraPadding : 0) + 'px'">
					<view :class="'weui-icon_emotion ' + item.style" :style="'background-image: url(' + source + ');'">
					</view>
				</view>
			</block>
			<view style="height: 10px;"></view>
		</scroll-view>
		
		<!--操作-->
		<view class="weui-emoji__operation">
			<view class="cu-btn cuIcon-backdelete bg-white radius margin-right-sm shadow" @tap="deleteEmoji" v-if="showDel"></view>
			<view class="cu-btn bg-blue round" @tap="send" v-if="showSend">发送</view>
		</view>
	</view>
</template>

<script>
	import emojiData from './emoji_data'
	import emojiPanelData from './emoji_panel_data'
	import {
		parseEmoji
	} from './parser'

	// size 跟 less 文件对应
	const EMOTION_SIZE = 40
	const emotionMap = {}
	const emotionNames = []

	emojiData.forEach(item => {
		emotionMap[item.id] = item
		emotionNames.push(item.cn)
	})
	const emotions = [] // 对应顺序的表情名称
	emojiPanelData.forEach(id => emotions.push(emotionMap[id]))

	export default {
		options: {
			styleIsolation: 'page-shared',
			addGlobalClass: true,
			pureDataPattern: /^_/ // 指定所有 _ 开头的数据字段为纯数据字段
		},
		props: {
			padding: {
				type: Number,
				default: 15
			},
			backgroundColor: {
				type: String,
				default: '#EDEDED'
			},
			showSend: {
				type: Boolean,
				default: true
			},
			showDel: {
				type: Boolean,
				default: true
			},
			showHistory: {
				type: Boolean,
				default: true
			},
			height: {
				type: Number,
				default: 300
			},
			source: {
				type: String,
				default: 'https://res.wx.qq.com/wxdoc/dist/assets/img/emoji-sprite.b5bd1fe0.png'
			}
		},
		data() {
			return {
				history: [],
				emotions,
				extraPadding: 0,
				perLine: 0
			}
		},
		created() {
			const padding = this.padding
			const systemInfo = wx.getSystemInfoSync()
			const areaWidth = systemInfo.windowWidth
			// 这里的 45 为虚拟的表情宽度
			this.perLine = Math.floor((areaWidth - padding * 2) / 45)
			this.extraPadding = Math.floor((areaWidth - padding * 2 - this.perLine * EMOTION_SIZE) / (this.perLine - 1))
			this.hasSafeBottom = systemInfo.model.indexOf('iPhone X') >= 0
			
			this.history = uni.getStorageSync('emoji_history') || []
		},
		methods: {
			getEmojiNames() {
				return emotionNames
			},
			parseEmoji,
			insertEmoji(idx) {
				const emotionName = this.emotions[idx].cn
				this.LRUCache(this.history, this.perLine, idx)
				this.$emit('insertemoji', emotionName)
			},
			deleteEmoji() {
				this.$emit('delemoji')
			},
			send() {
				this.$emit('send')
			},
			LRUCache(arr, limit, data) {
				const idx = arr.indexOf(data)
				if (idx >= 0) {
					arr.splice(idx, 1)
				} else if (arr.length === limit) {
					arr.pop()
				}
				arr.splice(0,0,data)
				uni.setStorageSync('emoji_history',arr)
			}
		}
	}
</script>

<style>
	@import './emoji_positon.css';

	.weui-emotion_list {
		padding: 0 10px;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		white-space: normal;
	}

	.weui-emotion_item {
		display: inline-block;
		position: relative;
		width: 40px;
		height: 40px;
		padding-bottom: 5px;
		line-height: 40px;
	}

	.weui-icon_emotion {
		position: absolute;
		top: 4px;
		left: 4px;
		display: inline-block;
		transform-origin: 0 0;
		transform: scale(0.5);
	}

	.weui-emotion_head {
		margin: 14px 5px 8px;
		color: #000;
		font-size: 14px;
		text-align: left;
	}

	.weui-emoji_area {
		position: relative;
		width: 100%;
	}

	.weui-emoji_area__has-safe-bottom {
		padding-bottom: 34px;
	}

	.weui-emotion_del_btn {
		display: inline-block;
		width: 24px;
		height: 24px;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%; -50%);
	}

	.weui-emoji__operation {
		position: absolute;
		bottom: 14px;
		right: 12px;
		width: 120px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.weui-emoji__operation__delete,
	.weui-emoji__operation__send {
		display: inline-block;
		width: 56px;
		height: 44px;
		line-height: 44px;
		text-align: center;
		border-radius: 4px;
		font-size: 16px;
	}

	.weui-emoji__operation__delete {
		position: relative;
		font-size: 0;
		background-color: rgba(255, 255, 255);
	}

	.weui-emoji__operation__send {
		margin-left: 8px;
		background-color: #04C160;
		color: rgba(255, 255, 255, 0.9);
	}
</style>
