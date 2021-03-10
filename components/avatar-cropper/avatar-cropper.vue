<template>
	<view class="container">
		<view class="grid col-3 grid-square margin-top">
			<view class="bg-img" v-if="src">
				<image :src="src" mode="aspectFill" />
				<view class="close" @tap.prevent.stop="src=''">
					<text class='cuIcon-close'></text>
				</view>
			</view>
			<view class="solids" @tap="chooseAvatar" v-else>
				<text class="cuIcon-cameraadd"></text>
			</view>
		</view>
		
		<!-- 裁剪对话框 -->
		<view class="cu-modal" :class="show?'show':''">
			<view class="cu-dialog" :style="{ width: cropperOpt.width + 'px' }">
				<view class="cu-bar bg-white justify-end">
					<view class="content">裁剪</view>
					<view class="action" @tap="hideModal">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="content">
					<view class="cropper-wrapper" :style="{ height: cropperOpt.height + 'px' }">
						<canvas
							class="cropper"
							:disable-scroll="true"
							@touchstart="touchStart"
							@touchmove="touchMove"
							@touchend="touchEnd"
							:style="{ width: cropperOpt.width, height: cropperOpt.height, backgroundColor: 'rgba(0, 0, 0, 0.8)' }"
							canvas-id="cropper"
							id="cropper"
							v-if="show"
						></canvas>
						<canvas
							class="cropper"
							:disable-scroll="true"
							:style="{
								position: 'fixed',
								top: `-${cropperOpt.width * cropperOpt.pixelRatio}px`,
								left: `-${cropperOpt.height * cropperOpt.pixelRatio}px`,
								width: `${cropperOpt.width * cropperOpt.pixelRatio}px`,
								height: `${cropperOpt.height * cropperOpt.pixelRatio}`
							}"
							canvas-id="targetId"
							id="targetId"
							v-if="show"
						></canvas>
					</view>
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn line-green text-green" @tap="show=false">取消</button>
						<button class="cu-btn bg-green margin-left" @tap="getCropperImage">确定</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import WeCropper from './weCropper.js'
export default {
	behaviors: ['uni://form-field'],
	props: {
		value: String,
		// 裁剪框宽度，单位rpx
		rectWidth: {
			type: [String, Number],
			default: 200
		},
		// 裁剪框高度，单位rpx
		rectHeight: {
			type: [String, Number],
			default: 200
		},
		// 输出图片宽度，单位rpx
		destWidth: {
			type: [String, Number],
			default: 300
		},
		// 输出图片高度，单位rpx
		destHeight: {
			type: [String, Number],
			default: 300
		},
		// 输出的图片类型，如果发现裁剪的图片很大，可能是因为设置为了"png"，改成"jpg"即可
		fileType: {
			type: String,
			default: 'jpg',
		},
		// 生成的图片质量
		// H5上无效，目前不考虑使用此参数
		quality: {
			type: [Number, String],
			default: 1
		}
	},
	model: {
		prop: 'value',
		event: 'change'
	},
	data() {
		return {
			show: false,
			src: this.value,
			cropperOpt: {
				ctx: uni.createCanvasContext('cropper',this),
				targetCtx: uni.createCanvasContext('targetId',this),
				pixelRatio: uni.getSystemInfoSync().pixelRatio,
				id: 'cropper',
				targetId: 'targetId',
				width: 350,
				height: 350,
				scale: 2.5,
				zoom: 8,
				cut: {
					x: (350 - 200) / 2,
					y: (350 - 200) / 2,
					width: 200,
					height: 200
				},
				boundStyle: {
					lineWidth: uni.upx2px(8),
					color: 'rgb(245, 245, 245)',
					mask: 'rgba(0, 0, 0, 0.6)'
				}
			}
		}
	},
	watch: {
		value(val) {
			this.src = val
		}
	},
	methods: {
		chooseAvatar() {
			uni.chooseImage({
				count: 1,
				success: res => {
					this.show = true
					this.cropperOpt.src = res.tempFilePaths[0]
					this.cropper = new WeCropper(this.cropperOpt)
				}
			})
		},
		hideModal() {
			this.show = false
		},
		touchStart(e) {
			this.cropper.touchStart(e)
		},
		touchMove(e) {
			this.cropper.touchMove(e)
		},
		touchEnd(e) {
			this.cropper.touchEnd(e)
		},
		getCropperImage() {
			const cropper_opt = {
				componentContext: this,
				destHeight: Number(this.destWidth),
				destWidth: Number(this.destWidth),
				fileType: this.fileType
			}
			this.cropper.getCropperImage(cropper_opt, (path, err) => {
				if (err) {
					uni.showModal({
						title: '温馨提示',
						content: err.message
					})
				} else {
					this.show = false
					this.src = path
					this.$emit('change', path)
				}
			})
		}
	}
}
</script>

<style>
	.container {
		width: 100%;
	}

	.cropper-wrapper {
		position: relative;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.cropper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 11;
	}
	
	.grid .close {
		 position: absolute;
		 top: 0;
		 right: 0;
		 display: flex;
		 justify-content: center;
		 align-items: center;
		 width: 40rpx;
		 height: 40rpx;
		 font-size: 30rpx;
		 color: #fff;
		 background: rgba(0,0,0,.5);
		 border-radius: 6rpx;
	}
</style>
