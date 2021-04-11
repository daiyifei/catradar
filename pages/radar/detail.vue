<template>
	<view>
		<unicloud-db ref="users" v-slot:default="{data, loading, pagination, options}" :options="base" collection="uni-id-users" :where="condition"
			field="_id,avatar,nickname,subscribes,role,gender" getcount manual @load="loaded">
			<view class="cu-list menu-avatar">
				<view class="cu-item">
					<image class="cu-avatar round lg" :src="options.avatar" v-if="options.avatar"/>
					<text class="cu-avatar round lg" v-else-if="options.name">{{options.name[0]}}</text>
					<view class="content">
						<view class="text-grey">{{options.name}}</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">成员: {{pagination.count}}</view>
						</view>
					</view>
				</view>
				<view class="cu-item" v-for="(item, index) in data" :key="item._id" @tap="toUser(item._id)" @longpress="showMenu(item)">
					<view class="cu-avatar lg round" :style="{backgroundImage: 'url('+item.avatar+')'}">
						<view class="cu-tag badge light" :class="item.gender===2?'cuIcon-female bg-pink':'cuIcon-male bg-blue'"></view>
					</view>
					<view class="content">
						<text>{{item.nickname}}</text>
					</view>
					<view class="actions padding-right">
						<text class="cu-tag bg-orange light round" v-if="item._id===options.uid||item.role">管理员</text>
					</view>
				</view>
				<view class="cu-load loading text-gray" v-if="loading"></view>
				<view class="cu-load text-gray" v-else>共{{pagination.count}}人</view>
			</view>
		</unicloud-db>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				base: {},
				condition: '',
			}
		},
		onLoad(options) {
			this.condition = `subscribes=='${options.id}'`
			db.collection('bases').doc(options.id).get({
				getOne: true
			}).then(res => {
				this.base = res.result.data
				this.$refs.users.loadData()
			})
		},
		methods: {
			loaded(data) {
				data.map((item,index) => {
					if(item._id === this.base.uid || item.role) {
						data.splice(index, 1)
						data.unshift(item)
					}
				})
			},
			toUser(id) {
				uni.navigateTo({
					url: `/pages/mine/homepage?uid=${id}`
				})
			},
			showMenu(item) {
				const { _id, subscribes } = item
				if(this.userInfo._id !== _id && (this.userInfo._id === this.base.uid || this.userInfo.role)) {
					uni.vibrateShort()
					uni.showActionSheet({
						itemList: ['移出'],
						success: ({tapIndex}) => {
							subscribes.splice(subscribes.findIndex(v => v === this.base._id), 1)
							this.$refs.users.update(item._id, {
								subscribes
							},{
								success: () => {
									const { dataList } = this.$refs.users
									dataList.splice(dataList.findIndex(v => v._id === _id), 1)
								}
							})
						}
					})
				}
			}
		},
		onReachBottom() {
			this.$refs.users.loadMore()
		}
	}
</script>

<style>

</style>
