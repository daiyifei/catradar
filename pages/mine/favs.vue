<template>
	<view>
		<unicloud-db v-slot="{data, loading, error, options, hasMore}" collection="list" :where="condition" @load="loaded"> 
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
					<view class="action margin-right-xs">
						<view class="cu-tag round light bg-orange" @tap.stop.prevent="cancelFav(item._id)">取消</view>
					</view>
				</navigator>  
				<view class="cu-load text-gray" v-if="!hasMore">没有更多了</view>
			</view>
		</unicloud-db>
	</view>
</template>

<script>
	const db = uniCloud.database()
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
			}
		},
		computed: {
			...mapState(['hasLogin', 'userInfo']),
			condition() {
				const favs = []
				this.userInfo.fav.forEach(item => {
					favs.push(`'${item}'`)
				})
				return `_id in [${favs}]` 
			}
		},
		methods: {
			loaded(data) {
				data.map(item => {
					item.birthday = this.$root.$options.filters.age(item.birthday)
				})
			},
			cancelFav(id) {
				const { _id, fav } = this.userInfo
				fav.splice(fav.indexOf(id),1)
				db.collection('uni-id-users').doc(_id).update({
					fav
				}).then(() => {
					this.$u.toast('已取消')
				})
			}
		}
	}
</script>

<style>

</style>
