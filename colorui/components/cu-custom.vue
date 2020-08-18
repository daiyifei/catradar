<template>
	<view>
		<view class="cu-custom">
			<view class="cu-bar fixed" :class="[bgImage!=''?'none-bg text-white bg-img':'',bgColor]">
				<view class="action">
					<view @tap="BackPage" v-if="isBack">
						<text class="cuIcon-back"></text>
						<slot name="backText"></slot>
					</view>
				</view>
				<view class="content">
					<slot name="content"></slot>
				</view>
				<slot name="right"></slot>
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
		name: 'cu-custom',
		props: {
			bgColor: {
				type: String,
				default: ''
			},
			isBack: {
				type: [Boolean, String],
				default: false
			},
			bgImage: {
				type: String,
				default: ''
			},
		},
		methods: {
			BackPage() {
				uni.navigateBack()
			}
		}
	}
</script>

<style>
 .cu-custom {
	 height: calc(50px + var(--status-bar-height));
 }
 
 .cu-bar {
	 padding-top: var(--status-bar-height);
	 height: calc(50px + var(--status-bar-height));
 }
 
 .cu-bar .content {
	 top: var(--status-bar-height);
 }
</style>
