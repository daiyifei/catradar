<template>
	<view>
		<view class="cu-load loading text-gray" v-if="loading"></view>
		
		<view class="cu-load text-gray" v-else-if="!data.length">暂无结果</view>
		
		<u-index-list :scrollTop="scrollTop" :indexList="indexList" v-else>
			<!-- 置顶项目 -->
			<slot name="top"></slot>
			
			<!-- 常规项目 -->
			<view v-for="(item, index) in data" :key="index">
				<u-index-anchor :index="item.name" />
				<view class="cu-list menu-avatar no-padding">
					<navigator class="cu-item" :url="'detail?id='+item._id" @longpress="showMenu(item._id)" v-for="(item,idx) in item.data" :key="idx">
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
		</u-index-list>
		
		<u-action-sheet :list="actions" @click="click" v-model="show"></u-action-sheet>
	</view>
</template>

<script>	
	export default {
		props: {
			scrollTop: Number,
			condition: Object
		},
		data() {
			return {
				loading: false,
				data: [],
				indexList: [],
				total: 0,
				actions: [{
					text: '编辑',
				}],
				show: false,
				id: ''
			}
		},
		created() {
			this.fetchData()
		},
		watch: {
			scrollTop(val) {
				this.scrollTop = val
			},
			condition(val) {
				this.fetchData()
			}
		},
		methods: {
			async fetchData() {
				this.loading = true
				this.indexList = []
				this.data = []
				
				const db = uniCloud.database()
				const { result:{ data } } = await db.collection('list').where(this.condition||{}).orderBy('py,desc').get()
				
				let letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
				letters.map(letter => {
					let cur = {
						name: letter.toUpperCase(),
						data: []
					}
					data.map(item => {
						if (item.py.substr(0,1) === letter) {
							cur.data.push(item)
						}
					})
					if(cur.data.length) {
						this.indexList.push(cur.name)
						this.data.push(cur)
					}
				})
				
				this.loading = false
				uni.stopPullDownRefresh()
			},
			showMenu(id) {
				this.show = true
				this.id = id
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
	.gender {
		color: #87CEEB;
	}
	
	.gender.female {
		color: #FFC0CB;
	}
</style>
