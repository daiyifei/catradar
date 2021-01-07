<template>
	<view>
		<scroll-view scroll-y  class="indexes" :scroll-into-view="'indexes-'+ listCurID" :style="{top: CustomBar + 50 + 'px'}"
		  scroll-with-animation :scroll-animation-duration="300" refresher-enabled :refresher-triggered="loading" @refresherrefresh="onRefresh">
			<!-- 置顶项目 -->
			<view class="cu-list menu">
				<view class="cu-item">
					<view class="content">
						<text class="cuIcon-presentfill text-green"></text>
						<text class="text-grey">待领养</text>
					</view>
				</view>
				<view class="cu-item">
					<view class="content">
						<text class="cuIcon-crownfill text-orange"></text>
						<text class="text-grey">已领养</text>
					</view>
				</view>
				<view class="cu-item">
					<view class="content text-xl">
						<text class="cuIcon-explorefill text-blue"></text>
						<text class="text-grey">失踪中</text>
					</view>
				</view>
				<view class="cu-item">
					<view class="content">
						<text class="cuIcon-discoverfill text-grey"></text>
						<text class="text-grey">回喵星</text>
					</view>
				</view>
			</view>
			<!--列表主体-->
			<block v-for="(group,index) in list" :key="index" v-if="total">
				<view :id="'indexes-'+group.name" :data-index="group.name" class="group">
					<view class="padding text-gray">{{group.name}}</view>
					<view class="cu-list menu-avatar no-padding">
						<view class="cu-item" :class="modalName=='move-box-'+index+'-'+idx?'move-cur':''"
						  v-for="(item,idx) in group.data" :key="idx" @touchstart="ListTouchStart" @touchmove="ListTouchMove" @touchend="ListTouchEnd" :data-target="'move-box-'+index+'-'+idx">
							<image :src="item.avatar" mode="aspectFill" lazy-load class="cu-avatar round lg" @tap="toDetail(item._id)" v-if="item.avatar"></image>
							<view class="cu-avatar round lg" @tap="toDetail(item._id)" v-else>{{item.name}}</view>
							<view class="content" @tap="toDetail(item._id)">
								<view class="text-xl">{{item.name}}</view>
								<view class="text-gray text-sm">
									<text class="gender margin-right-xs" :class="item.female ? 'cuIcon-female female' : 'cuIcon-male'"></text>
									<text class="age">{{item.birthday|age}}</text>
								</view>
							</view>
							<view class="action margin-right">
								<view class="cu-tag round light" :class="'bg-'+(item.neuter?'olive':'orange')">{{item.neuter|neuter}}</view>
							</view>
							<view class="move" v-if="editable">
								<view class="t bg-blue" @tap="toEdit(item._id)">编辑</view>
								<view class="t bg-red" @tap="onDelete(item._id)">删除</view>
							</view>
						</view>
					</view>
				</view>
			</block>
		</scroll-view>
		<!--索引列表-->
		<view class="indexBar padding" v-if="!slide">
			<view class="indexBar-box" @touchstart="tStart" @touchend="tEnd" @touchmove.stop="tMove">
				<view class="indexBar-item" v-for="(item,index) in list" :key="index" :id="index" @touchstart="getCur" @touchend="setCur">
					{{item.name}}</view>
			</view>
		</view>
		<!--选择显示-->
		<view v-show="!hidden" class="indexToast">
			{{listCur}}
		</view>
		<!--新建按钮-->
		<navigator url="edit" class="cu-avatar round lg bg-gradual-blue cuIcon-add btn-new margin" v-if="editable&&!slide"></navigator>
	</view>
</template>

<script>
	export default {
		name: 'indexes',
		props: {
			list: Array,
			total: Number,
			loading: Boolean,
			editable: Boolean,
		},
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				hidden: true,
				slide: false,
				listCurID: '',
				listCur: '',
				modalName: null,
				listTouchStart: 0,
				listTouchDirection: null,
				heightArr: []
			}
		},
		watch: {
			list(val) {
				if (val.length) {
					this.$nextTick(() => {
						this.getHeight()
					})
				}
			}
		},
		methods: {
			onRefresh() {
				this.$emit('refresh')
			},
			//获取高度
			getHeight() {
				uni.createSelectorQuery().select('.indexBar-box').boundingClientRect(res => {
					if(res) {
						this.boxTop = res.top
					}
				}).exec();
				uni.createSelectorQuery().select('.indexes').boundingClientRect(res => {
					if(res) {
						this.barTop = res.top
					}
				}).exec()
				uni.createSelectorQuery().select('.indexBar-item').boundingClientRect(res => {
					if(res) {
						this.itemHeight = res.height
					}
				}).exec()
			},
			onScroll(e) {
				const { scrollTop } = e.detail
				this.heightArr.forEach((height, index) => {
					if (scrollTop + 10 > (index ? this.heightArr[index - 1] : 0) && scrollTop < height) {
						this.activeIndex = index
					}
				})
			},
			// ListTouch触摸开始
			ListTouchStart(e) {
				if(!this.editable)
					return
				this.listTouchStart = e.touches[0].pageX
				this.slide = false
			},
			// ListTouch计算方向
			ListTouchMove(e) {
				if(!this.editable)
					return
				if(e.touches[0].pageX - this.listTouchStart < -60) {
					this.listTouchDirection = 'left'
					this.slide = true
				}
				if(e.touches[0].pageX - this.listTouchStart > 60) {
					this.listTouchDirection = 'right'
					this.slide = false
				}
			},
			// ListTouch计算滚动
			ListTouchEnd(e) {
				if(!this.editable)
					return
				if (this.listTouchDirection == 'left') {
					this.modalName = e.currentTarget.dataset.target
				} else {
					this.modalName = null
				}
				this.listTouchDirection = null
			},
			toDetail(id) {
				uni.navigateTo({
					url: 'detail?id=' + id
				})
			},
			toEdit(id) {
				this.slide = false
				uni.navigateTo({
					url: 'edit?id=' + id
				})
			},
			onDelete(id) {
				this.slide = false
				this.$emit('delete',id)
			},
			//获取文字信息
			getCur(e) {
				this.hidden = false;
				this.listCur = this.list[e.target.id].name;
			},
			setCur(e) {
				this.hidden = true;
				this.listCur = this.listCur
			},
			//滑动选择Item
			tMove(e) {
				let y = e.touches[0].clientY,
					offsettop = this.boxTop
				//判断选择区域,只有在选择区才会生效
				if (y > offsettop) {
					let index = parseInt((y - offsettop) / this.itemHeight)
					if (index < this.list.length) {
						this.listCur = this.list[index].name
					}
				}
			},
			//触发全部开始选择
			tStart() {
				this.hidden = false
			},

			//触发结束选择
			tEnd() {
				this.hidden = true;
				this.listCurID = this.listCur
			},
			indexSelect(e) {
				let that = this;
				let barHeight = this.barHeight;
				let list = this.list;
				let scrollY = Math.ceil(list.length * e.detail.y / barHeight);
				for (let i = 0; i < list.length; i++) {
					if (scrollY < i + 1) {
						that.listCur = list[i].name;
						that.movableY = i * 20
						return false
					}
				}
			}
		}
	}
</script>
<style>	
	.indexes {
		/* bottom: var(--window-bottom); */
		left: 0;
		right: 0;
	}
	
	.cu-item {
		padding-right: 80rpx !important;
	}
	
	.indexBar {
		position: fixed;
		top: calc(var(--status-bar-height) + var(--window-top) + 100px);
		bottom: calc(var(--window-bottom) + 64px);
		right: 0;
		display: flex;
		align-items: center;
	}

	.indexBar .indexBar-box {
		background: rgba(255, 255, 255, .5);
		display: flex;
		flex-direction: column;
		box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);
		border-radius: 10rpx;
	}

	.indexBar-item {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		color: #888;
	}
	
	.indexBar-item.active {
		color: #1296db;
	}

	movable-view.indexBar-item {
		width: 40rpx;
		height: 40rpx;
		z-index: 9;
		position: relative;
	}

	movable-view.indexBar-item::before {
		content: "";
		display: block;
		position: absolute;
		left: 0;
		top: 10rpx;
		height: 20rpx;
		width: 4rpx;
		background-color: #f37b1d;
	}

	.indexToast {
		position: fixed;
		top: 0;
		right: 100rpx;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		width: 120rpx;
		height: 120rpx;
		border-radius: 10rpx;
		margin: auto;
		color: #fff;
		line-height: 120rpx;
		text-align: center;
		font-size: 52rpx;
	}

	.gender {
		color: #87CEEB;
	}

	.gender.female {
		color: #FFC0CB;
	}

	.btn-new {
		position: fixed;
		right: 0;
		bottom: var(--window-bottom);
		opacity: .9;
	}
</style>
