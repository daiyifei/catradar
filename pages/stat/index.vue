<template>
	<view>
		<cu-custom bgColor="bg-gradual-blue">
			<block slot="content">统计</block>
		</cu-custom>
		<scroll-view scroll-x class="bg-white nav text-center">
			<view class="cu-item" :class="item.key===keys[currTab].key?'text-blue cur':''" v-for="(item,index) in keys" :key="index" @tap="tabSelect(index)">
				{{item.label}}
			</view>
		</scroll-view>
		<swiper class="swiper" circular @change="tabChange" :current="currTab">
			<swiper-item v-for="(item,index) in keys" :key="index" class="swiper-item">
				<!-- #ifdef MP-ALIPAY -->
				<canvas :canvas-id="'chart'+index" :id="'chart'+index" class="chart bg-white" @touchstart="showTip" :style="{'width':cWidth*pixelRatio+'px','height':cHeight*pixelRatio+'px', 'transform': 'scale('+(1/pixelRatio)+')','margin-left':-cWidth*(pixelRatio-1)/2+'px','margin-top':-cHeight*(pixelRatio-1)/2+'px'}"></canvas>
				<!-- #endif -->
				<!-- #ifndef MP-ALIPAY -->
				<canvas :canvas-id="'chart'+index" :id="'chart'+index" class="chart bg-white" @touchstart="showTip"></canvas>
				<!-- #endif -->
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import uCharts from '../../js_sdk/u-charts/u-charts/u-charts.js'
	const charts = []
	export default {
		data() {
			return {
				total: '',
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
				currTab: 0,
				cWidth: '',
				cHeight: '',
				pixelRatio: 1
			}
		},
		onLoad() {
			this.cWidth = uni.upx2px(750)
			this.cHeight = uni.upx2px(750)
			// #ifdef MP-ALIPAY
			this.pixelRatio = uni.getSystemInfoSync().pixelRatio
			// #endif
			this.fetchData()
		},
		methods: {
			fetchData() {
				const { key } = this.keys[this.currTab],
					chartId = 'chart' + this.currTab
				if(charts[chartId]) {
					// charts[chartId].updateData({
					// 	animation: true
					// })
				}else {
					this.$request('list', 'getStat', {
						key
					}).then(res => {
						const series = []
						this.total = res.total
						res.data.forEach(data => {
							series.push({
								name: this.$root.$options.filters[key](data._id),
								data: data.num
							})
						})
						this.showChart(chartId, series)
					})
				}
			},
			tabSelect(index) {
				this.currTab = index
				this.fetchData()
			},
			tabChange(e) {
				this.currTab = e.detail.current
				this.fetchData()
			},
			showChart(canvasId, series) {
				charts[canvasId] = new uCharts({
					$this: this,
					canvasId: canvasId,
					type: 'ring',
					animation: true,
					width: this.cWidth * this.pixelRatio,
					height: this.cHeight * this.pixelRatio,
					pixelRatio: this.pixelRatio,
					legend: {
						show: true,
						lineHeight: 24
					},
					series: series,
					dataLabel: true,
					extra: {
						pie: {
							offsetAngle: 60,
							ringWidth: 40 * this.pixelRatio,
							labelWidth: 15
						}
					}
				})
			},
			showTip(e) {
				charts['chart' + this.currTab].showToolTip(e, {
					format: function(item) {
						return item.name + ':' + item.data
					}
				})
			}
		}
	}
</script>

<style>
	.swiper,
	.chart {
		width: 750rpx;
		height: 750rpx;
	}
</style>
