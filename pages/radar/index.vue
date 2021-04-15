<template>
	<view>
		<u-navbar :is-back="false" ref="navbar" :background="{background:`linear-gradient(45deg, rgba(0,129,255,1), rgba(28,187,180,1))`}" class="navbar">
			<navigator class="padding text-white" url="bases">
				<text class="cuIcon-locationfill margin-right-xs"></text>
				<text>{{hasBase?baseInfo.name:'选择猫区'}}</text>
				<text class="cuIcon-triangledownfill"></text>
			</navigator>
		</u-navbar>
		<map 
			id="map" 
			ref="map" 
			class="map"
			:latitude="latitude" 
			:longitude="longitude" 
			:markers="markers"
			:include-points="markers"
			:scale="scale"
			:controls="controls"
			@controltap="onControl"
			@markertap="showCatList"
			show-location>
		</map>
		<!-- 猫咪列表 -->
		<view class="cu-modal flex justify-center align-center" :class="catList.length?'show':''" @tap="hideCatList" v-if="catList.length">
			<view class="list">
				<view class="list-item" :style="[{'animation-delay': ((index)*0.05) + 's'}]"
					v-for="(item,index) in catList" :key="index" @tap.stop="toCatDetail(item._id)">
					<image :src="item.avatar" class="avatar" />
					<view class="name">{{item.name}}</view>
				</view>
			</view>
		</view>
		
		<!-- 控制区域 -->
		<view class="control flex align-center justify-between">
			<image class="reset radius margin" src="/static/reset.png" @tap="getLocation"></image>
			<view v-if="hasBase" class="margin" @tap="showBase">
				<image class="cu-avatar round lg" :src="baseInfo.avatar" v-if="baseInfo.avatar"></image>
				<text class="cu-avatar round lg bg-gradual-blue" v-else-if="baseInfo.name">{{baseInfo.name[0]}}</text>
			</view>
			<navigator class="cu-avatar cuIcon-location round lg margin bg-gradual-blue" url="bases" v-else></navigator>
		</view>
		
		<!-- #ifdef APP-PLUS -->
		<circle-img :value="baseInfo.avatar" />>
		<!-- #endif -->
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				windowHeight: 0,
				latitude: '',
				longitude: '',
				scale: 17,
				markers: [],
				controls: [],
				catList: []
			}
		},
		watch: {
			baseInfo: {
				handler(newVal, oldVal) {
					if(newVal&&!oldVal || newVal._id !== oldVal._id) {
						this.showBase()
					}
				},
				immediate: true
			}
		},
		onLoad() {
			this.getLocation()
		},
		async onReady() {
			// #ifdef APP-PLUS
			const { windowHeight } = this.$u.sys()
			const { height } = await this.$u.getRect('.navbar')
			this.windowHeight = windowHeight - height
			this.controls.push({
				id: 0,
				iconPath: '/static/reset.png',
				position: {
					top: this.windowHeight - 55,
					left: 15,
					width: 35,
					height: 35
				},
				clickable: true
			})
			
			uni.$on('circle-img', path => {
				this.controls.push({
					id: 1,
					iconPath: path,
					position: {
						top: this.windowHeight - 70,
						left: this.$u.sys().windowWidth - 70,
						width: 55,
						height: 55
					},
					clickable: true
				})
			})
			
			const map = uni.createMapContext('map')
			const appMap = map.$getAppMap()
			appMap.showUserLocation(true)
			this.scale = 18
			// #endif
		},
		methods: {
			onControl({detail: {controlId}}) {
				controlId === 0 ? this.getLocation() : this.showBase()
			},
			getLocation() {
				uni.getLocation({
					type:'gcj02',
					success: res => {
						this.latitude = res.latitude
						this.longitude = res.longitude
						const map = uni.createMapContext('map')
						map.moveToLocation()
					}
				})
			},
			async showBase() {
				if(!this.hasBase) {
					this.hideBase()
					return
				}

				uni.showToast({
					icon: "loading",
					title: '加载中'
				})
				
				const markers = [],
					{ locations = [], _id } = this.baseInfo,
					{ data: { data: list } } = await this.$request('list', 'getStat', {
						base_id: _id,
						key: 'location'
					})
					
				list.forEach(item => {
					if (item._id) {
						const location = locations.find(v => v.id === item._id)
						markers.push({
							id: item._id,
							iconPath: '/static/location.png',
							width: 40,
							height: 40,
							latitude: location.latitude,
							longitude: location.longitude
						})
					}
				})
				const map = uni.createMapContext('map')
				map.moveToLocation(this.baseInfo)
				this.markers = markers
				uni.hideToast()
			},
			hideBase() {
				this.markers = []
				this.controls.pop()
				this.getLocation()
			},
			async showCatList(e) {
				const id = e.detail.markerId,
					location = this.markers.find(v => v.id === id)
				this.scale += 2
				this.latitude = location.latitude
				this.longitude = location.longitude
				
				const { result: { data } } = await db.collection('list').where({
					state: 0,
					location: location.id
				}).get()

				// #ifdef APP-PLUS
				const modal = uni.getSubNVueById('modal')
				modal.show('fade-in', 500)
				uni.$emit('modal-popup', data)
				uni.$once('modal-hide', () => {
					this.hideCatList()
					modal.hide()
				})
				return
				// #endif
				this.showModal = true
				this.catList = data
			},
			hideCatList() {
				this.catList = []
				this.scale -= 2
			},
			toCatDetail(id) {
				uni.navigateTo({
					url: '/pages/list/detail?id=' + id
				})
			}
		},
		onShareAppMessage() {
			return {
				title: '猫雷达: 发现身边的猫',
				imageUrl: 'https://static-6ee74e1a-9337-4754-92e2-f7b377cdd878.bspapp.com/img/share.jpg'
			}
		}
	}
</script>

<style>
	.map {
		position: fixed;
		width: 100%;
		height: 100vh;
		mix-blend-mode: normal;
		z-index: 0;
	}
	
	.control {
		position: fixed;
		bottom: var(--window-bottom);
		left: 0;
		right: 0;
	}
	
	.control image {
		box-shadow: 3px 3px 4px rgba(26, 26, 26, 0.2);
	}
	
	.reset {
		width: 70rpx;
		height: 70rpx;
	}
	
	.bottom-modal {
		padding-bottom: var(--window-bottom);
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
	}
	
	.cu-btn {
		flex-shrink: 0;
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
