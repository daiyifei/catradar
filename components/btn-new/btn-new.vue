<template>
	<view>
		<view class="cu-avatar round lg bg-gradual-blue cuIcon-add btn-new margin" @tap="onTap"></view>
	</view>
</template>

<script>
	export default {
		props: {
			url: {
				type: String,
				default: 'edit'
			},
			chooseImage: Boolean
		},
		data() {
			return {
				
			}
		},
		methods: {
			onTap() {
				if(this.chooseImage){
					uni.chooseImage({
						success: res => {
							uni.navigateTo({
								url: this.url + '?paths=' + JSON.stringify(res.tempFilePaths)
							})
						}
					})
				}else {
					uni.navigateTo({
						url: this.url
					})
				}
			}
		}
	}
</script>

<style>
	.btn-new {
		position: fixed;
		right: 0;
		bottom: var(--window-bottom);
		opacity: .9;
	}
</style>
