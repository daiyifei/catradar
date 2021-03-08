<template>
	<view class="container">
		<drag-sort v-model="list" :showDelete="false">
			<template v-slot="{ item,index }">
				<view class="grid" @tap="preview(item)">
					<slot :item="item" :index="index">
						<image :src="item" mode="aspectFill" />
					</slot>
					<view class="close" @tap="delItem(index)">
						<text class='cuIcon-close'></text>
					</view>
				</view>
			</template>
			<view slot="append" class="grid solid" @tap="addItem">
				<text class="cuIcon-add icon"></text>
			</view>
		</drag-sort>
	</view>
</template>

<script>
	import dragSort from './dragSort.vue'
	export default {
		behaviors: ['uni://form-field'],
		components: {
			dragSort
		},
		props: {
			value: {
				type: Array,
				default: () => []
			},
			custom: Boolean
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data() {
			return {
				list: this.value
			}
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
			// 上传图片
			upload() {
				return new Promise(async (resolve, reject) => {
					try {
						await Promise.all(this.value.map(async (item, index) => {
							if(!~item.indexOf('https://')) {
								const { fileID } = await uniCloud.uploadFile({
									filePath: item,
									cloudPath: new Date().getTime() + '.jpg'
								})
								this.value[index] = fileID
							}
						}))
						resolve()
					}catch (err) {
						uni.showToast({
							title: '上传出错',
							icon: 'none'
						})
						reject()
					}
				})
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
	 position: relative;
	 display: flex;
	 justify-content: center;
	 align-items: center;
	 width: 100%;
	 height: 100%;
	 color: #666;
	 font-size: 40rpx;
	 border-radius: 6rpx;
	 overflow: hidden;
 }
 
 .grid image {
	 display: block;
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
	 border-radius: 6rpx;
 }
</style>
