<template>
	<view>
		<cu-custom bgColor="bg-gradual-blue">
			<block slot="content">档案</block>
			<block slot="right">
				<view class="action">
					<view class="cu-load load-cuIcon" :class="loading?'loading':'over'"></view>
				</view>
			</block>
		</cu-custom>
		<!-- 搜索栏 -->
		<view class="cu-bar bg-white search fixed" :style="{top:CustomBar+'px'}">
			<view class="search-form round">
				<text class="cuIcon-search"></text>
				<input type="text" :placeholder="loading?'加载中':'在'+total+'只猫咪中搜索'" confirm-type="search" @input="onSearch"></input>
			</view>
			<view class="action" :class="JSON.stringify(params.condition)!='{}'?'text-orange':''" @tap="showFilter">
				<text>筛选</text>
				<text class="cuIcon-filter"></text>
			</view>
		</view>
		<!-- 索引列表 -->
		<indexes :list="list" :total="total" :loading="loading" :editable="editable" @refresh="fetchData" @delete="onDelete" />
		<!-- 空状态 -->
		<view class="flex justify-center padding text-sm text-gray" v-if="!loading&&!list.length">暂无内容</view>
		<!-- 侧边抽屉 -->
		<view class="cu-modal drawer-modal justify-end" :class="showDrawer ? 'show' : ''" @tap.stop="hideFilter" :style="[{top:CustomBar+'px',height:'calc(100vh - ' + CustomBar + 'px)'}]">
			<view class="cu-dialog bg-white basis-lg" @tap.stop="">
				<scroll-view scroll-y :style="{height:'calc(100vh - 60px - ' + CustomBar + 'px)'}">
					<view class="padding solid-bottom" v-for="(filter,index) in filters" :key="index">
						<view class="text-left padding-bottom-sm text-sm">{{filter.name}}</view>
						<view class="bg-white text-left">
							<view class="cu-tag padding radius light margin-right-xs margin-bottom-xs" :class="condition[filter.key]===filter.value[idx]?'bg-orange':''"
							 v-for="(item,idx) in filter.value" :key="idx" @tap.stop="setFilter(filter.key,item)">{{$root.$options.filters[filter.key](item)}}</view>
						</view>
					</view>
				</scroll-view>
				<view class="padding text-left">
					<button class="cu-btn light bg-red margin-right-xs" @tap.stop="clearFilter">清空</button>
					<button class="cu-btn light bg-blue" @tap.stop="applyFilter">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import indexes from '@/components/indexes.vue'
	export default {
		name: 'list',
		components: {
			indexes
		},
		data() {
			return {
				total: 0,
				list: [],
				loading: false,
				editable: false,
				showDrawer: false,
				condition: {},
				params: {
					condition: {},
					searchKey: 'name',
					searchValue: ''
				},
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
		onLoad() {
			this.fetchData()
		},
		onShow() {
			this.editable = false
			if (uni.getStorageSync('userInfo')) {
				this.editable = true
			}
		},
		methods: {
			fetchData() {
				this.loading = true
				this.$request('list', 'getList', this.params).then(res => {
					this.total = res.total
					this.list = res.data
					this.loading = false
				})
			},
			onSearch(e) {
				this.params.searchValue = e.detail.value
				this.fetchData()
			},
			showFilter() {
				this.condition = this.params.condition
				this.showDrawer = true
			},
			hideFilter() {
				this.showDrawer = false
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
				this.params.condition = this.condition
				this.fetchData()
				this.showDrawer = false
			},
			onDelete(id) {
				uni.showModal({
					content: '确定删除此档案吗？',
					showCancel: true,
					success: (res) => {
						if (res.confirm) {
							this.$request('list', 'del', {
								_id: id
							}).then(res => {
								uni.showToast({
									title: '删除成功',
									icon: 'none'
								})
								this.fetchData()
							})
						}
					}
				})
			}
		}
	}
</script>

<style>
	.cu-tag+.cu-tag {
		margin-left: 0;
	}
</style>
