<template>
	<view>
		<u-index-list :scrollTop="scrollTop" :indexList="indexList" :offset-top="offsetTop">
			<!-- 置顶项目 -->
			<slot></slot>
			
			<!-- 常规项目 -->
			<view v-for="(group, index) in indexData" :key="index">
				<u-index-anchor :index="group.name" />
				<view class="cu-list menu-avatar no-padding">
					<navigator class="cu-item" :url="'detail?id='+item._id" @longpress="showMenu(item._id)" v-for="(item,idx) in group.data" :key="idx">
						<image :src="item.avatar" mode="aspectFill" lazy-load class="cu-avatar round lg"></image>
						<view class="content">
							<view class="text-xl">{{item.name}}</view>
							<view class="text-gray text-sm">
								<text class="gender margin-right-xs" :class="item.female ? 'cuIcon-female female' : 'cuIcon-male'"></text>
								<text class="age">{{item.birthday|age}}</text>
							</view>
						</view>
						<view class="action margin-right-xl">
							<view class="cu-tag round light" :class="'bg-'+(item.neuter?'olive':'orange')">{{item.neuter|neuter}}</view>
						</view>
					</navigator>
				</view>
			</view>
			<!-- 计数 -->
			<view class="cu-load text-gray" v-if="list.length">共{{list.length}}只</view>
		</u-index-list>
		
		<!-- 操作菜单 -->
		<u-action-sheet :list="actions" @click="click" v-model="show"></u-action-sheet>
	</view>
</template>

<script>	
	const db = uniCloud.database()
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		props: {
			scrollTop: {
				type: Number,
				default: 0
			},
			offsetTop: {
				type: Number,
				default: 0
			},
			list: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				indexList: [],
				indexData: [],
				total: 0,
				actions: [{
					text: '编辑',
				}],
				show: false,
				id: ''
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
		watch: {
			list(val) {
				let letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
				this.indexList = []
				this.indexData = []
				letters.map(letter => {
					let cur = {
						name: letter.toUpperCase(),
						data: []
					}
					val.map(item => {
						if (item.py.substr(0,1) === letter) {
							cur.data.push(item)
						}
					})
					if(cur.data.length) {
						this.indexList.push(cur.name)
						this.indexData.push(cur)
					}
				})
			}
		},
		methods: {
			showMenu(id) {
				if(this.hasLogin && this.userInfo.scope === 9) {
					this.show = true
					this.id = id
				}
			},
			click(index) {
				uni.navigateTo({
					url: "edit?id=" + this.id
				})
			}
		}
	}
</script>

<style>
</style>
