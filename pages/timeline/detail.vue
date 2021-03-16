<template>
	<view>
		<view class="cu-load loading text-gray" v-if="loading"></view>
		<timeline-item :item="item" v-else/>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				item: {},
				loading: true
			}
		},
		async onLoad(options) {
			const { data } = await this.$request('timeline','getList',{
				id: options.id
			})
			this.item = data
			this.loading = false
		}
	}
</script>

<style>
</style>
