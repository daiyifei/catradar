<template>
	<view>
		<!-- #ifdef MP-WEIXIN -->
		<u-navbar :background="background" :title="title" back-icon-color="#fff" :title-color="titleColor"></u-navbar>
		<!-- #endif -->
		<view class="container">
			<!-- 封面 -->
			<swiper class="swiper screen-swiper square-dot" :indicator-dots="true" :circular="true" @change="imgChange">
				<swiper-item v-for="(item,index) in form.album" :key="index">
					<view class="swiper-item" @tap="preview(form.album, index)">
						<video :src="item" autoplay loop :show-play-btn="false" :controls="false" objectFit="cover" v-if="item.split('.')[form.album.length]=='mp4'" />
						<image :src="item" mode="aspectFill" v-else @load="imgLoad"/>
					</view>
				</swiper-item>
			</swiper>
			
			<!-- 头像 -->
			<view class="padding flex align-center bg-white margin-sm radius">
				<image :src="form.avatar" class="cu-avatar xl round margin-right-sm" v-if="form.avatar"></image>
				<view class="cu-avatar xl round margin-right-sm" v-else>{{form.name}}</view>
				<view>
					<text class="text-xxl">{{form.name}}</text>
					<view>
						<text class="gender margin-right-xs" :class="form.female ? 'cuIcon-female female' : 'cuIcon-male'"></text>
						<text class="text-grey text-lg">{{form.birthday|age}}</text>
					</view>
				</view>
			</view>
			
			<!-- 信息 -->
			<view class="margin-sm bg-white radius">
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
					<view class="cu-item" v-if="form.location">
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
			<view class="margin-sm bg-white radius radius" v-if="form.relation">
				<view class="cu-bar">
					<view class="action sub-title">
						<text class="text-xl text-bold text-blue">关系</text>
						<text class="text-ABC text-blue">relationship</text>
					</view>
				</view>
				<view class="cu-list grid col-4 no-border">
					<view class="cu-item" v-for="(item, index) in form.relation" :key="index">
						<navigator :url="'detail?id='+item.detail._id" class="flex flex-direction align-center">
							<image :src="item.detail.avatar" mode="aspectFill" class="cu-avatar xl round margin-bottom-xs" v-if="item.detail.avatar"></image>
							<view class="cu-avatar xl round margin-bottom-xs" v-else>{{item.detail.name}}</view>
							<view class="flex">
								<view class="margin-right-xs">{{item.tag}}</view>
								<view class="text-blue">{{item.detail.name}}</view>
							</view>
						</navigator>
					</view>
				</view>
			</view>
			
			<!-- 动态 -->
			<view class="margin-sm bg-white radius radius">
				<view class="cu-bar">
					<view class="action sub-title">
						<text class="text-xl text-bold text-orange">动态</text>
						<text class="text-ABC text-orange">timeline</text>
					</view>
				</view>
				<view v-for="(item,index) in timeline" :key="index" class="cu-timeline">
					<view class="cu-time margin-left">{{item.create_date|timeFrom('yy/mm/dd')}}</view>
					<view class="cu-item" :class="index?'':'text-blue'">
						<view class="content">
							<view class="text-content">{{item.text}}</view>
							<view class="grid grid-square col-3 margin-top-sm">
								<view class="bg-img" v-for="(pic,idx) in item.album" :key="idx">
									<image :src="pic" mode="aspectFill" @tap.stop="preview(item.album, idx)"></image>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="text-sm text-gray text-center padding-bottom">暂无更多</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				current: 0,
				id: '',
				form: {},
				timeline: [],
				loading: true,
				background: {
					background: ''
				},
				title: '',
				titleColor: ''
			}
		},
		onLoad(option) {
			this.id = option.id
			this.fetchData()
		},
		onPageScroll(e) {
			const opacity = e.scrollTop/100
			this.title = this.form.name
			this.titleColor = `rgba(255,255,255,${opacity})`
			this.background.background = this.form.female ? 
				`rgba(224,57,151,${opacity})` : `rgba(0,129,255,${opacity})`
		},
		methods: {
			fetchData() {
				const db = uniCloud.database()
				db.collection('list').doc(this.id).get().then(res => {
					this.form = res.result.data[0]
					uni.setNavigationBarTitle({
						title: this.form.name
					})
				})
				db.collection('timeline').where({
					cat_id: this.id
				}).orderBy('create_date','desc').get().then(res => {
					this.timeline = res.result.data
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
			onNavigationBarButtonTap(e) {
				switch(e.type) {
					case 'share':
						uni.share({
							provider: "weixin",
							scene: "WXSceneSession",
						  type: 2,
						  imageUrl: this.form.album[this.current],
						  fail(e) {
								console.log(e)
						  }
						})
						break
					default:
						break
				}
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
	
	/* gender */
	.gender {
		font-weight: bold;
		color: #87CEEB;
	}

	.female {
		color: #FFC0CB;
	}
	
	.cu-list .action {
		padding-top: 20rpx;
		padding-bottom: 20rpx;
		text-align: left;
		line-height: 1.75em;
		width: 480rpx;
	}
</style>
