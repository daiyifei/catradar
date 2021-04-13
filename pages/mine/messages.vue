<template>
	<view>
		<unicloud-db
			ref="udb"
			v-slot:default="{data, loading, hasMore}"
			collection="messages,uni-id-users,bases"
			manual
			field="type,uid{_id,nickname,avatar,subscribes},base_id{_id,name,available},content,is_read,is_reply,create_date"
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
							<text class="cu-tag sm light bg-olive" v-if="item.type==2">申请加入{{item.base_id[0].name}}</text>
							<text class="cu-tag sm light bg-orange" v-if="item.type==3">申请开通{{item.base_id[0].name}}</text>
						</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">{{item.content}}</view>
						</view>
					</view>
					<view class="action">
						<view class="text-grey text-xs margin-bottom-xs">{{item.create_date}}</view>
						<view class="cu-tag sm round bg-blue light" v-if="item.is_reply">{{item.type===1?'已回复':'已通过'}}</view>
						<view class="cu-tag sm round" v-else-if="item.is_read">已读</view>
						<view class="cu-tag sm round" v-else>未读</view>
					</view>
				</view>
			</view>
			<view class="cu-load loading text-gray" v-if="loading"></view>
			<view class="cu-load text-gray text-sm" v-else-if="!hasMore">没有更多了</view> 
		</unicloud-db>
		
		<!-- 回复弹框 -->
		<u-modal v-model="showModal" title="回复" confirm-text="发送" show-cancel-button @confirm="sendMsg"
			:show-confirm-button="form.content&&form.content.length>0">
			<view class="cu-form-group">
				<input placeholder="请填写回复内容" focus v-model="form.content"></input>
			</view>
		</u-modal>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				showModal: false,
				form: {}
			}
		},
		computed: {
			condition() {
				return `touid=='${this.userInfo._id}'`
			}
		},
		onReady() {
			if(this.hasLogin) {
				this.$refs.udb.loadData()
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
			async onTap(item) {
				await this.$requestMsg()
				
				if(item.is_reply) {
					uni.showActionSheet({
						itemList: ['删除'],
						success: () => {
							this.onDel(item._id)
						}
					})
					return
				}
				
				// 设为已读
				db.collection('messages').doc(item._id).update({
					is_read: true
				}).then(() => {
					this.$refs.udb.loadData({
						clear: true
					})
				})
				
				if(item.type === 1) {
					uni.showActionSheet({
						itemList: ['回复'],
						success: () => {
							this.$set(this.form, 'content', '')
							this.form._id = _id
							this.form.touid = uid
							this.showModal = true
						}
					})
				}
				
				if(item.type === 2 || item.type === 3) {
					uni.showActionSheet({
						itemList: ['同意'],
						success: () => {
							this.approve(item)
						}
					})
				}
				
				if(item.type === 4) {
					uni.showActionSheet({
						itemList: ['查看','删除'],
						success: async ({tapIndex}) => {
							if(tapIndex === 0) {
								const { userInfo } = await this.$request('user-center','getUserInfo')
								this.login(userInfo)
								uni.navigateTo({
									url: '/pages/radar/bases'
								})
							}
							if(tapIndex === 1) {
								this.onDel(item._id)
							}
						}
					})
				}
			},
			// 审批
			async approve(item) {
				const { _id, type, uid: [{ _id: uid, subscribes = [] }], base_id: [{ _id: base_id, available }] } = item
				
				uni.showLoading({
					title: '操作中'
				})
				
				if(available) {
					// 加入
					if(!subscribes.includes(base_id)) {
						subscribes.push(base_id)
						await db.collection('uni-id-users').doc(uid).update({
							subscribes
						})
					}
				}else {
					// 开通
					await db.collection('bases').doc(base_id).update({
						available: true
					})
				}
				
				// 通知
				await db.collection('messages').add({
					base_id,
					type: 4,
					content: '申请已通过',
					touid: uid
				})
				await db.collection('messages').doc(_id).update({
					is_reply: true
				})
				
				this.$sendMsg({
					type: 'message',
					touid: uid,
					data: [
						this.userInfo.nickname,
						'申请已通过'
					]
				})
				this.$u.toast('审核成功')
				this.$refs.udb.loadData({
					clear: true
				})
			},
			// 私信回复
			async sendMsg() {
				await db.collection('messages').doc(this.form._id).update({
					is_reply: true
				})
				delete this.form._id
				await db.collection('messages').add(this.form)
				this.$u.toast('已发送')
				this.$refs.udb.loadData({
					clear: true
				})
				this.$sendMsg({
					type: 'message',
					touid: this.form.touid,
					data: [
						this.userInfo.nickname,
						this.form.content
					]
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
