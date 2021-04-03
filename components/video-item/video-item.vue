<template>
	<view>
		<video id="video" :src="src" objectFit="cover" :controls="false" loop class="margin-tb-sm video radius" @ended="onEnd"
			@tap.stop.prevent="onTap"></video>
	</view>
</template>

<script>
	export default {
		name: "video-item",
		props: {
			src: String
		},
		data() {
			return {
				videoCtx: uni.createVideoContext('video', this),
				playing: false,
				fullscreen: false,
				ended: true
			}
		},
		mounted() {
			setTimeout(() => {
				const observer = uni.createIntersectionObserver(this)
				observer.relativeToViewport({
					top: -200,
					bottom: -200,
				}).observe('#video', res => {
					if (res.intersectionRatio > 0) {
						// 进入视口
						this.videoCtx.play()
						this.playing = true
					}else {
						// 离开视口
						this.videoCtx.pause()
						this.playing = false
					}
				})
			},30)
		},
		methods: {
			onEnd() {
				this.videoCtx.seek(0)
				this.ended = true
				this.playing = false
			},
			onTap() {
				if (this.playing) {
					if (this.fullscreen) {
						this.videoCtx.exitFullScreen()
						this.fullscreen = false
					} else {
						this.videoCtx.requestFullScreen()
						this.fullscreen = true
					}
				} else {
					this.videoCtx.play()
					this.playing = true
				}
			}
		}
	}
</script>

<style>	
	.video {
		padding-bottom: 133%;
		width: 100%;
		height: 0;
	}
</style>
