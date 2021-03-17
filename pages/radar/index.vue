<template>
	<view>
		<u-navbar :is-back="false" ref="navbar" :background="{background:`linear-gradient(45deg, rgba(0,129,255,1), rgba(28,187,180,1))`}">
			<view class="padding text-white" @tap="showBaseList">
				<text class="cuIcon-locationfill margin-right-xs"></text>
				<text>{{hasBase?baseInfo.name:'选择基地'}}</text>
				<text :class="baseList.length ? 'cuIcon-triangleupfill' : 'cuIcon-triangledownfill'"></text>
			</view>
		</u-navbar>
		<map id="map" ref="map" class="map" :latitude="latitude" :longitude="longitude" :markers="markers"
			:scale="scale" @markertap="showCatList" show-location @controltap="getLocation">
			<!-- 定位按钮 -->
			<image class="reset" @tap="getLocation" src="/static/reset.png"></image>
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
			<!-- 基地列表 -->
			<view class="cu-modal bottom-modal" :class="baseList.length?'show':''" @tap="baseList=[]" v-if="baseList.length">
				<view class="cu-dialog" @tap.stop.prevent>
					<view class="cu-bar bg-white solid-bottom">
						<view class="action">
							<text class="cuIcon-title text-blue"></text> 基地列表
						</view>
						<view class="action" @tap="baseList=[]">
							<text class="cuIcon-close text-red"></text>
						</view>
					</view>
					<view class="cu-list menu-avatar">
						<view class="cu-item" v-for="(item,index) in baseList" :key="index" @tap="showBase">
							<image :src="item.avatar" class="cu-avatar round lg" @tap.stop.prevent="toBaseDetail(item._id)"/>
							<view class="content">
								<view class="text-grey">{{item.name}}</view>
								<view class="text-gray text-sm flex">
									<view class="text-cut">距离{{item.distance | distance}}</view>
								</view>
							</view>
							<view class="action margin-sm" @tap.stop.prevent="subscribe(item)">
								<view class="text-gray text-sm" v-if="~userInfo.subscribes.indexOf(item._id)">退出</view>
								<view class="action cu-tag round light bg-blue" v-else>加入</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</map>
	</view>
</template>

<script>
	const db = uniCloud.database()
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import locations from '@/static/locations.json'
	export default {
		data() {
			return {
				latitude: '',
				longitude: '',
				scale: 17,
				markers: [],
				baseList: [],
				catList: []
			}
		},
		computed: mapState(['hasLogin', 'userInfo', 'hasBase', 'baseInfo']),
		watch: {
			hasBase(val) {
				if(val) {
					this.showBase()
				}else {
					this.hideBase()
				}
			}
		},
		onLoad() {
			this.getLocation()
		},
		methods: {
			...mapMutations(['enter', 'quit']),
			getLocation() {
				uni.getLocation({
					type:'gcj02',
					success: res => {
						this.latitude = res.latitude
						this.longitude = res.longitude
						const map = uni.createMapContext('map')
						map.moveToLocation()
					},
					fail(err) {
						this.$u.toast(err.message)
					}
				})
			},
			async showBase() {
				if(!this.hasBase) 
					return

				uni.showLoading()
				
				const map = uni.createMapContext('map')
				map.moveToLocation(this.baseInfo)
				
				const { data: { data: list } } = await this.$request('list', 'getStat', {
					key: 'location'
				})
				const markers = []
				list.forEach(item => {
					if (item._id !== undefined && item._id !== null) {
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
				uni.hideLoading()
			},
			hideBase() {
				this.markers = []
				this.getLocation()
			},
			async showBaseList() {
				if(!this.hasLogin) {
					this.$u.toast('请先登录')
					return
				}
				uni.showLoading()
				const { result : { data } } = await db.collection('bases').get()
				data.map(item => {
					item.distance = this.getDistance(this, item)
				})
				this.baseList = data
				uni.hideLoading()
			},
			async subscribe(item) {
				const { subscribes = [] } = this.userInfo
				const { _id: id } = item
				if(~subscribes.indexOf(id)) {
					subscribes.splice(subscribes.indexOf(id),1)
					this.quit()
				}else {
					subscribes.push(id)
					this.enter(item)
				}
				await db.collection('uni-id-users').doc(this.userInfo._id).update({
					subscribes 
				})
				this.$u.toast(~subscribes.indexOf(id) ? '已加入' : '已退出')
			},
			toBaseDetail(id) {
				if(!this.hasBase)
					return
				uni.navigateTo({
					url: '/pages/radar/detail?id=' + id
				})
			},
			async showCatList(e) {
				const location = e.detail.markerId
				this.scale = 19
				this.latitude = locations[location].latitude
				this.longitude = locations[location].longitude
				
				const { result: { data } } = await db.collection('list').where({
					state: 0,
					location: parseInt(location)
				}).get()

				// #ifdef APP-PLUS
					const modal = uni.getSubNVueById('modal')
					modal.show('fade-in', 500)
					uni.$emit('modal-popup', data)
					uni.$on('modal-hide', () => {
						modal.hide()
						this.getLocation()
					})
					return
				// #endif
				this.showModal = true
				this.catList = data
			},
			hideCatList() {
				this.catList = []
				this.scale = 17
			},
			toCatDetail(id) {
				uni.navigateTo({
					url: '/pages/list/detail?id=' + id
				})
			},
			getDistance(location1, location2){
				const { latitude: lat1, longitude: lng1 } = location1,
					{ latitude: lat2, longitude: lng2 } = location2
				let radLat1 = lat1*Math.PI / 180.0;
				let radLat2 = lat2*Math.PI / 180.0;
				let a = radLat1 - radLat2;
				let  b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
				let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
				Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
				s = s *6378.137 ;// EARTH_RADIUS;
				s = Math.round(s * 10000) / 10000;
				return s; //km
			}
		},
		onShareAppMessage() {}
	}
</script>

<style>
	.map {
		position: fixed;
		bottom: 0;
		width: 100%;
		height: 100vh;
	}
	
	.reset {
		position: absolute;
		right: 0;
		bottom: var(--window-bottom);
		margin-right: 35rpx;
		margin-bottom: 70rpx;
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
