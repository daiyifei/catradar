<template>
	<view>
		<view @tap="showDrawer">
			<text class="cuIcon-rank"></text>
			<text>统计</text>
		</view>
		<view class="cu-modal drawer-modal justify-end" :class="show ? 'show' : ''" @tap.stop="hideDrawer" @touchmove.stop.prevent>
			<view class="cu-dialog bg-white basis-lg" @tap.stop="">
				<scroll-view scroll-y @touchmove.stop.prevent style="height: 100vh;">
					<view class="cu-bar bg-white solid-bottom">
						<view class="action">
							<text class="cuIcon-title text-blue"></text>统计
						</view>
					</view>
					<view class="solid-bottom" v-for="(item,index) in keys" :key="index">
						<view class="padding text-left padding-bottom-sm text-sm">{{item.label}}</view>
						<pie-chart :width="450" :series="charts[item.key]"/>
					</view>
				</scroll-view>
			</view>
		</view>		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				show: false,
				keys: [{
					key: 'female',
					label: '性别'
				}, {
					key: 'neuter',
					label: '绝育'
				}, {
					key: 'color',
					label: '花色'
				}, {
					key: 'location',
					label: '位置'
				}],
				charts: {}
			}
		},
		methods: {
			showDrawer() {
				this.show = true
				this.fetchData()
			},
			hideDrawer() {
				this.show = false
			},
			fetchData() {
				this.keys.forEach(item => {
					this.$request('list', 'getStat', {
						key: item.key
					}).then(({data}) => {
						this.total = data.total
						const series = []
						data.data.forEach(data => {
							series.push({
								name: this.$root.$options.filters[item.key](data._id),
								data: data.num
							})
						})
						this.$set(this.charts, item.key, series)
					})
				})
			}
		}
	}
</script>

<style>
</style>
