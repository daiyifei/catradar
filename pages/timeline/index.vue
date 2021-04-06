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
				
				<u-gap bg-color="#fff" height="100"></u-gap>

				<!--列表主体-->
				<unicloud-db
					ref="udb"
					v-slot:default="{data, loading, hasMore}"
					:where="condition"
					collection="timeline,list,uni-id-users"
					field="cat_id{_id,name,avatar},uid{_id,nickname,avatar},content_type,text,album,create_date"
					orderby="create_date desc"
					:page-size="5">
					<timeline-item :item="item" is-link v-for="(item, index) in data" :key="item._id" @focus="onFocus" @del="onDel" />
					<view class="cu-load loading text-gray" v-if="loading"></view>
					<view class="cu-load text-gray text-sm padding" v-if="!loading&&!hasMore">没有更多了</view>
				</unicloud-db>
				
				<!--操作按钮-->
				<view class="btn-float cu-avatar round lg bg-gradual-blue margin" :class="showBackToTop?'cuIcon-top':'cuIcon-camera'" @tap="scrollTop?backTop():add()"></view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				background: {
					background: ''
				},
				showBackToTop: false
			}
		},
		computed: {
			condition() {
				return `base_id=='${this.baseInfo._id}'`
			}
		},
		onShow() {
			if(this.$refs.udb && !this.$refs.udb.dataList.length) {
				this.$refs.udb.loadData()
			}
		},
		async onPullDownRefresh() {
			this.$refs.udb.dataList = []
			this.$refs.udb.loadData({
				clear: true
			},() => {
				uni.stopPullDownRefresh()
			})
		},
		onPageScroll(e) {
			const opacity = e.scrollTop / 100
			this.background.background = `linear-gradient(45deg, rgba(57,181,74,${opacity}), rgba(141,198,63,${opacity}))`
			if(e.scrollTop > 1000) {
				this.showBackToTop = true
			}else {
				this.showBackToTop = false
			}
		},
		onReachBottom() {
			this.$refs.udb.loadMore()
		},
		methods: {
			backTop() {
				uni.pageScrollTo({
					scrollTop: 0
				})
			},
			add() {
				const option = {
					sizeType: ['compressed'],
					success: res => {
						uni.navigateTo({
							url: 'edit?files=' + JSON.stringify(res)
						})
					}
				}
				// #ifdef MP-WEIXIN
				uni.requestSubscribeMessage({
					tmplIds: ['73TwwDG5U8hoQT_WCOC85kt7Rr5lr_v8aZb-a9M_hl8'],
					success: () => {
						uni.chooseMedia(option)
					}
				})
				// #endif
				// #ifndef MP-WEIXIN
				uni.chooseImage(option)
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
			},
			onDel(id) {
				this.$refs.udb.remove(id)
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
