<template>
	<view class="container bg-white padding">
		<timeline-item :item="item" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				item: {}
			}
		},
		async onLoad(options) {
			const { data } = await this.$request('timeline','getList',{
				id: options.id
			})
			this.item = data
		}
	}
</script>

<style>
</style>
