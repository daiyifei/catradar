<template>
	<view>
		<!--列表-->
		<unicloud-db ref="udb" v-slot:default="{data, loading}" collection="bases" @load="loaded">
			<view class="cu-list menu-avatar">
				<view class="cu-item" v-for="(item,index) in data" :key="index" >
					<image :src="item.avatar" class="cu-avatar round lg" @tap="toBaseDetail(item._id)"/>
					<view class="content" @tap="onSelect(item)">
						<view class="text-grey">{{item.name}}</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">距离{{item.distance}}</view>
						</view>
					</view>
					<view class="action margin" style="width: auto">
						<text class="cu-tag bg-orange light round" v-if="item.uid===userInfo._id || userInfo.role" @tap="onEdit(item)">编辑</text>
						<text class="cu-tag round" @tap.stop.prevent="subscribe(item)" v-if="item.subscribed">退出</text>
						<text class="cu-tag bg-blue light round" @tap.stop.prevent="subscribe(item)" v-else>加入</text>
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
					<view class="cu-form-group">
						<view class="title">位置</view>
						<view class="response">
							<view v-for="(item, index) in form.locations" :key="index" class="flex justify-between align-center margin-top-sm">
								<input v-model="item.name" placeholder="请输入位置名称" />
								<text class="cuIcon-delete text-red" @tap="removeLocation(index)"></text>
							</view>
							<view class="flex justify-between align-center" @tap="addLocation">
								<input placeholder="点击添加位置" disabled></input>
								<text class="margin-tb-sm fr cuIcon-add text-blue text-bold"></text>
							</view>
						</view>
					</view>
					<button class="cu-btn block bg-blue margin-top lg" :disabled="!form.name" @tap="onSubmit">保存</button>
					<button class="cu-btn block bg-red margin-top lg" v-if="form.uid===userInfo._id" @tap="onDelete(form._id)">删除</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				location: '',
				form: {},
				showModal: false
			}
		},
		onLoad() {
			uni.getLocation({
				type:'gcj02',
				success: res => {
					this.location = res
				}
			})
		},
		methods: {
			loaded(data) {
				data.map(item => {
					const distance = this.getDistance(this.location, item)
					item.distance = distance < 1 ? Math.ceil(distance*1000) + 'm' : Math.ceil(distance) + 'km'
					item.subscribed = this.hasLogin && this.userInfo.subscribes.includes(item._id)
				})
			},
			async subscribe(item) {
				if(!this.hasLogin) {
					this.$u.toast('请先登录')
					return
				}
				
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
				const target = this.$refs.udb.dataList.find(v => v._id === id)
				target.subscribed = !item.subscribed
				this.$u.toast(~subscribes.indexOf(id) ? '已加入' : '已退出')
			},
			onSelect(item) {
				if(item.subscribed) {
					this.enter(item)
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
									id: parseInt((latitude + '' + longitude).replace(/\./g,'')),
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
