<template>
	<view>
		<cu-custom :bgColor="'bg-gradual-'+(form.male?'pink':'blue')" :isBack="true">
			<block slot="content">{{form.name}}</block>
			<block slot="right">
				<view class="action">
					<view class="cu-load load-cuIcon" :class="!loaded?'loading':'over'"></view>
				</view>
			</block>
		</cu-custom>
		<view v-if="loaded">
			<swiper class="swiper screen-swiper square-dot" :indicator-dots="true" :circular="true" v-if="form.album">
				<swiper-item v-for="(item,index) in form.album" :key="index">
					<view class="swiper-item" @tap="preview(index)">
						<video :src="item" autoplay loop :show-play-btn="false" :controls="false" objectFit="cover" v-if="item.split('.')[form.album.length]=='mp4'"/>
						<image :src="item" mode="aspectFill" v-else />
					</view>
				</swiper-item>
			</swiper>

			<view class="header margin flex align-center">
				<image :src="form.avatar" class="cu-avatar xl round margin-right-sm" v-if="form.avatar"></image>
				<view class="cu-avatar xl round margin-right-sm" v-else>{{form.name}}</view>
				<view>
					<text class="text-bold text-xxl">{{form.name}}</text>
					<view>
						<text class="gender margin-right-xs" :class="form.female ? 'cuIcon-female female' : 'cuIcon-male'"></text>
						<text class="text-grey">{{form.birthday|age}}</text>
					</view>
				</view>
			</view>
			<view class="cu-bar">
				<view class="action sub-title">
					<text class="text-xl text-bold text-green">基本信息</text>
					<text class="text-ABC text-green">information</text>
				</view>
			</view>
			<view class="basic margin">
				<view class="gender">性别: {{form.female|female}}</view>
				<view class="color">花色: {{form.color|color}}</view>
				<view class="birthday">生日: {{form.birthday?form.birthday:'未知'}}</view>
				<view>绝育: {{form.neuter|neuter}}</view>
				<view v-if="form.neuterDate">绝育时间: {{form.neuterDate}}</view>
				<view v-if="form.location">位置: {{form.location|location}}</view>
				<view v-if="form.intro">简介: {{form.intro}}</view>
			</view>
			<view class="cu-bar margin-tb" v-if="form.relation">
				<view class="action sub-title">
					<text class="text-xl text-bold text-blue">社会关系</text>
					<text class="text-ABC text-blue">relationship</text>
				</view>
			</view>
			<view class="flex flex-wrap margin-bottom">
				<navigator :url="'detail?id='+item.detail._id" class="relation-item margin-left margin-bottom" v-for="(item, index) in form.relation" :key="index">
					<image :src="item.detail.avatar" mode="aspectFill" class="cu-avatar xl round margin-bottom-xs" v-if="item.detail.avatar"></image>
					<view class="cu-avatar xl round margin-bottom-xs" v-else>{{item.detail.name}}</view>
					<view class="name">
						<view class="text-grey margin-bottom-xs">{{item.detail.name}}</view>
						<view class="tag cu-tag light bg-blue">{{item.tag}}</view>
					</view>
				</navigator>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: '',
				form: {},
				loaded: false
			}
		},
		onLoad(option) {
			this.id = option.id
			this.fetchData()
		},
		methods: {
			fetchData() {
				this.$get('list', this.id).then(res => {
					this.form = res.data[0]
					this.loaded = true
				})
			},
			preview(index) {
				uni.previewImage({
					current: index,
					urls: this.form.album
				})
			}
		}
	}
</script>

<style>
	/* swiper */
	.swiper {
		height: 750rpx;
	}
	
	.swiper-item {
		width: 750rpx;
		height: 750rpx;
	}
	
	/* header */
	.cu-avatar {
		overflow: hidden;
	}
	
	.header .gender {
		font-weight: bold;
		color: #87CEEB;
	}

	.header .female {
		color: #FFC0CB;
	}

	/* basic info */
	.basic {
		font-size: 28rpx;
		line-height: 1.75em;
	}
	
	/* relation */
	.relation-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.relation-item .name {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
