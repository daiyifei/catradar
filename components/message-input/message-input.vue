<template>
	<view>
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
	export default {
		data() {
			return {
				
			}
		},
		methods: {
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
		}
	}
</script>

<style>

</style>
