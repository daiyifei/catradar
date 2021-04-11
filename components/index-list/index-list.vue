<template>
	<view>
		<u-index-list :scrollTop="scrollTop" :offsetTop="offsetTop" :indexList="indexList" >
			<!-- 置顶项目 -->
			<slot></slot>
			
			<!-- 常规项目 -->
			<view v-for="(group, index) in indexData" :key="index">
				<u-index-anchor :index="group.name" />
				<view class="cu-list menu-avatar no-padding">
					<navigator class="cu-item" :url="'detail?id='+item._id" @longpress="showMenu(item)" v-for="(item,idx) in group.data" :key="idx">
						<image :src="item.avatar" class="cu-avatar round lg" lazy-load />
						<view class="content">
							<view class="text-xl">{{item.name}}</view>
							<view class="text-gray text-sm">
								<text class="gender margin-right-xs" :class="item.female ? 'cuIcon-female female' : 'cuIcon-male'"></text>
								<text class="age">{{item.birthday|age(item.death_date)}}</text>
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
	</view>
</template>

<script>	
	const db = uniCloud.database()
	export default {
		props: {
			scrollTop: Number,
			offsetTop: Number,
			list: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				indexList: [],
				indexData: [],
				total: 0
			}
		},
		watch: {
			list: {
				handler(val) {
					const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
					const indexList = []
					const indexData = []
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
							indexList.push(cur.name)
							indexData.push(cur)
						}
					})
					this.indexList = indexList
					this.indexData = indexData
				},
				deep: true,
				immediate: true
			}
		},
		methods: {
			showMenu(item) {
				if(!this.hasLogin)
					return
					
				if(this.userInfo._id === item.uid || this.userInfo.role) {
					uni.vibrateShort()
					uni.showActionSheet({
						itemList: ['编辑'],
						success: ({tapIndex}) => {
							uni.navigateTo({
								url: "edit?id=" + item._id
							})
						}
					})
				}
			}
		}
	}
</script>

<style>
	.cu-list.menu-avatar>.cu-item>.cu-avatar {
		display: block;
	}
</style>
