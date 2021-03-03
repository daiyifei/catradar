<template>
	<view>
		<view class="container skeleton">
			<!-- 封面 -->
			<swiper class="skeleton-rect swiper screen-swiper square-dot" :indicator-dots="true" :circular="true" @change="imgChange">
				<swiper-item v-for="(item,index) in form.album" :key="index">
					<view class="swiper-item" @tap="preview(form.album, index)">
						<video :src="item" autoplay loop :show-play-btn="false" :controls="false" objectFit="cover" v-if="item.split('.')[form.album.length]=='mp4'" />
						<image :src="item" mode="aspectFill" v-else @load="imgLoad"/>
					</view>
				</swiper-item>
			</swiper>
			
			<!-- 头像 -->
			<view class="padding flex align-center bg-white margin-sm radius">
				<image :src="form.avatar" class="skeleton-circle cu-avatar xl round margin-right-sm" v-if="form.avatar"></image>
				<view class="skeleton-circle cu-avatar xl round margin-right-sm" v-else>{{form.name}}</view>
				<view class="skeleton-rect">
					<text class="text-xxl">{{form.name}}</text>
					<view>
						<text class="gender margin-right-xs" :class="form.female ? 'cuIcon-female female' : 'cuIcon-male'"></text>
						<text class="text-grey text-lg">{{form.birthday|age}}</text>
					</view>
				</view>
			</view>
			
			<!-- 信息 -->
			<view class="skeleton-rect margin-sm bg-white radius">
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
				<unicloud-db
					ref="udb"
					v-slot:default="{data, loading, hasMore, error, options}" 
					collection="timeline"
					:where="`cat_id=='${id}'`"
					orderby="create_date desc">
					<view v-for="(item,index) in data" class="cu-timeline">
						<uni-dateformat :date="item.create_date" format="yyyy/M/d" :threshold="[60000, 3600000*24]" class="cu-time margin-left" />
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
				</unicloud-db>
				<view class="text-sm text-gray text-center padding-bottom">暂无更多</view>
			</view>
		</view>
	</view>
</template>

<script>
	import uniDateformat from "@/components/uni-dateformat/uni-dateformat.vue"
	export default {
		components: {
			uniDateformat
		},
		data() {
			return {
				current: 0,
				id: '',
				form: {},
				loading: true,
				scrolled: false
			}
		},
		onLoad(option) {
			this.id = option.id
			this.fetchData()
		},
		onPageScroll() {
			if(!this.scrolled) {
				uni.setNavigationBarColor({
					frontColor: '#ffffff',
					backgroundColor: this.form.female ? '#e03997' : '#0081ff'
				})
				this.scrolled = true
			}
		},
		methods: {
			fetchData() {
				this.$get('list', this.id).then(res => {
					this.form = res.data[0]
					uni.setNavigationBarTitle({
						title: this.form.name
					})
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
	
	/* list */
	.cu-list .action {
		padding-top: 20rpx;
		padding-bottom: 20rpx;
		text-align: left;
		line-height: 1.75em;
		width: 480rpx;
	}
</style>
