<template>
	<view>
		<view class="fullscreen" v-if="!hasLogin">
			<u-empty text="请先登录" mode="permission">
				<navigator url="/pages/mine/index" class="cu-btn bg-blue margin radius" slot="bottom"
					open-type="switchTab">去登录</navigator>
			</u-empty>
		</view>
		<view class="fullscreen" v-else-if="!hasBase">
			<u-empty text="未加入基地" mode="list">
				<navigator url="/pages/radar/index" class="cu-btn bg-blue margin radius" slot="bottom"
					open-type="switchTab">去选择</navigator>
			</u-empty>
		</view>
		<view v-else>
			<u-navbar :is-back="false" :background="background" title="情报" back-icon-color="#fff" title-color="#fff">
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

				<!--列表主体-->
				<timeline-item :item="item" is-link v-for="(item, index) in list" :key="index" />
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
				limit: 4,
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
			uni.$on('refresh', data => {
				if (data) {
					const index = this.list.findIndex(item => {
						return item._id === data._id
					})
					data.user = this.list[index].user
					this.list.splice(index, 1, data)
				} else {
					this.fetchData()
				}
			})
		},
		onShow() {
			if (!this.list.length) {
				this.fetchData()
			}
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
				uni.chooseImage({
					success: res => {
						uni.navigateTo({
							url: 'edit?paths=' + JSON.stringify(res.tempFilePaths)
						})
					}
				})
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

	.btn-new {
		position: fixed;
		right: 0;
		bottom: var(--window-bottom);
		opacity: .9;
		line-height: 80rpx;
	}
</style>
