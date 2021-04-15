<template>
	<view>
		<canvas canvas-id="canvas" id="canvas" style="width: 100rpx;height: 100rpx; position: fixed;opacity: 0;"></canvas>
		<image :src="value" style="width: 100rpx;height: 100rpx" mode="aspectFill"></image>
	</view>
</template>

<script>
	export default {
		name:"circle-img",
		props: {
			value: String
		},
		watch: {
			value(val) {
				this.drawImg(val).then(res => {
					uni.$emit('circle-img', res)
				})
			}
		},
		methods: {
			drawImg() {
				return new Promise((resolve,reject) => {
					const ctx = uni.createCanvasContext('canvas')
					const view = uni.createSelectorQuery().in(this).select('#canvas');
					view.fields({
						size: true
					}, data => {
						const avatarWidth = data.width
						const avatarLeft = avatarWidth / 2
						const avatarTop = data.height
						ctx.beginPath()
						ctx.arc(avatarWidth / 2, avatarWidth / 2, avatarWidth / 2, 0, Math.PI * 2, false);
						ctx.clip()
						ctx.drawImage(this.value, 0, 0, avatarWidth, avatarWidth)
						ctx.closePath()
						ctx.restore()
						ctx.draw(true, () => {
							uni.canvasToTempFilePath({
								canvasId: 'canvas',
								success: res => {
									resolve(res.tempFilePath)
								},
								fail: e => {
									reject(e)
								}
							})
						})
					}).exec()
				})
			}
		}
	}
</script>

<style>

</style>
