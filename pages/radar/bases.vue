<template>
	<view>
		<!--列表-->
		<unicloud-db ref="udb" v-slot:default="{data, loading}" manual collection="bases" @load="loaded">
			<view class="cu-list menu-avatar">
				<view class="cu-item" v-for="(item,index) in data" :key="index" @tap="onSelect(item)">
					<view class="cu-avatar round lg" :style="{backgroundImage:'url('+item.avatar+')'}">
						<view class="cu-tag badge cuIcon-check bg-green" v-if="item._id===baseInfo._id"></view>
						<text v-if="!item.avatar">{{item.name[0]}}</text>
					</view>
					<view class="content flex-sub">
						<view class="text-grey">{{item.name}}</view>
						<view class="text-gray text-sm flex justify-between">
							<text class="text-cut cuIcon-locationfill">距离{{item.distance}}</text>
							<view class="text-gray text-sm">
								<text class="cu-tag bg-orange light round" v-if="item.uid===userInfo._id||userInfo.role" @tap.stop.prevent="onEdit(item)">编辑</text>
								<template v-if="item.subscribed">
									<text class="cu-tag bg-blue light round" @tap.stop.prevent="toBaseDetail(item._id)">成员</text>
									<text class="cu-tag round light bg-gray" @tap.stop.prevent="unSubscribe(item._id)">退出</text>
								</template>
								<text class="cu-tag round light bg-blue" @tap.stop.prevent="subscribe(item)" v-else>加入</text>
							</view>
						</view>
					</view>
				</view>
				<view class="cu-load loading text-gray" v-if="loading"></view>
			</view>
		</unicloud-db>
		
		<!--新建-->
		<view class="btn-float cu-avatar round lg bg-gradual-blue cuIcon-add margin" v-if="hasLogin" @tap="onEdit()"></view>
		
		<!--表单-->
		<view class="cu-modal" :class="showModal?'show':''">
			<view class="cu-dialog" v-if="showModal">
				<view class="cu-bar bg-white justify-end">
					<view class="content">{{form._id?'编辑':'新建'}}</view>
					<view class="action" @tap="hideModal">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="padding text-left">
					<view class="cu-form-group">
						<view class="title">logo</view>
						<avatar-cropper v-model="form.avatar" class="response" />
					</view>
					<view class="cu-form-group required">
						<view class="title">地址</view>
						<input placeholder="请输入地址" v-model="form.name" :disabled="!form.latitude" @tap="form.latitude?'':chooseAddress()"></input>
						<text class="cuIcon-locationfill text-blue" @tap="chooseAddress"></text>
					</view>
					<view class="cu-form-group align-start">
						<view class="title">位置</view>
						<view class="response">
							<view v-for="(item, index) in form.locations" :key="index" class="flex justify-between align-center">
								<input v-model="item.name" placeholder="请输入位置名称" />
								<text class="padding-tb cuIcon-delete text-red" @tap="removeLocation(index)"></text>
							</view>
							<view class="flex justify-between align-center" @tap="addLocation">
								<input placeholder="点击添加位置" disabled></input>
								<text class="padding-tb cuIcon-add text-blue text-bold"></text>
							</view>
						</view>
					</view>
					<button class="cu-btn block bg-blue margin-top lg" :disabled="!form.name" @tap="onSubmit">保存</button>
					<button class="cu-btn block bg-red margin-top lg" v-if="form.uid===userInfo._id||userInfo.role" @tap="onDelete(form._id)">删除</button>
				</view>
			</view>
		</view>
	
		<!--验证-->
		<u-modal v-model="showVerify" title="验证申请" confirm-text="发送" show-cancel-button @confirm="sendVerifyMsg">
			<view class="cu-form-group">
				<input placeholder="请输入验证消息，等待管理员审核" :focus="showVerify" v-model="form.content"></input>
			</view>
		</u-modal>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				form: {},
				showModal: false,
				showVerify: false,
				verifyMsg: ''
			}
		},
		onReady() {
			uni.getLocation({
				type:'gcj02',
				success: res => {
					this.location = res
					this.$refs.udb.loadData()
				}
			})
		},
		onPullDownRefresh() {
			this.$refs.udb.loadData({
				clear: true
			},() => {
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			this.$refs.udb.loadMore()
		},
		methods: {
			loaded(data) {
				data.map((item, index) => {
					const distance = this.getDistance(this.location, item)
					item.distance = distance < 1 ? Math.ceil(distance*1000) + 'm' : Math.ceil(distance) + 'km'
					if(this.hasLogin) {
						item.subscribed = this.userInfo.subscribes.includes(item._id)
						if(item._id === this.userInfo.base_id) {
							data.splice(index, 1)
							data.splice(0, 0, item)
						}
					}
				})
			},
			async subscribe(item) {
				if(!this.hasLogin) {
					this.$u.toast('请先登录')
					return
				}
				this.form.base_id = item._id 
				this.form.touids = [item.uid]
				this.showVerify = true
			},
			async unSubscribe(id) {
				await new Promise(resolve => {
					uni.showModal({
						content: '退出后需要重新申请，是否退出？',
						success: res => {
							if(res.confirm) {
								resolve()
							}
						}
					})
				})
				if(this.userInfo.base_id === id) {
					this.userInfo.base_id = ''
					this.exit()
				}
				this.userInfo.subscribes.splice(this.userInfo.subscribes.indexOf(id),1)
				db.collection('uni-id-users').doc(this.userInfo._id).update({
					subscribes: this.userInfo.subscribes,
					base_id: this.userInfo.base_id
				})
				this.$refs.udb.loadData({
					clear: true
				})
			},
			async sendVerifyMsg() {
				if(!this.form.content) {
					this.$u.toast('请输入内容')
					return
				}
				
				// #ifdef MP-WEIXIN
				await new Promise(resolve => {
					uni.requestSubscribeMessage({
						tmplIds: ['xY6bQVGDtKb7JSHYdBHhVwoFKQCViQb0pPFnXZgkRaI'],
						success: () => {
							resolve()
						}
					})
				})
				// #endif
				
				await db.collection('messages').add(this.form)
				this.$u.toast('已发送')
			},
			async onSelect(item) {
				if(item.subscribed) {
					this.enter(item)
					db.collection('uni-id-users').doc(this.userInfo._id).update({
						base_id: item._id 
					})
					this.userInfo.base_id = item._id
					this.login(this.userInfo)
					uni.navigateBack()
				}else {
					this.$u.toast('请先加入')
				}
			},
			toBaseDetail(id) {
				if(!this.hasBase)
					return
				uni.navigateTo({
					url: '/pages/radar/detail?id=' + id
				})
			},
			onEdit(data) {
				this.form = this.$u.deepClone(data || {})
				this.showModal = true
			},
			hideModal() {
				this.form = {}
				this.showModal = false
			},
			addLocation() {
				uni.getLocation({
					success: res => {
						uni.chooseLocation({
							latitude: res.latitude,
							longitude: res.longitude,
							success: res => {
								const { locations = [] } = this.form,
									{ name, latitude, longitude } = res
								locations.push({
									id: Date.now(),
									name,
									latitude,
									longitude
								})
								this.$set(this.form,'locations',locations)
							}
						})
					}
				})
			},
			removeLocation(index) {
				this.form.locations.splice(index,1)
			},
			chooseAddress() {
				uni.getLocation({
					success: res => {
						uni.chooseLocation({
							latitude: res.latitude,
							longitude: res.longitude,
							success: res => {
								const { name, latitude, longitude } = res
								this.$set(this.form, 'name', name)
								this.$set(this.form, 'latitude', latitude)
								this.$set(this.form, 'longitude', longitude)
							}
						})
					}
				})
			},
			async onSubmit() {
				this.form.avatar = await this.$upload(this.form.avatar)
				if(this.form._id) {
					const id = this.form._id
					delete this.form._id
					delete this.form.distance
					delete this.form.subscribed
					this.$refs.udb.update(id, this.form, {
						success:() => {
							this.$refs.udb.loadData({
								clear: true
							})
						}
					})
				}else {
					this.$refs.udb.add(this.form,{
						success:() => {
							this.$refs.udb.loadData({
								clear: true
							})
						}
					})
				}
				this.hideModal()
			},
			onDelete(id) {
				this.$refs.udb.remove(id)
				this.hideModal()
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
		}
	}
</script>

<style>
</style>
