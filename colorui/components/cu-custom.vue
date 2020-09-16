<template>
	<view>
		<view class="cu-custom" :class="bgColor?'':'cu-bar fixed shadow-none'" :style="[{height:CustomBar + 'px'}]">
			<view class="cu-bar fixed" :style="style" :class="[bgImage!=''?'none-bg text-white bg-img':'',bgColor]">
				<view class="action">
					<view @tap="BackPage" v-if="isBack">
						<text class="cuIcon-back" :class="bgColor?'':'icon-transparent'"></text>
						<slot name="backText"></slot>
					</view>
				</view>
				<view class="content" :style="[{top:StatusBar + 'px'}]">
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
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar
			};
		},
		name: 'cu-custom',
		computed: {
			style() {
				var StatusBar= this.StatusBar;
				var CustomBar= this.CustomBar;
				var bgImage = this.bgImage;
				var style = `height:${CustomBar}px;padding-top:${StatusBar}px;`;
				if (this.bgImage) {
					style = `${style}background-image:url(${bgImage});`;
				}
				return style
			}
		},
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
	.none-bg {
		opacity: 0;
		transition: all 1s;
	}
	
	.shadow-none {
		box-shadow: none;
	}
	
	.icon-transparent {
		padding: 20rpx;
		color: #fff;
		background-color: rgba(0,0,0,.5);
		border-radius: 50%;
	}
</style>
