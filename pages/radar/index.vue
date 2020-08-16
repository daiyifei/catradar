<template>
	<view>
		<map class="map" :latitude="latitude" :longitude="longitude" :markers="markers" :controls="controls" :scale="scale"
		 @markertap="showList" @controltap="reset"></map>
		 
		 <cover-view class="cover">text</cover-view>

<!-- 		<view class="cu-modal flex justify-center align-center" :class="show?'show':''" @tap="reset">
			<view class="list">
				<view class="list-item" :style="[{'animation-delay': ((index)*0.05) + 's'}]" v-for="(item,index) in list" :key="index"
				 @tap.stop="toDetail(item._id)">
					<image :src="item.avatar" class="avatar"></image>
					<text class="name">{{item.name}}</text>
				</view>
			</view>
		</view> -->
		
	</view>
</template>

<script>
	import locations from '@/static/locations.json'
	export default {
		data() {
			return {
				latitude: 32.0966,
				longitude: 118.917,
				scale: 17,
				markers: [],
				controls: [{
					iconPath: '/static/reset.png',
					position: {
						left: 9999,
						top: 9999,
						width: 35,
						height: 35
					},
					clickable: true
				}],
				list: [],
				show: false
			}
		},
		onLoad() {
			// this.fetchData()
			const {
				windowHeight,
				windowWidth
			} = uni.getSystemInfoSync()
			this.controls[0].position.top = windowHeight - 50
			this.controls[0].position.left = windowWidth - 50
		},
		methods: {
			fetchData() {
				this.$request('list', 'getStat').then(res => {
					const markers = []
					res.data.forEach(item => {
						if (item._id !== undefined) {
							markers.push({
								id: item._id,
								iconPath: '/static/location.png',
								width: 40,
								height: 40,
								latitude: locations[item._id].latitude,
								longitude: locations[item._id].longitude
							})
						}
					})
					this.markers = markers
				})
			},
			showList(e) {
		
				const location = e.detail.markerId
				this.show = true
				this.scale = 19
				this.latitude = locations[location].latitude
				this.longitude = locations[location].longitude
				this.$get('list', {
					location: parseInt(location)
				}).then(res => {
					this.list = res.data
				})
			},
			reset() {
				if (this.latitude == 32.0966 && this.longitude == 118.917) {
					this.latitude = this.latitude + 0.000001
					this.longitude = this.longitude + 0.000001
				} else {
					this.latitude = 32.0966
					this.longitude = 118.917
				}
				this.list = []
				this.show = false
				this.scale = 17
			},
			toDetail(id) {
				uni.navigateTo({
					url: '/pages/list/detail?id=' + id
				})
			}
		}
	}
</script>

<style>
	.cover {
		position: absolute;
		top: 200rpx;
		left: 200rpx;
		z-index: 9999999;
	}
	
	.map {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: var(--window-bottom);
		width: 750rpx;
		height: 110vh;
	}
	
	.list {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		max-width: 80%;
	}

	.list-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 10rpx;
		padding: 10rpx;
		transform: scale(0);
		animation: scale-up .5s forwards;
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
	}

	.name {
		margin-top: 10rpx;
		padding: 4rpx 10rpx;
		font-size: 28rpx;
		color: #fff;
		background-color: rgba(0, 0, 0, .5);
		border-radius: 10rpx;
	}

	@keyframes show {
		0% {
			transform: translateY(-50rpx);
		}

		60% {
			transform: translateY(40rpx);
		}

		100% {
			transform: translateY(0px);
		}
	}

	@keyframes scale-up {
		0% {
			opacity: 0;
			transform: scale(.2)
		}

		100% {
			opacity: 1;
			transform: scale(1)
		}
	}
</style>
