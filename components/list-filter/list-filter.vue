<template>
	<view>
		<view @tap="showDrawer" :class="filterOn ? 'text-orange' : ''">
			<text class="cuIcon-filter"></text>
			<text>筛选</text>
		</view>
		<view class="cu-modal drawer-modal justify-end" :class="show ? 'show' : ''" @tap.stop="hideDrawer" @touchmove.stop.prevent>
				<view class="cu-dialog bg-white basis-lg" @tap.stop.prevent>
					<scroll-view scroll-y @touchmove.stop.prevent style="height: 100vh;">
						<view class="padding solid-bottom" v-for="(filter,index) in filters" :key="index">
							<view class="text-left padding-bottom-sm text-sm">{{filter.name}}</view>
							<view class="bg-white text-left">
								<view class="cu-tag padding radius light margin-right-xs margin-bottom-xs" :class="condition[filter.key]===filter.value[idx]?'bg-orange':''"
								 v-for="(item,idx) in filter.value" :key="idx" @tap.stop="setFilter(filter.key,item)">{{showLabel(filter.key, item)}}</view>
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
					value: Array.from(this.$colors, (v, k) => k),
				}, {
					key: 'location',
					name: '位置',
					value: []
				}]
			}
		},
		computed: {
			filterOn() {
				return ~this.filters.findIndex(item => {
					return ~Object.keys(this.condition).indexOf(item.key)
				})
			}
		},
		watch: {
			baseInfo: {
				handler(val) {
					const { locations = [] } = val,
						value = []
					if(!locations.length)
						return
					this.$root.$options.filters.location = function(value) {
						const location = locations.find(v => v.id == value)
						return location.name
					}
					const target = this.filters.find(v => v.key == 'location')
					this.$set(target, 'value', Array.from(locations,v => v.id))
				},
				immediate: true
			}
		},
		methods: {
			showDrawer() {
				this.condition = this.$u.deepClone(this.value)
				this.show = true
			},
			hideDrawer() {
				this.show = false
			},
			showLabel(key, value) {
				const { filters } = this.$root.$options
				if(filters && (key in filters)) {
					return this.$root.$options.filters[key](value)
				}
			},
			setFilter(key, value) {
				if (this.condition[key] === value) {
					this.$delete(this.condition, key)
				} else {
					this.$set(this.condition, key, value)
				}
			},
			clearFilter() {
				this.filters.forEach(item => {
					this.$delete(this.condition, item.key)
				})
			},
			applyFilter() {
				this.$emit('change', this.condition)
				this.show = false
			}
		}
	}
</script>

<style>
	.cu-dialog {
		padding-top: var(--status-bar-height);
	}
	
	.cu-tag {
		margin-left: 0 !important;
	}
</style>
