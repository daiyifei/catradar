<template>
	<view class="container">
		<unicloud-db 
			ref="udb" 
			v-slot="{data, loading, hasMore, error, options}" 
			collection="list"
			:page-size="5"
			:where="`/${searchValue||'.*'}/.test(name)||/${searchValue||'.*'}/.test(py)`"
			orderby="py asc">
			<view class="selected flex justify-between align-center" v-if="selected.name">
				<view class="content">
					<image class="cu-avatar sm round" :src="selected.avatar"></image>
					<text class="text-grey margin-left-sm">{{selected.name}}</text>
				</view>
				<text class="cuIcon-roundclose text-gray padding-tb" @tap="onClear"></text>
			</view>
			<input type="text" v-model="searchValue" :placeholder="placeholder" @focus="showCandidates=true" v-else>
			<view class="candidates" v-if="showCandidates">
				<scroll-view scroll-y show-scrollbar class="scroll-list">
					<view class="cu-list menu sm-border">
						<view class="cu-item" v-for="(item,index) in data" :key="index" @tap="onSelect(item)">
							<view class="content">
								<image class="cu-avatar sm round" :src="item.avatar"></image>
								<text class="text-grey margin-left-sm">{{item.name}}</text>
							</view>
						</view>
					</view>
				</scroll-view>
				<view class="cu-item">
					<view class="content">
						<text class="cu-load text-gray text-sm loading" v-if="loading"></text>
						<text class="cu-load text-gray text-sm" v-else>{{hasMore ? '输入名字以显示更多结果' : '没有更多了'}}</text>
					</view>
				</view>
			</view>
		</unicloud-db>
	</view>
</template>

<script>
	export default {
		behaviors: ['uni://form-field'],
		props: {
			value: String,
			data: {
				type: Object,
				default: () => {} 
			},
			placeholder: {
				type: String,
				default: '请输入'
			}
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data() {
			return {
				showCandidates: false,
				searchValue: '',
				selected: {}
			}
		},
		watch: {
			data(val) {
				console.log(val)
				this.selected = val
			}
		},
		methods: {
			onClear() {
				this.selected = {}
				this.searchValue = ''
				this.$emit('change', '')
			},
			onSelect(item) {
				this.$set(this.selected, 'name', item.name)
				this.$set(this.selected, 'avatar', item.avatar)
				this.showCandidates = false
				this.$emit('change', item._id)
			}
		}
	}
</script>

<style>
	.container {
		position: relative;
		width: 100%;
	}
	
	.candidates {
		position: absolute;
		top: 100rpx;
		left: 20rpx;
		right: 20rpx;
		z-index: 9;
		background: #fff;
		border-radius: 10rpx;
		border: 1px solid #eee;
		box-shadow: 0 0 10rpx #eee;
	}
	
	.candidates::before {
		content: '';
		position: absolute;
		top: -12rpx;
		width: 24rpx;
		height: 24rpx;
		left: 100rpx;
		transform: rotate(45deg);
		background: #fff;
		border: 1px solid #eee;
		z-index: -1;
	}
	
	.cu-list.menu>.cu-item {
		border-radius: 10rpx;
	}
	
	.scroll-list {
		height: 300rpx;
	}
</style>
