<template>
	<view>
		<unicloud-db ref="udb" v-slot="{data, loading, hasMore}" collection="list" manual :where="condition" @load="loaded"> 
			<view class="cu-load loading text-gray" v-if="loading"></view>
			<view class="cu-list menu-avatar no-padding" v-else>
				<navigator class="cu-item" :url="'/pages/list/detail?id='+item._id" v-for="(item,index) in data" :key="index">
					<image :src="item.avatar" mode="aspectFill" lazy-load class="cu-avatar round lg"></image>
					<view class="content">
						<view class="text-xl">{{item.name}}</view>
						<view class="text-gray text-sm">
							<text class="gender margin-right-xs" :class="item.female ? 'cuIcon-female female' : 'cuIcon-male'"></text>
							<text class="age">{{item.birthday}}</text>
						</view>
					</view>
					<view class="action margin-right-xs" v-if="userInfo._id===uid">
						<navigator class="cu-tag round light bg-blue" :url="'/pages/list/edit?id='+item._id">编辑</navigator>
					</view>
				</navigator>  
				<view class="cu-load loading text-gray" v-if="loading"></view>
				<view class="cu-load text-gray text-sm" v-else-if="!hasMore">没有更多了</view>
			</view>
		</unicloud-db>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				uid: '',
				condition: ''
			}
		},
		onLoad(options) {
			this.uid = options.uid
			this.$nextTick(() => {
				this.condition = `uid=='${options.uid}'&&state==2`
			})
		},
		methods: {
			loaded(data) {
				data.map(item => {
					item.birthday = this.$root.$options.filters.age(item.birthday)
				})
			}
		}
	}
</script>

<style>

</style>
