<template>
	<view>
		<unicloud-db ref="users" v-slot:default="{data, loading, pagination, options}" :options="base" collection="uni-id-users" :where="condition"
			field="_id,avatar,nickname,subscribes" getcount manual>
			<view class="cu-list menu-avatar">
				<view class="cu-item">
					<image class="cu-avatar round lg" :src="options.avatar" v-if="options.avatar"/>
					<text class="cu-avatar round lg" v-else>{{options.name[0]}}</text>
					<view class="content">
						<view class="text-grey">{{options.name}}</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">成员: {{pagination.count}}</view>
						</view>
					</view>
				</view>
				<view class="cu-item" v-for="(item, index) in data" :key="index">
					<image :src="item.avatar" class="cu-avatar round lg" />
					<view class="content">
						<text>{{item.nickname}}</text>
					</view>
				</view>
				<view class="cu-load loading text-gray" v-if="loading"></view>
				<view class="cu-load text-gray" v-else>共{{pagination.count}}人</view>
			</view>
		</unicloud-db>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				base: {},
				condition: '',
			}
		},
		onLoad(options) {
			this.condition = `subscribes=='${options.id}'`
			db.collection('bases').doc(options.id).get({
				getOne: true
			}).then(res => {
				this.base = res.result.data
			})
		},
		onReady() {
			this.$refs.users.loadData()
		},
		onReachBottom() {
			this.$refs.users.loadMore()
		}
	}
</script>

<style>

</style>
