<template>
	<view>
		<video id="video" :src="src" objectFit="cover" :controls="false" class="margin-tb-sm video" @ended="onEnd"
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
				playing: false,
				fullscreen: false,
				ended: true
			}
		},
		methods: {
			onEnd() {
				const videoContext = uni.createVideoContext('video', this)
				videoContext.seek(0)
				this.ended = true
				this.playing = false
			},
			onTap() {
				const videoContext = uni.createVideoContext('video', this)
				if (this.playing) {
					if (this.fullscreen) {
						videoContext.exitFullScreen()
						this.fullscreen = false
					} else {
						videoContext.requestFullScreen()
						this.fullscreen = true
					}
				} else {
					videoContext.play()
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
