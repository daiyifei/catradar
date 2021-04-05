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
							v-if="item.split('.').pop()=='mp4'" />
						<image :src="item" mode="aspectFill" v-else />
					</view>
				</swiper-item>
			</swiper>

			<template v-if="hasLogin">
				<!-- 头部 -->
				<view class="header padding flex align-center bg-white margin-sm radius shadow shadow-blur">
					<image :src="form.avatar" class="cu-avatar xl round margin-right-sm u-skeleton-circle" ></image>
					<view>
						<view class="text-xxl u-skeleton-circle">{{form.name}}</view>
						<view>
							<text class="gender margin-right-xs"
								:class="form.female ? 'cuIcon-female female' : 'cuIcon-male'"></text>
							<text class="text-grey text-lg u-skeleton-rect">{{form.birthday | age}}</text>
						</view>
					</view>
					<view class="action padding flex flex-direction justify-between align-end">
						<!-- 主人信息 -->
						<view class="flex align-center u-skeleton-rect" v-if="form.state<3">
							<view class="cu-avatar round" :class="form.state===1?'bg-gradual-green shadow-blur':''" 
								:style="{backgroundImage: form.state===2? 'url('+owner.avatar+')':''}">
								<text v-if="form.state===0">?</text>
								<text class="cuIcon-service" v-if="form.state===1"></text>
								<view class="cu-tag badge cuIcon-selectionfill bg-orange" v-if="form.state===2"></view>
							</view>
							<text class="margin-left-xs" :class="form.state===1?'text-green':''">{{['等待主人...','提供线索',owner.nickname][form.state]}}</text>
							<button class="btn-transparent" open-type="contact" v-if="form.state===1"></button>
						</view>
						<!-- 状态 -->
						<view class="cu-tag round u-skeleton-rect light"
							:class="'bg-'+['gray','blue','orange','black'][form.state]">
							{{form.state | state}}
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
						<view class="cu-item">
							<view class="content text-grey">猫区</view>
							<view class="action">{{base.name}}</view>
						</view>
						<view class="cu-item" v-if="form.state===0">
							<view class="content text-grey">位置</view>
							<view class="action">{{location(form.location)}}</view>
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
				<view class="margin-sm bg-white radius shadow shadow-blur" id="timeline">
					<view class="cu-bar">
						<view class="action sub-title">
							<text class="text-xl text-bold text-orange">动态</text>
							<text class="text-ABC text-orange">timeline</text>
						</view>
					</view>
					<unicloud-db 
						ref="timeline"
						v-slot:default="{data, loading, hasMore}" 
						collection="timeline"
						manual
						:where="condition"
						orderby="create_date desc" 
						@load="timelineLoaded">
						<view v-for="(item,index) in data" :key="index" class="cu-timeline" @tap="toDetail(item._id)">
							<view class="cu-time margin-left">{{item.time}}</view>
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
				
				<!-- 操作条 -->
				<view class="action-bar cu-bar bg-white tabbar shop border">
					<view class="action" @tap="fav">
						<view :class="isFav?'cuIcon-favorfill text-orange':'cuIcon-favor'"></view>
						<text :class="isFav?'text-orange':''">{{isFav?'已':''}}收藏</text>
					</view>
					<button class="action" style="color:#666" open-type="share" @tap="share">
						<view class="cuIcon-share"></view>分享
					</button>
					<navigator :url="'/pages/list/edit?id='+form._id" class="action" v-if="form.state>0&&(form.uid==userInfo._id||userInfo.role)">
						<view class="cuIcon-edit"></view>编辑
					</navigator>
					<view class="btn-group margin-lr-sm">
						<button class="cu-btn bg-gradual-orange round shadow-blur" @tap="addTimeline">发布动态</button>
						<button class="cu-btn bg-gradual-blue round shadow-blur" v-if="form.state===0" @tap="goAdopt">我想领养</button>
					</view>
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
	export default {
		data() {
			return {
				current: 0,
				id: '',
				form: {},
				base: {},
				owner: {},
				loading: true,
				background: {
					background: ''
				},
				title: '',
				titleColor: ''
			}
		},
		computed: {
			isSingle() {
				const pages = getCurrentPages()
				return pages.length === 1
			},
			condition() {
				return `cat_id=='${this.id}'`
			},
			isFav() {
				if (this.hasLogin && ~this.userInfo.favs.indexOf(this.form._id)) {
					return true
				} else {
					return false
				}
			},
		},
		onLoad(option) {
			this.id = option.id
			this.fetchData()
			uni.$on('listUpdate',() => {
				this.fetchData()
			})
		},
		onReady() {
			const observer = uni.createIntersectionObserver(this)
			observer.relativeToViewport({
				bottom: 100,
			}).observe('#timeline', res => {
				if (res.intersectionRatio > 0) {
					// 进入视口
					observer.disconnect()
					this.$refs.timeline.loadData({
						clear: true
					})
				}
			})
		},
		onPageScroll(e) {
			const opacity = e.scrollTop / 100
			this.title = this.form.name
			this.titleColor = `rgba(255,255,255,${opacity})`
			this.background.background = this.form.female ?
				`linear-gradient(45deg, rgba(236,0,140,${opacity}), rgba(103,57,182,${opacity}))` :
				`linear-gradient(45deg, rgba(0,129,255,${opacity}), rgba(28,187,180,${opacity}))`
		},
		onReachBottom() {
			this.$refs.timeline.loadMore()
		},
		methods: {
			location(value) {
				if (typeof value === undefined) return '未知'
				const location = this.base.locations.find(v => v.id == value)
				return location.name
			},
			async fetchData() {
				const {result: {data: form}} = await db.collection('list').doc(this.id).get({
					getOne: true
				})
				const {result: {data: base}} = await db.collection('bases').doc(form.base_id).get({
					getOne: true
				})
				if(form.state === 2) {
					const {result: {data: owner}} = await db.collection('uni-id-users').doc(form.uid).field('nickname,avatar').get({
						getOne: true
					})
					this.owner = owner
				}
				this.form = form
				this.base = base
				uni.setNavigationBarTitle({
					title: this.form.name
				})
				this.loading = false
			},
			timelineLoaded(data) {
				data.map(item => {
					item.time = this.$u.timeFrom(item.create_date, 'yyyy/mm/dd')
				})
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
				}).then(() => {
					this.$u.toast(this.isFav ? '已收藏' : '已取消')
				})
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
			addTimeline() {
				const option = {
					sizeType: ['compressed'],
					success: res => {
						uni.navigateTo({
							url: `/pages/timeline/edit?cat_id=${this.form._id}&&files=${JSON.stringify(res)}`
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
			goAdopt() {
				// #ifdef H5
				location.href = 'https://wj.qq.com/s2/8284755/e3cf/'
				// #endif
				// #ifdef MP-WEIXIN
				uni.navigateToMiniProgram({
					appId: 'wxebadf544ddae62cb',
					path: 'pages/survey/index?sid=8284755&&hash=e3cf'
				})
				//#endif
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
	
	.action-bar {
		position: sticky;
		bottom: 0;
		z-index: 9;
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
