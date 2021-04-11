<template>
	<view>
		<unicloud-db
			ref="udb"
			v-slot:default="{data, loading, hasMore}"
			collection="messages,uni-id-users,bases"
			field="uid{_id,nickname,avatar,subscribes},base_id{_id,name},content,is_read,is_reply,create_date"
			:where="condition"
			orderby="create_date desc"
			@load="loaded">
			<view class="cu-list menu-avatar">
				<view class="cu-item" v-for="(item, index) in data" :key="index" @tap="onTap(item)" @longpress="onDel(item._id)">
					<view class="cu-avatar round lg" :style="{backgroundImage: 'url('+item.uid[0].avatar+')'}">
						<view class="cu-tag badge" v-if="!item.is_read"></view>
					</view>
					<view class="content">
						<view class="text-grey">
							<text>{{item.uid[0].nickname}}</text>
							<text v-if="item.base_id" class="margin-left-xs cu-tag sm round bg-blue light">申请加入{{item.base_id[0].name}}</text>
						</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">{{item.content}}</view>
						</view>
					</view>
					<view class="action">
						<view class="text-grey text-xs margin-bottom-xs">{{item.create_date}}</view>
						<view class="cu-tag sm round bg-blue light" v-if="item.is_reply">{{item.base_id?'已通过':'已回复'}}</view>
						<view class="cu-tag sm round" v-else-if="item.is_read">{{item.base_id?'未通过':'未回复'}}</view>
						<view class="cu-tag sm round" v-else>未读</view>
					</view>
				</view>
			</view>
			<view class="cu-load loading text-gray" v-if="loading"></view>
			<view class="cu-load text-gray text-sm" v-else-if="!hasMore">没有更多了</view> 
		</unicloud-db>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		computed: {
			condition() {
				return `touids=='${this.userInfo._id}'`
			}
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
				data.map(item => {
					item.create_date = this.$u.timeFrom(item.create_date)
				})
			},
			onTap(item) {
				if(item.is_reply)
					return
				
				const itemList = item.base_id ? ['同意','拒绝'] : ['回复','已读']
				uni.showActionSheet({
					itemList,
					success: async ({tapIndex}) => {
						let isReply = false
						try{
							if(item.base_id) {
								if(tapIndex === 0) {
									uni.showLoading({
										title: '操作中'
									})
									const { uid: [{ _id: uid, subscribes }], base_id: [{ _id: base_id }]} = item
									if(!subscribes.includes(base_id)) {
										subscribes.push(base_id)
									}
									await db.collection('uni-id-users').doc(uid).update({
										subscribes,
									})
									isReply = true
									this.$u.toast('审核成功')
								}
							}
							await db.collection('messages').doc(item._id).update({
								is_read: true,
								is_reply: isReply
							})
							this.$refs.udb.loadData({
								clear: true
							})
						}catch(e){
							console.log(e)
							uni.hideLoading()
						}
					}
				})
			},
			onDel(id) {
				this.$refs.udb.remove(id)
			}
		}
	}
</script>

<style>

</style>
