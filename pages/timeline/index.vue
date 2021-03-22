<template>
	<view>
		<view class="fullscreen" v-if="!hasLogin">
			<u-empty text="请先登录" mode="permission">
				<navigator url="/pages/mine/index" class="cu-btn bg-blue margin radius" slot="bottom"
					open-type="switchTab">去登录</navigator>
			</u-empty>
		</view>
		<view class="fullscreen" v-else-if="!hasBase">
			<u-empty text="未加入猫区" mode="list">
				<navigator url="/pages/radar/index" class="cu-btn bg-blue margin radius" slot="bottom"
					open-type="switchTab">去选择</navigator>
			</u-empty>
		</view>
		<view v-else>
			<u-navbar :is-back="false" :background="background" title="情报" back-icon-color="#fff" title-color="#fff" class="navbar">
			</u-navbar>
			<view class="container">
				<view class="header-bg">
					<image
						src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-6ee74e1a-9337-4754-92e2-f7b377cdd878/39d05c55-569f-4916-8ee3-59a12eeb5e3b.gif"
						mode="scaleToFill" class="gif-wave"></image>
					<view class="user-info margin" v-if="hasLogin">
						<text>{{userInfo.nickname}}</text>
						<image class="cu-avatar radius lg margin-left-sm" :src="userInfo.avatar"></image>
					</view>
				</view>
				
				<u-gap bg-color="#fff"></u-gap>

				<!--列表主体-->
				<timeline-item :item="item" is-link v-for="(item, index) in list" :key="index" @focus="onFocus" />
				<view class="cu-load loading text-gray" v-if="loading"></view>
				<view class="cu-load text-gray text-sm" v-if="!hasMore">没有更多了</view>

				<!--新建按钮-->
				<view class="cu-avatar round lg bg-gradual-blue cuIcon-camera btn-new margin" @tap="add"></view>
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
				limit: 10,
				total: 0,
				hasMore: false,
				list: [],
				background: {
					background: ''
				}
			}
		},
		computed: mapState(['hasLogin', 'userInfo', 'hasBase']),
		onLoad() {
			uni.$on('refresh', async id => {
				if(id) {
					const index = this.list.findIndex(item => {
						return item._id === id
					})
				 	const { data } = await this.$request('timeline','getList',{id})
					if(data) {
						this.list.splice(index, 1, data)
						this.$u.toast('更新成功')
					}else {
						this.list.splice(index, 1)
						this.$u.toast('删除成功')
					}
				} else {
					this.fetchData()
					this.$u.toast('发布成功')
				}
			})
		},
		async onPullDownRefresh() {
			await this.fetchData()
			uni.stopPullDownRefresh()
		},
		onPageScroll(e) {
			const opacity = e.scrollTop / 100
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
				if (!this.hasMore) {
					return
				}
				this.loading = true
				const res = await this.$request('timeline', 'getList', {
					page: this.page++,
					limit: this.limit
				})
				this.list = this.list.concat(res.data)
				this.total = res.total
				this.hasMore = this.page <= Math.ceil(res.total / res.limit)
				this.loading = false
			},
			add() {
				// #ifdef MP-WEIXIN
				uni.chooseMedia({
					success: res => {
						uni.navigateTo({
							url: 'edit?files=' + JSON.stringify(res)
						})
					}
				})
				// #endif
				// #ifndef MP-WEIXIN
				uni.chooseImage({
					success: res => {
						console.log(res)
						uni.navigateTo({
							url: 'edit?files=' + JSON.stringify(res)
						})
					}
				})
				// #endif
			},
			onFocus(e) {
				uni.createSelectorQuery().select('.navbar').boundingClientRect(({height}) => {
					uni.createSelectorQuery().select('.container').boundingClientRect(({top}) => {
						uni.pageScrollTo({
							duration: 0,
							scrollTop: e.top - top - height
						})
					}).exec()
				}).exec()
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

	.header-bg {
		position: relative;
		background-image: url(https://image.weilanwl.com/color2.0/index.jpg);
		background-size: cover;
		height: 300rpx;
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
		bottom: -40rpx;
	}

	.btn-more {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 1;
	}
</style>
