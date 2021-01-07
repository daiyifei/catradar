<template>
	<view class="cu-item">
		<image :src="data.avatar" mode="aspectFill" lazy-load class="cu-avatar round lg" @tap="toDetail(data._id)" v-if="data.avatar"></image>
		<view class="cu-avatar round lg" @tap="toDetail(data._id)" v-else>{{data.name}}</view>
		<view class="content" @tap="toDetail(data._id)">
			<view class="text-xl">{{data.name}}</view>
			<view class="text-gray text-sm">
				<text class="gender margin-right-xs" :class="data.female ? 'cuIcon-female female' : 'cuIcon-male'"></text>
				<text class="age">{{data.birthday|age}}</text>
			</view>
		</view>
		<view class="action margin-right">
			<view class="cu-tag round light" :class="'bg-'+(data.neuter?'olive':'orange')">{{data.neuter|neuter}}</view>
		</view>
		<view class="move" v-if="editable">
			<view class="t bg-blue" @tap="toEdit(data._id)">编辑</view>
			<view class="t bg-red" @tap="onDelete(data._id)">删除</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'item',
		props: {
			data: Object
		},
		data() {
			return {
				editable: false
			};
		},
		methods: {
			toDetail(id) {
				uni.navigateTo({
					url: 'detail?id=' + id
				})
			},
			toEdit(id) {
				this.slide = false
				uni.navigateTo({
					url: 'edit?id=' + id
				})
			},
			onDelete(id) {
				this.slide = false
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
.cu-item {
	padding-right: 15px !important;
}
.gender {
	color: #87CEEB;
}

.gender.female {
	color: #FFC0CB;
}
</style>
