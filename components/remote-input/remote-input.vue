<template>
	<view class="container">
		<view class="selected flex justify-between align-center" v-if="selected[valueKey]">
			<view class="content">
				<image class="cu-avatar sm round" :src="selected[picKey]"/>
				<text class="text-grey margin-left-sm">{{selected[valueKey]}}</text>
			</view>
			<text class="cuIcon-roundclose text-gray padding-tb" @tap="onClear"></text>
		</view>
		<view class="cu-load text-gray text-sm loading" v-else-if="loading"></view>
		<input type="text" v-model="searchValue" :placeholder="placeholder" @focus="showCandidates=true" @blur="onBlur" v-else>
		<view class="candidates" v-if="showCandidates">
			<scroll-view scroll-y show-scrollbar style="max-height:500rpx">
				<view class="cu-list menu sm-border">
					<!-- 置顶 -->
					<navigator class="cu-item" url="/pages/list/edit" v-if="showAdd">
						<view class="content">
							<text class="cu-avatar sm round bg-gradual-blue">New</text>
							<text class="margin-left-sm text-blue">新建档案</text>
						</view>
					</navigator>
					<!-- 候选 -->
					<view class="cu-item" v-for="(item,index) in candidates" :key="index" @tap="onSelect(item)">
						<view class="content">
							<image class="cu-avatar sm round" :src="item[picKey]"></image>
							<text class="text-grey margin-left-sm">{{item[valueKey]}}</text>
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
			collection: String,
			valueKey: String,
			searchKey: String,
			picKey: {
				type: String,
				default: 'avatar'
			},
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
			},
			showAdd: {
				type: Boolean,
				default: false
			}
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
		watch: {
			value: {
				handler(val) {
					if(val && !this.selected[this.valueKey]) {
						this.loading = true
						db.collection(this.collection).doc(this.value).field(this.valueKey + ',avatar').get({
							getOne: true
						}).then(res => {
							this.selected = res.result.data || {}
							this.loading = false
						})
					}
				},
				immediate: true
			},
			showCandidates(val) {
				if(val) {
					this.fetchCandidates()
				}
			},
			searchValue(val) {
				if(val && this.showCandidates) {
					this.$u.debounce(this.fetchCandidates, 500)
				}
			}
		},
		methods: {
			fetchCandidates() {
				this.loadingCandidates = true
				const reg = new RegExp('.*'+ this.searchValue, 'i')
				const condition = []
				this.searchKey.split(',').forEach(item => {
					condition.push({
						[item]: reg
					})
				})
				
				db.collection(this.collection)
					.where(db.command.or(condition))
					.field(this.valueKey + ',avatar')
					.limit(this.limit)
					.orderBy(this.valueKey + ' asc')
					.get()
					.then(res => {
						this.candidates = res.result.data
						this.loadingCandidates = false
					})
			},
			onClear() {
				this.selected = {}
				this.searchValue = ''
				this.$emit('input', '')
			},
			onBlur() {
				setTimeout(() => {
					this.searchValue = ''
					this.showCandidates = false
				}, 100)
			},
			onSelect(item) {
				this.$set(this.selected, this.valueKey, item[this.valueKey])
				this.$set(this.selected, this.picKey, item[this.picKey])
				this.$emit('input', item._id)
				this.showCandidates = false
			}
		}
	}
</script>

<style>
	.container {
		position: relative;
		width: 100%;
		z-index: 99;
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
