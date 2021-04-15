<template>
	<view class="response">
		<view class="margin-tb-sm radius response" :class="guid">
			<video id="video" class="video radius" :src="src" :objectFit="fullscreen?'contain':'cover'"
				:controls="false" loop :muted="!fullscreen" :direction="0" @fullscreenchange="onFullscreenchange"
				:show-loading="false" @play="onPlay" @pause="onPause" @tap.stop.prevent="onTap" @longpress="onLongpress"
				v-if="show"></video>
			<view class="video placeholder radius" v-else>
				<view class="cuIcon-playfill play-btn" @tap="play"></view>
			</view>
		</view>
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
				show: false,
				guid: this.$u.guid(),
				playing: false,
				fullscreen: false
			}
		},
		computed: {
			videoCtx() {
				return uni.createVideoContext('video', this)
			}
		},
		mounted() {
			setTimeout(() => {
				const observer = uni.createIntersectionObserver(this)
				observer.relativeToViewport({
					top: -300,
					bottom: 0,
				}).observe('.' + this.guid, ({
					intersectionRatio
				}) => {
					if (intersectionRatio > 0) {
						// 进入视口
						this.show = true
						this.videoCtx.play()
					} else {
						// 离开视口
						this.videoCtx.stop()
					}
				})
			}, 30)
		},
		methods: {
			play() {
				this.show = true
				this.videoCtx.play()
			},
			onPlay() {
				this.playing = true
			},
			onPause() {
				this.playing = false
				if(this.fullscreen) {
					this.$nextTick(() => {
						this.videoCtx.play()
					})
				}
			},
			onFullscreenchange(e) {
				this.fullscreen = e.detail.fullscreen
			},
			onTap() {
				if(!this.play) {
					this.videoCtx.play()
				}else {
					this.fullscreen ? this.videoCtx.exitFullScreen() : this.videoCtx.requestFullScreen()
				}
			},
			onLongpress() {
				if (this.fullscreen) {
					uni.vibrateShort()
					uni.showActionSheet({
						itemList: ['保存视频'],
						success: ({
							tapIndex
						}) => {
							this.saveVideo()
						}
					})
				}
			},
			async saveVideo(index) {
				uni.showLoading({
					title: '下载中'
				})
				uni.downloadFile({
					url: this.src,
					success: ({
						tempFilePath
					}) => {
						uni.hideLoading()
						uni.saveVideoToPhotosAlbum({
							filePath: tempFilePath,
							success: () => {
								this.$u.toast('保存成功')
							}
						})
					},
					fail: err => {
						this.$u.toast(err)
					},
				})
			}
		}
	}
</script>

<style>
	.video {
		padding-bottom: 100%;
		width: 70%;
		height: 0;
		z-index: 0;
		overflow: hidden;
	}

	.placeholder {
		position: relative;
		color: #fff;
		background-color: #000;
		height: 100%;
		font-size: 50rpx;
	}

	.placeholder .play-btn {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
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
