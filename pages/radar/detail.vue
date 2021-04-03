<template>
	<view>
		<unicloud-db ref="udb" v-slot:default="{data, loading, pagination}" collection="uni-id-users" :where="condition2"
			field="_id,avatar,nickname,subscribes" getcount manual>
			<unicloud-db v-slot:default="{data, loading, options}" :options="pagination" collection="bases" getone :where="condition1" orderby="desc">
				<view class="cu-list menu-avatar" v-if="!loading">
					<view class="cu-item">
						<image class="cu-avatar round lg" :src="data.avatar" />
						<view class="content">
							<view class="text-grey">{{data.name}}</view>
							<view class="text-gray text-sm flex">
								<view class="text-cut">成员: {{options.count}}</view>
							</view>
						</view>
					</view>
				</view>
			</unicloud-db>
			<view class="cu-list menu-avatar">
				<view class="cu-item" v-for="(item, index) in data" :key="index">
					<image :src="item.avatar" class="cu-avatar round lg" />
					<view class="content">
						<text>{{item.nickname}}</text>
					</view>
				</view>
				<view class="cu-load loading text-gray" v-if="loading"></view>
			</view>
		</unicloud-db>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				condition1: '',
				condition2: ''
			}
		},
		onLoad(options) {
			this.condition1 = `_id=='${options.id}'`
			this.condition2 = `subscribes=='${options.id}'`
		},
		onReady() {
			this.$refs.udb.loadData()
		},
		onReachBottom() {
			this.$refs.udb.loadMore()
		}
	}
</script>

<style>

</style>
