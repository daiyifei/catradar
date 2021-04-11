<template>
	<view>
		<unicloud-db ref="udb" v-slot="{data, loading, hasMore}" collection="list" :where="condition" manual @load="loaded">
			<view class="cu-list menu-avatar no-padding">
				<navigator class="cu-item" :url="'/pages/list/detail?id='+item._id" v-for="(item,index) in data" :key="index">
					<image :src="item.avatar" mode="aspectFill" lazy-load class="cu-avatar round lg"></image>
					<view class="content">
						<view class="text-xl">{{item.name}}</view>
						<view class="text-gray text-sm">
							<text class="gender margin-right-xs" :class="item.female ? 'cuIcon-female female' : 'cuIcon-male'"></text>
							<text class="age">{{item.birthday}}</text>
						</view>
					</view>
					<view class="action margin-right-xs" v-if="userInfo._id===user._id">
						<view class="cu-tag round light bg-orange" @tap.stop.prevent="cancelFav(item._id)">取消</view>
					</view>
				</navigator>  
			</view>
			<view class="cu-load loading text-gray" v-if="loading"></view>
			<view class="cu-load text-gray text-sm" v-else-if="!hasMore">没有更多了</view>
		</unicloud-db>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				user: '',
				condition: ''
			}
		},
		onLoad(options) {
			db.collection('uni-id-users').doc(options.uid).field('favs').get({
				getOne: true
			}).then(res => {
				this.user = res.result.data
				this.condition = `_id in ${JSON.stringify(this.user.favs)}`
			})
		},
		methods: {
			loaded(data) {
				data.map(item => {
					item.birthday = this.$root.$options.filters.age(item.birthday)
				})
			},
			cancelFav(id) {
				const { _id, favs } = this.user
				favs.splice(favs.indexOf(id),1)
				db.collection('uni-id-users').doc(_id).update({
					favs
				}).then(() => {
					this.$u.toast('已取消')
				})
			}
		}
	}
</script>

<style>

</style>
