<template>
	<view>
		<index-list :scrollTop="scrollTop" :condition="condition"  ref="indexList"/>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				scrollTop: 0,
				condition: {}
			}
		},
		onLoad(e) {
			const state = parseInt(e.state)
			uni.setNavigationBarTitle({
				title: ['流浪中','待领养','已领养','失踪中','回喵星'][state]
			})
			this.condition.state = state
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		onPullDownRefresh() {
			this.$refs.indexList.fetchData()
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
