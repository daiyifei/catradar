<template>
	<view class="container">
		<view class="selected flex justify-between align-center" v-if="selected.name">
			<view class="content">
				<image class="cu-avatar sm round" :src="selected.avatar"></image>
				<text class="text-grey margin-left-sm">{{selected.name}}</text>
			</view>
			<text class="cuIcon-roundclose text-gray padding-tb" @tap="onClear"></text>
		</view>
		<view class="cu-load text-gray text-sm loading" v-else-if="loading"></view>
		<input type="text" v-model="searchValue" :placeholder="placeholder" @focus="showCandidates=true" @blur="onBlur" v-else>
		<view class="candidates" v-if="showCandidates">
			<scroll-view scroll-y show-scrollbar style="max-height:500rpx">
				<view class="cu-list menu sm-border">
					<view class="cu-item" v-for="(item,index) in candidates" :key="index" @tap="onSelect(item)">
						<view class="content">
							<image class="cu-avatar sm round" :src="item.avatar"></image>
							<text class="text-grey margin-left-sm">{{item.name}}</text>
						</view>
					</view>
				</view>
			</scroll-view>
			<view class="cu-item">
				<view class="content">
					<text class="cu-load text-gray text-sm loading" v-if="loadingCandidates"></text>
					<text class="cu-load text-gray text-sm" v-else>{{searchValue?'暂无更多':'输入名字显示更多结果'}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		behaviors: ['uni://form-field'],
		props: {
			value: {
				type: String,
				default: ''
			},
			placeholder: {
				type: String,
				default: '请输入'
			},
			limit: {
				type: Number,
				default: 10
			}
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data() {
			return {
				showCandidates: false,
				candidates: [],
				searchValue: '',
				selected: {},
				loading: false,
				loadingCandidates: false
			}
		},
		created() {
			if(this.value) {
				this.loading = true
				db.collection('list').doc(this.value).field('_id,name,avatar').get().then(res => {
					this.selected = res.result.data[0]
					this.loading = false
				})
			}else {
				this.selected = {}
			}
		},
		watch: {
			showCandidates(val) {
				if(val) {
					this.fetchCandidates()
				}
			},
			searchValue(val) {
				if(val && this.showCandidates) {
					this.fetchCandidates()
				}
			}
		},
		methods: {
			fetchCandidates() {
				this.loadingCandidates = true
				const reg = new RegExp('.*'+ this.searchValue, 'i')
				db.collection('list')
					.where(
						db.command.or([{
							name: reg,
						},{
							py: reg
						}])
					)
					.limit(this.limit)
					.orderBy('py asc')
					.get()
					.then(res => {
						this.candidates = res.result.data
						this.loadingCandidates = false
					})
			},
			onClear() {
				this.selected = {}
				this.searchValue = ''
				this.$emit('change', '')
			},
			onBlur() {
				setTimeout(() => {
					this.searchValue = ''
					this.showCandidates = false
				}, 100)
			},
			onSelect(item) {
				this.$set(this.selected, 'name', item.name)
				this.$set(this.selected, 'avatar', item.avatar)
				this.$emit('change', item._id)
			}
		}
	}
</script>

<style>
	.container {
		position: relative;
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
	
	.content {
		background: #fff;
		border-radius: 10rpx;
	}
	
	.cu-item {
		border-radius: 10rpx;
	}
</style>
