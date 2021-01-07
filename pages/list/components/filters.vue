<template>
	<view>
		<view @click="showDrawer" :class="Object.keys(condition).length ? 'text-orange' : ''">
			<text class="cuIcon-filter"></text>
			<text>筛选</text>
		</view>
		<view class="cu-modal drawer-modal justify-end" :class="show ? 'show' : ''" @tap.stop="hideDrawer" @touchmove.stop.prevent>
				<view class="cu-dialog bg-white basis-lg" @tap.stop.prevent>
					<scroll-view scroll-y @touchmove.stop.prevent style="height: 100vh;">
						<view class="cu-bar bg-white solid-bottom">
							<view class="action">
								<text class="cuIcon-title text-blue"></text>筛选
							</view>
						</view>
						<view class="padding solid-bottom" v-for="(filter,index) in filters" :key="index">
							<view class="text-left padding-bottom-sm text-sm">{{filter.name}}</view>
							<view class="bg-white text-left">
								<view class="cu-tag padding radius light margin-right-xs margin-bottom-xs" :class="condition[filter.key]===filter.value[idx]?'bg-orange':''"
								 v-for="(item,idx) in filter.value" :key="idx" @tap.stop="setFilter(filter.key,item)">{{$root.$options.filters[filter.key](item)}}</view>
							</view>
						</view>
						<view class="padding text-left">
							<button class="cu-btn light bg-red margin-right-xs" @tap.stop="clearFilter">清空</button>
							<button class="cu-btn light bg-blue" @tap.stop="applyFilter">确定</button>
						</view>
					</scroll-view>
				</view>
			</view>
	</view>
</template>

<script>
	export default {
		name: 'filters',
		props: {
			value: Object
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data() {
			return {
				show: false,
				condition: {},
				filters: [{
					key: 'female',
					name: '性别',
					value: [false, true]
				}, {
					key: 'neuter',
					name: '绝育',
					value: [false, true]
				}, {
					key: 'color',
					name: '花色',
					value: Array.from(Array(6), (v, k) => k),
				}, {
					key: 'location',
					name: '位置',
					value: Array.from(Array(19), (v, k) => k),
				}]
			}
		},
		methods: {
			showDrawer() {
				this.condition = this.value
				this.show = true
			},
			hideDrawer() {
				this.show = false
			},
			setFilter(key, value) {
				if (this.condition[key] === value) {
					this.$delete(this.condition, key)
				} else {
					this.$set(this.condition, key, value)
				}
			},
			clearFilter() {
				this.condition = {}
			},
			applyFilter() {
				this.$emit('change', this.condition)
				this.showDrawer = false
			}
		}
	}
</script>

<style>
	.cu-tag {
		margin-left: 0;
	}
</style>
