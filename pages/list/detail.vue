<template>
	<view>
		<u-skeleton :loading="loading" animation bgColor="#FFF"></u-skeleton>
		<u-navbar :back-icon-name="isSingle?'home':'nav-back'" :custom-back="customBack" :background="background"
			:title="title" back-icon-color="#fff" :title-color="titleColor">
		</u-navbar>
		<view class="container u-skeleton">
			<!-- 封面 -->
			<swiper class="swiper screen-swiper square-dot u-skeleton-rect" :indicator-dots="true" :circular="true"
				@change="imgChange">
				<swiper-item v-for="(item,index) in form.album" :key="index">
					<view class="swiper-item" @tap="preview(form.album, index)">
						<video :src="item" autoplay loop :show-play-btn="false" :controls="false" objectFit="cover"
							v-if="item.split('.')[form.album.length]=='mp4'" />
						<image :src="item" mode="aspectFill" v-else @load="imgLoad" />
					</view>
				</swiper-item>
			</swiper>

			<template v-if="hasLogin">
				<!-- 头部 -->
				<view class="header padding flex align-center bg-white margin-sm radius shadow shadow-blur">
					<image :src="form.avatar" class="cu-avatar xl round margin-right-sm u-skeleton-circle"></image>
					<view class="u-skeleton-rect">
						<view class="text-xxl u-skeleton-circle">{{form.name}}</view>
						<view class="u-skeleton-rect">
							<text class="gender margin-right-xs"
								:class="form.female ? 'cuIcon-female female' : 'cuIcon-male'"></text>
							<text class="text-grey text-lg">{{form.birthday | age}}</text>
						</view>
					</view>
					<view class="action padding flex flex-direction justify-between align-end">
						<view class="cu-tag round u-skeleton-rect light"
							:class="'bg-'+['gray','blue','orange','black'][form.state]">
							{{form.state | state}}
						</view>
						<view class="flex u-skeleton-rect">
							<view class="flex flex-direction align-center padding-lr solid-right" @tap="fav">
								<text :class="isFav?'cuIcon-favorfill text-orange':'cuIcon-favor'"></text>
								<text class="text-xs" :class="isFav?'text-orange':'text-gray'">{{isFav?'已':''}}收藏</text>
							</view>
							<view class="flex flex-direction align-center padding-left" style="position: relative;">
								<text class="cuIcon-share"></text>
								<text class="text-xs text-gray">分享</text>
								<button class="btn-transparent" open-type="share" @tap="share"></button>
							</view>
						</view>
					</view>
				</view>

				<!-- 信息 -->
				<view class="margin-sm bg-white radius u-skeleton-rect shadow shadow-blur">
					<view class="cu-bar">
						<view class="action sub-title">
							<text class="text-xl text-bold text-green">信息</text>
							<text class="text-ABC text-green">information</text>
						</view>
					</view>
					<view class="cu-list menu">
						<view class="cu-item">
							<view class="content text-grey">性别</view>
							<view class="action">{{form.female|female}}</view>
						</view>
						<view class="cu-item">
							<view class="content text-grey">花色</view>
							<view class="action">{{form.color|color}}</view>
						</view>
						<view class="cu-item">
							<view class="content text-grey">生日</view>
							<view class="action">{{form.birthday?form.birthday:'未知'}}</view>
						</view>
						<view class="cu-item">
							<view class="content text-grey">绝育</view>
							<view class="action">{{form.neuter|neuter}}</view>
						</view>
						<view class="cu-item" v-if="form.neuterDate">
							<view class="content text-grey">绝育时间</view>
							<view class="action">{{form.neuterDate}}</view>
						</view>
						<view class="cu-item" v-if="form.state===0">
							<view class="content text-grey">位置</view>
							<view class="action">{{form.location|location}}</view>
						</view>
						<view class="cu-item" v-if="form.intro">
							<view class="content text-grey">简介</view>
							<view class="action">{{form.intro}}</view>
						</view>
					</view>
				</view>

				<!-- 关系 -->
				<view class="margin-sm bg-white radius shadow shadow-blur" v-if="form.relation&&form.relation.length">
					<view class="cu-bar">
						<view class="action sub-title">
							<text class="text-xl text-bold text-blue">关系</text>
							<text class="text-ABC text-blue">relationship</text>
						</view>
					</view>
					<view class="cu-list grid col-4 no-border">
						<view class="cu-item" v-for="(item, index) in form.relation" :key="index">
							<navigator :url="'detail?id='+item._id" class="flex flex-direction align-center">
								<image :src="item.avatar" mode="aspectFill"
									class="cu-avatar xl round margin-bottom-xs" />
								<view class="flex text-sm">
									<view class="margin-right-xs">{{item.tag}}</view>
									<view class="text-blue">{{item.name}}</view>
								</view>
							</navigator>
						</view>
					</view>
				</view>

				<!-- 动态 -->
				<view class="margin-sm bg-white radius shadow shadow-blur">
					<view class="cu-bar">
						<view class="action sub-title">
							<text class="text-xl text-bold text-orange">动态</text>
							<text class="text-ABC text-orange">timeline</text>
						</view>
					</view>
					<unicloud-db v-slot:default="{data, loading, hasMore}" collection="timeline" :where="whereTimeline"
						orderby="create_date desc" manual @load="timelineLoad">
						<view v-for="(item,index) in data" :key="index" class="cu-timeline" @tap="toDetail(item._id)">
							<view class="cu-time margin-left">{{item.create_date}}</view>
							<view class="cu-item" :class="index?'':'text-blue'">
								<view class="content">
									<view class="text-content">{{item.text}}</view>
									<video-item :src="item.album[0]" v-if="item.content_type" />
									<view class="grid grid-square col-3 margin-top-sm" v-else>
										<view class="bg-img" v-for="(pic,idx) in item.album" :key="idx">
											<image :src="pic" mode="aspectFill" @tap.stop="preview(item.album, idx)">
											</image>
										</view>
									</view>
								</view>
							</view>
						</view>
						<view class="text-sm text-gray text-center padding-bottom" v-if="!hasMore">暂无更多</view>
					</unicloud-db>
				</view>
			</template>

			<!-- 未登录 -->
			<view class="need-auth" v-else>
				<u-empty text="请先登录" mode="data">
					<navigator url="/pages/mine/index" class="cu-btn bg-blue margin radius" slot="bottom"
						open-type="switchTab">去登录</navigator>
				</u-empty>
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
				current: 0,
				id: '',
				form: {},
				whereTimeline: '',
				loading: true,
				background: {
					background: ''
				},
				title: '',
				titleColor: ''
			}
		},
		computed: {
			...mapState(['hasLogin', 'userInfo']),
			isSingle() {
				const pages = getCurrentPages()
				return pages.length === 1
			},
			isFav() {
				if (this.hasLogin && ~this.userInfo.favs.indexOf(this.form._id)) {
					return true
				} else {
					return false
				}
			}
		},
		onLoad(option) {
			this.id = option.id
			this.fetchData()
		},
		onReady() {
			this.whereTimeline = `cat_id=='${this.id}'`
		},
		onPageScroll(e) {
			const opacity = e.scrollTop / 100
			this.title = this.form.name
			this.titleColor = `rgba(255,255,255,${opacity})`
			this.background.background = this.form.female ?
				`linear-gradient(45deg, rgba(236,0,140,${opacity}), rgba(103,57,182,${opacity}))` :
				`linear-gradient(45deg, rgba(0,129,255,${opacity}), rgba(28,187,180,${opacity}))`
		},
		methods: {
			async fetchData() {
				const {
					result: {
						data
					}
				} = await db.collection('list').doc(this.id).get()
				this.form = data[0]
				uni.setNavigationBarTitle({
					title: this.form.name
				})
			},
			timelineLoad(data) {
				data.map(item => {
					item.create_date = this.$u.timeFrom(item.create_date)
				})
			},
			imgLoad() {
				this.loading = false
			},
			imgChange(e) {
				this.current = e.detail.current
			},
			preview(urls, current) {
				uni.previewImage({
					urls,
					current
				})
			},
			customBack() {
				if (this.isSingle) {
					uni.reLaunch({
						url: '/pages/radar/index'
					})
				} else {
					uni.navigateBack()
				}
			},
			fav() {
				const {
					_id,
					favs = []
				} = this.userInfo
				if (this.isFav) {
					favs.splice(favs.indexOf(this.form._id), 1)
				} else {
					favs.push(this.form._id)
				}
				db.collection('uni-id-users').doc(_id).update({
					favs
				})
				this.$u.toast(this.isFav ? '已收藏' : '已取消')
			},
			toDetail(id) {
				uni.navigateTo({
					url: `/pages/timeline/detail?id=${id}`
				})
			},
			share() {
				// #ifdef APP-PLUS
				uni.share({
					provider: "weixin",
					scene: "WXSceneSession",
					type: 2,
					imageUrl: this.form.album[this.current],
					fail(err) {
						this.$u.toast(err.message)
					}
				})
				// #endif
			},
			onNavigationBarButtonTap(e) {
				switch (e.type) {
					case 'share':
						uni.share({
							provider: "weixin",
							scene: "WXSceneSession",
							type: 2,
							imageUrl: this.form.album[this.current],
							fail(err) {
								this.$u.toast(err.message)
							}
						})
						break
					default:
						break
				}
			}
		},
		onShareAppMessage() {
			return {
				title: this.form.name,
				path: '/pages/list/detail?id=' + this.form._id,
				imageUrl: this.form.album[this.current]
			}
		}
	}
</script>

<style>
	.container {
		position: absolute;
		top: 0;
	}

	/* swiper */
	.swiper,
	.swiper-item {
		width: 750rpx;
		height: 750rpx;
	}

	.header {
		position: relative;
		overflow: hidden;
	}

	.header .action {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
	}

	.cu-list .action {
		padding-top: 20rpx;
		padding-bottom: 20rpx;
		text-align: left;
		line-height: 1.75em;
		width: 480rpx;
	}

	.need-auth {
		height: calc(100vh - 750rpx);
	}
</style>
