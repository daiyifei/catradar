<template>
	<view class="container">
		<view class="cu-bar bg-white fixed" :style="[{top:CustomBar + 'px'}]">
			<view class="search-form round">
				<text class="cuIcon-search"></text>
				<input type="text" :placeholder="loading?'加载中':'在'+total+'只猫咪中搜索'" confirm-type="search" @input="onSearch"></input>
			</view>
		</view>
		<scroll-view scroll-y class="indexes" :scroll-into-view="'indexes-'+ listCurID" :style="[{top:'calc(50px + ' + CustomBar + 'px)'},{height:'calc(100vh - var(--window-bottom) - ' + CustomBar + 'px - 50px)'}]"
		 :scroll-with-animation="true" :enable-back-to-top="true" refresher-enabled :refresher-triggered="loading"
		 @refresherrefresh="onPullDown">
			<block v-for="(group,index) in list" :key="index" v-if="total">
				<view :id="'indexes-' + group.name" :data-index="group.name">
					<view class="padding text-gray">{{group.name}}</view>
					<view class="cu-list menu-avatar no-padding">
						<view class="cu-item" :class="modalName=='move-box-'+index+'-'+idx?'move-cur':''"
						  v-for="(item,idx) in group.data" :key="idx" @touchstart="ListTouchStart" @touchmove="ListTouchMove" @touchend="ListTouchEnd" :data-target="'move-box-'+index+'-'+idx">
							<image :src="item.avatar" mode="aspectFill" class="cu-avatar round lg" @tap="toDetail(item._id)" v-if="item.avatar"></image>
							<view class="cu-avatar round lg" @tap="toDetail(item._id)" v-else>{{item.name}}</view>
							<view class="content" @tap="toDetail(item._id)">
								<view class="text-xl">{{item.name}}</view>
								<view class="text-gray text-sm">
									<text class="gender margin-right-xs" :class="item.male ? 'cuIcon-female female' : 'cuIcon-male'"></text>
									<text class="age">{{item.birthday|age}}</text>
								</view>
							</view>
							<view class="action margin-right">
								<view class="cu-tag round light" :class="'bg-'+(item.neuter?'olive':'orange')">{{item.neuter?'已':'未'}}绝育</view>
							</view>
							<view class="move" v-if="editable">
								<view class="bg-blue" @tap="toEdit(item._id)">编辑</view>
								<view class="bg-red" @tap="onDelete(item._id)">删除</view>
							</view>
						</view>
					</view>
				</view>
			</block>
			<view class="flex justify-center margin text-sm text-gray" v-if="!loading&&!list.length">暂无内容</view>
		</scroll-view>
		<!--索引列表-->
		<view class="indexBar" :style="[{height:'calc(100vh - ' + CustomBar + 'px - 50px)'}]">
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
		<navigator url="edit" class="cu-avatar round lg bg-gradual-blue cuIcon-add btn-new margin" v-if="editable"></navigator>
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
				listCurID: '',
				listCur: '',
				modalName: null,
				listTouchStart: 0,
				listTouchDirection: null
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
			// ListTouch触摸开始
			ListTouchStart(e) {
				if(!this.editable)
					return
				this.listTouchStart = e.touches[0].pageX
			},

			// ListTouch计算方向
			ListTouchMove(e) {
				if(!this.editable)
					return
				if(e.touches[0].pageX - this.listTouchStart < -80) {
					this.listTouchDirection = 'left'
				}
				if(e.touches[0].pageX - this.listTouchStart > 80) {
					this.listTouchDirection = 'right'
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
				uni.navigateTo({
					url: 'edit?id=' + id
				})
			},
			onDelete(id) {
				this.$emit('delete',id)
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
			},
			onPullDown() {
				this.$emit('pulldown')
			},
			onSearch(e) {
				this.$emit('search', e.detail.value)
			}
		}
	}
</script>
<style>
	.indexes {
		position: absolute;
	}

	.indexBar .indexBar-box {
		position: fixed;
		top: 50%;
		right: 20rpx;
		transform: translateY(-50%);
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
		right: 80rpx;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		width: 100rpx;
		height: 100rpx;
		border-radius: 10rpx;
		margin: auto;
		color: #fff;
		line-height: 100rpx;
		text-align: center;
		font-size: 48rpx;
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
