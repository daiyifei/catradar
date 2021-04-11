<template>
	<view>
		<video id="video" ref="video" :src="src" :objectFit="fullscreen?'contain':'cover'" :controls="false" loop :muted="!fullscreen" class="margin-tb-sm video radius" :direction="0" @fullscreenchange="onFullscreenchange" @play="onPlay" @pause="onPause"
			@tap.stop.prevent="onTap" @longpress.stop.prevent="onLongpress"></video>
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
				fullscreen: false
			}
		},
		mounted() {
			setTimeout(() => {
				const observer = uni.createIntersectionObserver(this)
				observer.relativeToViewport({
					top: -100,
					bottom: -100,
				}).observe('#video', res => {
					if (res.intersectionRatio > 0) {
						// 进入视口
						this.videoCtx.play()
					}else {
						// 离开视口
						this.videoCtx.pause()
					}
				})
			},30)
		},
		methods: {
			onPlay() {
				this.playing = true
			},
			onPause() {
				this.playing = false
			},
			onFullscreenchange(e) {
				this.fullscreen = e.detail.fullscreen
			},
			onTap() {
				if (this.playing) {
					this.fullscreen ? this.videoCtx.exitFullScreen() : this.videoCtx.requestFullScreen()
				} else {
					this.videoCtx.play()
				}
			},
			onLongpress() {
				if(this.fullscreen) {
					uni.vibrateShort()
					uni.showActionSheet({
						itemList: ['保存视频'],
						success: ({tapIndex}) => {
							this.saveVideo()
						}
					})
				}
			},
			async saveVideo(index) {
				// #ifndef H5
				uni.getSetting({
					success: ({authSetting}) => {
						if(authSetting['scope.writePhotosAlbum']) {
							uni.showLoading({
								title: '下载中'
							})
							uni.downloadFile({
								url: this.src,
								success: ({tempFilePath}) => {
									uni.hideLoading()
									uni.saveVideoToPhotosAlbum({
										filePath: tempFilePath
									})
								},
								fail: err => {
									this.$u.toast(err)
								}
							})
						}else {
							this.$u.toast('请授权相册')
							openSetting()
						}
					},
				})
				// #endif
			}
		}
	}
</script>

<style>	
	.video {
		padding-bottom: 133%;
		width: 100%;
		height: 0;
		z-index: 0;
		overflow: hidden;
	}
	
	.cu-dialog {
		border-radius: 10px 10px 0 0 !important;
		overflow: hidden;
		color: #000000;
	}
	
	.cu-list.menu>.cu-item {
		justify-content: center;
	}
</style>
