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
		<indexes :list="list" :total="total" :loading="loading" :editable="editable" @pulldown="fetchData" @search="onSearch" @delete="onDelete"/>
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
				searchValue: ''
			}
		},
		onLoad() {
			this.fetchData()
		},
		onShow() {
			this.editable = false
			if(uni.getStorageSync('userInfo')) {
				this.editable = true
			}
		},
		methods: {
			fetchData() {
				this.loading = true
				this.$request('list','getList',{
					searchKey: 'name',
					searchValue: this.searchValue
				}).then(res => {
					this.total = res.total
					this.list = res.data
					this.loading = false
				})
			},
			onPullDownRefresh() {
				this.fetchData()
			},
			onSearch(val) {
				this.searchValue = val
				this.fetchData()
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
	
</style>
