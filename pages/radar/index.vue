<template>
	<view>
		<u-navbar :is-back="false" ref="navbar" :background="{background:`linear-gradient(45deg, rgba(0,129,255,1), rgba(28,187,180,1))`}">
			<view class="padding text-white" @tap="showBaseList">
				<text class="cuIcon-locationfill margin-right-xs"></text>
				<text>{{baseInfo?baseInfo.name:'选择基地'}}</text>
				<text :class="baseList.length ? 'cuIcon-triangleupfill' : 'cuIcon-triangledownfill'"></text>
			</view>
		</u-navbar>
		<map id="map" ref="map" class="map" :latitude="latitude" :longitude="longitude" :markers="markers"
			:scale="scale" @markertap="showCatList" show-location @controltap="getLocation">
			<!-- 定位按钮 -->
			<image class="reset" @tap="getLocation" src="/static/reset.png"></image>
			<!-- 猫咪列表 -->
			<cover-view class="cu-modal flex justify-center align-center" :class="catList.length?'show':''" @tap="hideCatList" v-if="catList.length">
				<cover-view class="list">
					<cover-view class="list-item" :style="[{'animation-delay': ((index)*0.05) + 's'}]"
						v-for="(item,index) in catList" :key="index" @tap.stop="toDetail(item._id)">
						<cover-image :src="item.avatar" class="avatar" />
						<cover-view class="name">{{item.name}}</cover-view>
					</cover-view>
				</cover-view>
			</cover-view>
			<!-- 基地列表 -->
			<view class="cu-modal bottom-modal" :class="baseList.length?'show':''" @tap="baseList=[]" v-if="baseList.length">
				<view class="cu-dialog">
					<view class="cu-list menu">
						<view class="cu-item" v-for="(item,index) in baseList" :key="index" @tap.stop="selectBase(item)">
							<text class="action text-grey">{{item.name}}</text>
							<button class="action cu-btn round line-blue" @tap="subscribe(item._id)">
								{{~userInfo.subscribe.indexOf(item._id)?'取关':'关注'}}
							</button>
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
				baseInfo: '',
				catList: []
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
		watch: {
			hasLogin(val) {
				this.showBase()
			}
		},
		onLoad() {
			this.getLocation()
			this.showBase()
		},
		methods: {
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
				if(!this.hasLogin || !this.userInfo.subscribe.length) {
					this.baseInfo = ''
					return
				}
				uni.showLoading()
				const { result: { data } } = await db.collection('bases').doc(this.userInfo.subscribe[0]).get()
				this.baseInfo = data[0]
				
				const map = uni.createMapContext('map')
				map.moveToLocation(this.baseInfo)
				
				const { data: { data: list } } = await this.$request('list', 'getStat', {
					key: 'location'
				})
				const markers = []
				list.forEach(item => {
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
				uni.hideLoading()
			},
			showBaseList() {
				if(!this.hasLogin) {
					this.$u.toast('请先登录')
					return
				}
				uni.showLoading()
				db.collection('bases').get().then(res => {
					this.baseList = res.result.data
					uni.hideLoading()
				})
			},
			selectBase(item) {
				this.baseInfo = item
				this.latitude = item.latitude
				this.longitude = item.longitude
				this.showBase()
				this.baseList = []
			},
			subscribe(id) {
				const { subscribe = [] } = this.userInfo
				if(~subscribe.indexOf(id)) {
					subscribe.splice(subscribe.indexOf(id),1)
				}else {
					subscribe.push(id)
				}
				db.collection('uni-id-users').doc(this.userInfo._id).update({
					subscribe 
				})
			},
			showCatList(e) {
				const location = e.detail.markerId
				uni.showLoading()
				this.scale = 19
				this.latitude = locations[location].latitude
				this.longitude = locations[location].longitude
				db.collection('list').where({
					state: 0,
					location: parseInt(location)
				}).get().then(res => {
					uni.hideLoading()
					// #ifdef APP-PLUS
						const modal = uni.getSubNVueById('modal')
						modal.show('fade-in', 500)
						uni.$emit('modal-popup', res.result.data)
						uni.$on('modal-hide', () => {
							modal.hide()
							this.reset()
						})
						return
					// #endif
					this.showModal = true
					this.catList = res.result.data
				})
			},
			hideCatList() {
				this.catList = []
				this.scale = 17
			},
			toDetail(id) {
				uni.navigateTo({
					url: '/pages/list/detail?id=' + id
				})
			}
		},
		onShareAppMessage() {
			
		}
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
	
	.menu {
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
