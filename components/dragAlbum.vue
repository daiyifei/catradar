<template>
	<view class="container">
		<drag-sort v-model="list" :showDelete="false">
			<view slot-scope="{ item,index }" class="grid" @tap.stop="preview(item)">
				<slot :item="item" :index="index">
					<image :src="item" mode="aspectFill"></image>
				</slot>
				<view class="close" @tap.stop="delItem(index)">
					<text class='cuIcon-close'></text>
				</view>
			</view>
			<view slot="append" class="grid solid" @tap="addItem">
				<text class="cuIcon-add icon"></text>
			</view>
		</drag-sort>
	</view>
</template>

<script>
	import dragSort from '@/components/dragSort.vue'
	export default {
		components: {
			dragSort
		},
		props: {
			value: Array,
			custom: Boolean
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data() {
			return {
				list: []
			}
		},
		created() {
			this.list = this.value
		},
		watch: {
			list(val) {
				this.$emit('change', this.list)
			}
		},
		methods: {
			addItem() {
				if(this.custom) {
					this.$emit('add')
				}else {
					uni.chooseImage({
						count: 9,
						success: res => {
							res.tempFilePaths.forEach(item => {
								this.list.push(item)
							})
						}
					})
				}
			},
			delItem(index) {
				this.list.splice(index,1)
			},
			preview(item) {
				if(this.custom) {
					this.$emit('click', item)
				}else {
					uni.previewImage({
					  urls: this.list,
					  current: this.list.findIndex(v => v === item)
					})
				}
			}
		}
	}
</script>

<style>
	.container {
		width: 100%;
		margin-top: 15px;
		margin-bottom: 15px;
	}
	
 .grid {
	 display: flex;
	 justify-content: center;
	 align-items: center;
	 width: 100%;
	 height: 100%;
	 color: #666;
	 font-size: 40rpx;
	 border-radius: 3px;
	 overflow: hidden;
 }
 
 .grid image {
	 width: 100%;
	 height: 100%;
 }
 
 .grid.solid {
	 border: 1px solid #eee;
 }
 
 .grid .close {
	 position: absolute;
	 top: 0;
	 right: 0;
	 display: flex;
	 justify-content: center;
	 align-items: center;
	 width: 40rpx;
	 height: 40rpx;
	 font-size: 30rpx;
	 color: #fff;
	 background: rgba(0,0,0,.5);
	 border-radius: 3px;
 }
</style>
