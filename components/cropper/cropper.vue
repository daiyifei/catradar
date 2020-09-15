<template>
	<!-- 对话框 -->
	<view class="cu-modal" :class="show?'show':''">
		<view class="cu-dialog">
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
						:width="cropperOpt.width"
						:height="cropperOpt.height"
						canvas-id="cropper"
						id="cropper"
					></canvas>
					<canvas
						class="cropper"
						:disable-scroll="true"
						:style="{
							position: 'fixed',
							top: `-${cropperOpt.width * cropperOpt.pixelRatio}px`,
							left: `-${cropperOpt.height * cropperOpt.pixelRatio}px`,
							width: `${cropperOpt.width * cropperOpt.pixelRatio}px`,
							height: `${cropperOpt.height * cropperOpt.pixelRatio}px`
						}"
						canvas-id="targetId"
						id="targetId"
					></canvas>
				</view>
			</view>
			<view class="cu-bar bg-white justify-end">
				<view class="action">
					<button class="cu-btn line-green text-green" @tap="hideModal">取消</button>
					<button class="cu-btn bg-green margin-left" @tap="getCropperImage">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import WeCropper from './weCropper.js'
export default {
	props: {
		src: '', // 选择的图片路径，用于在点击确定时，判断是否选择了图片
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
	data() {
		return {
			show: false,
			cropperOpt: {
				id: 'cropper',
				targetId: 'targetId',
				pixelRatio: uni.getSystemInfoSync().pixelRatio,
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
		src(val) {
			if(val) {
				this.cropperOpt.src = val
				this.cropper = new WeCropper(this.cropperOpt)
				this.show = true
			}
		}
	},
	methods: {
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
			if(!this.src) return this.$u.toast('请先选择图片再裁剪')

			const cropper_opt = {
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
					this.$emit('confirm', path)
				}
			})
		}
	}
}
</script>

<style scoped>
	.cropper {
		width: 100%;
		height: 100%;
	}
</style>
