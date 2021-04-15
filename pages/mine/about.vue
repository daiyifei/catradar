<template>
	<view>
		<u-navbar :background="{background:'linear-gradient(45deg, #39b54a, #8dc63f)'}" title="关于" title-color="#fff" back-icon-color="#fff" />
		
		<view class="margin padding bg-white">
			<view class="text-lg text-center margin-bottom">关于猫雷达</view>
			
			<view class="margin-bottom-sm">这是一款帮助社区和高校进行区域化流浪猫管理的神器：</view>
			<view class="margin-bottom-xs">1. 以社区为单位管理流浪猫</view>
			<view class="margin-bottom-xs">2. 社区志愿者可自行建立猫区，共同管理流浪猫</view>
			<view class="margin-bottom-xs">3. 通过就近领养让更多猫咪找到靠谱的主人</view>
			<view class="margin-bottom">4. 成员可发布猫咪动态，互相交流</view>
			
			<view class="copyright">
				本项目为<text @tap="copyLink" class="text-olive text-bold">开源项目(点击复制仓库地址)</text>，不收取任何费用。如果您觉得有帮助，可以
				<text @tap="donate" class="text-orange text-bold">赞赏支持</text>我。
			</view>
			<view class="margin-top margin-bottom-sm">观看操作视频：</view>
			<video src="https://static-6ee74e1a-9337-4754-92e2-f7b377cdd878.bspapp.com/img/video.mp4" id="video" class="video" @play="onPlay" objectFit="contain"></video>
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
			copyLink() {
				uni.setClipboardData({
					data: 'https://github.com/daiyifei/catradar',
					success: () => {
						this.$u.toast('已复制')
					}
				})
			},
			donate() {
				uni.previewImage({
					urls: ['https://static-6ee74e1a-9337-4754-92e2-f7b377cdd878.bspapp.com/img/donate.jpg']
				})
			},
			onPlay() {
				const videoCtx = uni.createVideoContext('video', this)
				videoCtx.requestFullScreen()
			}
		}
	}
</script>

<style>
.copyright {
	line-height: 1.75em;
}

.video {
	width: 100%;
}
</style>
