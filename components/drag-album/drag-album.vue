<template>
	<view class="container">
		<drag-sort v-model="list" :showDelete="false">
			<template v-slot="{ item,index }">
				<view class="grid" @tap="preview">
					<image :src="item" mode="aspectFill"/>
					<view class="close" @tap.prevent.stop="delItem(index)">
						<text class='cuIcon-close'></text>
					</view>
				</view>
			</template>
			<view slot="append" class="grid solids" @tap="addItem">
				<text class="cuIcon-add"></text>
			</view>
		</drag-sort>
	</view>
</template>

<script>
	import dragSort from '../dragSort.vue'
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
				list: []
			}
		},
		created() {
			this.list = this.value
		},
		watch: {
			value: {
				handler(val) {
					this.list = val
				},
				immediate: true
			},
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
						sizeType: ['compressed'],
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
