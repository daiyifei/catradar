<template>
	<view class="container">
		<input :placeholder="placeholder" name="input" @focus="onFocus" @blur="onBlur" @input="onInput" :value="selected.name"></input>
		<scroll-view scroll-y show-scrollbar class="candidates bg-white shadow-warp radius" v-if="showCandidates">
			<view class="cu-list menu sm-border">
				<view class="cu-item" v-for="(item,index) in candidates" :key="index" @tap="onSelect(item)">
					<view class="content">
						<image class="cu-avatar sm round" :src="item.avatar" v-if="item.avatar"></image>
						<text class="text-grey margin-left-sm">{{item.name}}</text>
					</view>
				</view>
				<view class="cu-item" v-if="!candidates.length">
					<view class="content text-gray text-sm">
						<text class="cu-load text-gray text-sm" :class="loading?'loading':''" v-if="loading"></text>
						<text class="text-gray text-sm" v-else>暂无内容</text>
					</view>
				</view>
			</view>
		</scroll-view >
	</view>
</template>

<script>
	export default {
		props: {
			value: {
				type: Object,
				default: () => {}
			},
			placeholder: String
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data() {
			return {
				loading: false,
				showCandidates: false,
				searchValue: '',
				candidates: [],
				selected: {}
			}
		},
		watch: {
			value(val) {
				this.selected = val
				this.searchValue = ''
				this.candidates = []
			}
		},
		methods: {
			onFocus() {
				this.showCandidates = true
				this.fetchData()
			},
			onBlur() {
				setTimeout(() => {
					this.showCandidates = false
				},100)
			},
			onInput(e) {
				this.searchValue = e.detail.value
				this.fetchData()
			},
			onSelect(item) {
				this.selected = item
				this.showCandidates = false
				this.$emit('change',item)
			},
			fetchData() {
				this.loading = true
				this.$get('list',{
					 name: new RegExp('.*' + this.searchValue,'i') 
				},5).then(res => {
					this.candidates = res.data
					this.loading = false
				})
			}
		}
	}
</script>

<style>
	.container {
		position: relative;
		z-index: 9;
	}
	
	.candidates {
		position: absolute;
		top: 50px;
		width: 100%;
		min-height: 50px;
		max-height: 100px;
	}
</style>
