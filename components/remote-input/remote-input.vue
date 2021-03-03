<template>
	<view>
		<unicloud-db 
			ref="udb" 
			v-slot="{data, loading, hasMore, error, options}" 
			collection="list"
			:page-size="limit"
			:where="'/' + (searchValue || '.*') + '/.test(' + searchKey + ')'">
			<view class="container">
				<input :placeholder="placeholder" @focus="onFocus" @blur="onBlur" v-model="searchValue"></input>
				<scroll-view scroll-y show-scrollbar class="candidates bg-white shadow-warp radius" v-if="showCandidates">
					<view class="cu-list menu sm-border">
						<view class="cu-item" v-for="(item,index) in data" :key="index" @tap="onSelect(item)">
							<view class="content">
								<image class="cu-avatar sm round" :src="item.avatar" v-if="item.avatar"></image>
								<text class="text-grey margin-left-sm">{{item.name}}</text>
							</view>
						</view>
						<view class="cu-item">
							<view class="content">
								<text class="cu-load text-gray text-sm loading" v-if="loading"></text>
								<text class="cu-load text-gray text-sm" v-else>{{hasMore ? '搜索更多' : '没有更多了'}}</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</unicloud-db>
	</view>
</template>

<script>
	export default {
		behaviors: ['uni://form-field'],
		props: {
			valueKey: {
				type: String,
				default: '_id'
			},
			searchKey: {
				type: String,
				default: 'name'
			},
			limit: {
				type: Number,
				default: 5
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
				searchValue: ''
			}
		},
		methods: {
			onFocus() {
				this.showCandidates = true
			},
			onInput(e) {
				this.searchValue = e.detail.value
			},
			onBlur() {
				setTimeout(() => {
					this.showCandidates = false
				},100)
			},
			onSelect(item) {
				this.searchValue = item[this.searchKey]
				this.$emit('change', item[this.valueKey])
				this.showCandidates = false
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
	}
</style>
