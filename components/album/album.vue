<template>
	<view>
		<view class="flex" v-if="isVideo">
			<video-item :src="urls[0]" class="basis-lg"></video-item>
		</view>
		<view class="grid grid-square margin-top-sm" :class="urls.length>1?'col-3':'col-2'" v-else>
			<view class="bg-img" v-for="(pic,idx) in urls" :key="idx" @tap.stop.prevent="preview(urls,idx)">
				<u-image :src="pic" :height="urls.length>1?'200rpx':'300rpx'" />
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"album",
		props: {
			urls: Array
		},
		computed: {
			isVideo() {
				return this.urls[0].split('.').pop() === 'mp4'
			}
		},
		methods: {
			preview(urls, current) {
				uni.previewImage({
					urls,
					current
				})
			},
		}
	}
</script>

<style>

</style>
