<template>
	<view>
		<!-- #ifdef MP-ALIPAY -->
		<canvas :canvas-id="id" :id="id" @touchstart="showTip" :style="{'width':cWidth*pixelRatio+'px','height':cHeight*pixelRatio+'px', 'transform': 'scale('+(1/pixelRatio)+')','margin-left':-cWidth*(pixelRatio-1)/2+'px','margin-top':-cHeight*(pixelRatio-1)/2+'px'}"></canvas>
		<!-- #endif -->
		<!-- #ifndef MP-ALIPAY -->
		<canvas :canvas-id="id" :id="id" @touchstart="showTip" :style="{'width':cWidth+'px','height':cHeight+'px'}"></canvas>
		<!-- #endif -->
	</view>
</template>

<script>
	import uCharts from '@/uni_modules/u-charts/u-charts/u-charts.js'
	export default {
		props: {
			width: {
				type: Number,
				default: 750
			},
			height: Number,
			series: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				id: '',
				chart: '',
				cWidth: '',
				cHeight: '',
				pixelRatio: 1,
				total: 0
			}
		},
		created() {
			this.id = Math.ceil(Math.random()*1000000) + ''
			this.cWidth = uni.upx2px(this.width)
			this.cHeight = uni.upx2px(this.height ? this.height : this.width)
			// #ifdef MP-ALIPAY
			this.pixelRatio = uni.getSystemInfoSync().pixelRatio
			// #endif
		},
		watch: {
			series(newValue, oldValue) {
				this.showChart()
			}
		},
		methods: {
			showChart() {
				this.chart = new uCharts({
					$this: this,
					canvasId: this.id,
					type: 'ring',
					animation: true,
					width: this.cWidth * this.pixelRatio,
					height: this.cHeight * this.pixelRatio,
					fontSize: 10,
					pixelRatio: this.pixelRatio,
					legend: {
						show: true,
						lineHeight: 24
					},
					series: this.series,
					dataLabel: true,
					extra: {
						pie: {
							offsetAngle: 60,
							ringWidth: 20 * this.pixelRatio,
							labelWidth: 5
						}
					}
				})
			},
			showTip(e) {
				if(this.chart) {
					this.chart.showToolTip(e, {
						format: function(item) {
							return item.name + ':' + item.data
						}
					})
				}
			}
		}
	}
</script>

<style>
</style>
