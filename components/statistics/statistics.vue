<template>
	<view>
		<view @tap="showDrawer">
			<text class="cuIcon-rank"></text>
			<text>统计</text>
		</view>
		<view class="cu-modal drawer-modal justify-end" :class="show ? 'show' : ''" @tap.stop="hideDrawer" @touchmove.stop.prevent>
			<view class="cu-dialog bg-white basis-lg" @tap.stop="">
				<scroll-view scroll-y @touchmove.stop.prevent style="height: 100vh;">
					<view class="solid-bottom" v-for="(item,index) in keys" :key="index" v-show="show">
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
			async fetchData() {
				uni.showLoading()
				await Promise.all(
					this.keys.map(async ({key}) => {
						const { data: { data, total } } = await this.$request('list', 'getStat', {
							base_id: this.baseInfo._id,
							key
					  })
						this.total = total
						const series = []
						data.map(item => {
							series.push({
								name: this.$root.$options.filters[key](item._id),
								data: item.num
							})
						})
						this.$set(this.charts, key, series)
					}))
				uni.hideLoading()
			}
		}
	}
</script>

<style>
	.cu-dialog {
		padding-top: var(--status-bar-height);
	}
</style>
