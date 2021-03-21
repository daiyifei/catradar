<template>
	<view>
		<index-list :scrollTop="scrollTop" :list="list">
			<view class="cu-load loading text-gray" v-if="loading"></view>
			<view class="cu-load text-gray" v-else-if="!list.length">暂无结果</view>
		</index-list>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				scrollTop: 0,
				state: 0,
				loading: false,
				list: []
			}
		},
		async onLoad(options) {
			this.state = parseInt(options.state)
			this.fetchData()
			uni.$on('refresh',() => {
				this.fetchData()
			})
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop
		},
		async onPullDownRefresh() {
			await this.fetchData()
			uni.stopPullDownRefresh()
		},
		methods: {
			async fetchData() {
				this.loading = true
				uni.setNavigationBarTitle({
					title: this.$root.$options.filters.state(this.state)
				})
				const { result: { data } } = await db.collection('list').where({
					state: this.state
				}).get()
				this.list = data
				this.loading = false
			}
		}
	}
</script>

<style>

</style>
