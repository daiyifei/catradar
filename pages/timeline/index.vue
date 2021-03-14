<template>
	<view >
		<u-navbar :is-back="false" :background="background" title="情报" back-icon-color="#fff" title-color="#fff"></u-navbar>
		<view class="container">
			<view class="header-bg">
				<image src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-6ee74e1a-9337-4754-92e2-f7b377cdd878/39d05c55-569f-4916-8ee3-59a12eeb5e3b.gif" mode="scaleToFill" class="gif-wave"></image>
				<view class="user-info margin" v-if="hasLogin">
					<text>{{userInfo.nickname}}</text>
					<image class="cu-avatar radius lg margin-left-sm" :src="userInfo.avatar"></image>
				</view>
			</view>
			
			<view class="need-auth" v-if="!hasLogin">
				<u-empty text="请先登录" mode="permission">
					<navigator url="/pages/mine/index" class="cu-btn bg-blue margin radius" slot="bottom" open-type="switchTab">去登录</navigator>
				</u-empty>
			</view>
			<view class="need-auth" v-else-if="!hasBase">
				<u-empty text="未加入基地" mode="list">
					<navigator url="/pages/radar/index" class="cu-btn bg-blue margin radius" slot="bottom" open-type="switchTab">去选择</navigator>
				</u-empty>
			</view>
			<view v-else>
				<!--列表主体-->
				<view class="cu-list menu-avatar comment solids-top">
					<view class="cu-item" v-for="(item, index) in list" :key="index">
						<!-- 操作按钮 -->
						<view 
							class="btn-more padding cuIcon-moreandroid text-gray"
							v-if="userInfo.scope==9||userInfo._id==item.user[0]._id"
							@tap="showMenu(item._id)">
						</view>
						<!-- 头像 -->
						<navigator :url="'/pages/list/detail?id='+item.cat[0]._id" class="cu-avatar">
							<image :src="item.cat[0].avatar" mode="aspectFill" class="cu-avatar radius"></image>
						</navigator>
						<view class="content">
							<view class="text-grey">{{item.cat[0].name}}</view>
							<timeline-item :item="item" is-link/>
						</view>
					</view>
				</view>
				<view class="cu-load loading text-gray" v-if="loading"></view>
				<view class="cu-load text-gray text-sm" v-if="!hasMore">没有更多了</view>
				
				<!--新建按钮-->
				<view class="cu-avatar round lg bg-gradual-blue cuIcon-camera btn-new margin" @tap="add"></view>
				
				<!--操作菜单-->
				<u-action-sheet :list="actions" @click="click" v-model="show"></u-action-sheet>
			</view>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database()
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				loading: false,
				page: 1,
				limit: 20,
				total: 0,
				hasMore: true,
				list: [],
				actions: [{
					text: '编辑'
				},{
					text: '删除',
					color: 'red'
				}],
				show: false,
				id: '',
				replyUser: {},
				background: {
					background: ''
				}
			}
		},
		computed: mapState(['hasLogin', 'userInfo', 'hasBase']),
		onLoad() {
			this.fetchData()
			uni.$on('refresh', data => {
				if(data) {
					const index = this.list.findIndex(item => {
						return item._id === data._id
					})
					data.user = this.list[index].user
					this.list.splice(index, 1, data)
				}else {
					this.fetchData()
				}
			})
		},
		onShow() {
			if(!this.list.length) {
				this.fetchData()
			}
		},
		async onPullDownRefresh() {
			await this.fetchData()
			uni.stopPullDownRefresh()
		},
		onPageScroll(e) {
			const opacity = e.scrollTop/100
			this.background.background = `linear-gradient(45deg, rgba(57,181,74,${opacity}), rgba(141,198,63,${opacity}))`
		},
		onReachBottom() {
			this.loadMore()
		},
		methods: {
			async fetchData() {
				this.list = []
				this.page = 1
				this.total = 0
				this.hasMore = true
				await this.loadMore()
			},
			async loadMore() {
				if(!this.hasMore) {
					return
				}
				this.loading = true
				const res = await this.$request('timeline','getList',{
					page: this.page++,
					limit: this.limit
				})
				this.list = this.list.concat(res.data)
				this.total = res.total
				this.hasMore = res.page <= Math.ceil(res.total / res.limit)
				this.loading = false
			},
			add() {
				uni.chooseImage({
					success: res => {
						uni.navigateTo({
							url: 'edit?paths=' + JSON.stringify(res.tempFilePaths)
						})
					}
				})
			},
			showMenu(id) {
				this.id = id
				this.show = true
			},
			click(index) {
				if(index === 0) {
					uni.navigateTo({
						url: 'edit?id=' + this.id
					})
				}
				if(index === 1) {
					uni.showModal({
						content: '是否删除这条情报？',
						success: async res => {
							if(res.confirm) {
								await db.collection('timeline').doc(this.id).remove()
								await db.collection('comments').where({
									timeline_id: this.id
								}).remove()
								const index = this.list.findIndex(item => {
									return item._id === this.id
								})
								this.list.splice(index, 1)
								uni.showToast({
									title: '删除成功'
								})
							}
						}
					})
				}
			}
		}
	}
</script>

<style>
.container {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
}

.need-auth {
	height: calc(100vh - 400rpx);
}

.header-bg {
	position: relative;
	background-image: url(https://image.weilanwl.com/color2.0/index.jpg);
	background-size: cover;
	height: 400rpx;
	display: flex;
	justify-content: center;
	padding-top: 40rpx;
	flex-direction: column;
	align-items: center;
	color: #fff;
	font-weight: 300;
	text-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
	z-index: 1;
}

.header-bg .gif-wave {
	position: absolute;
	width: 100%;
	bottom: 0;
	left: 0;
	mix-blend-mode: screen;  
	height: 100rpx;  
}

.header-bg .user-info {
	position: absolute;
	right: 0;
	bottom: -30rpx;
}

.cu-list {
	margin-top: -10rpx;
	padding-top: 100rpx;
	background-color: #fff;
}

.btn-more {
	position: absolute;
	top: 0;
	right: 0;
	z-index: 1;
}

.btn-new {
	position: fixed;
	right: 0;
	bottom: var(--window-bottom);
	opacity: .9;
	line-height: 80rpx;
}
</style>
