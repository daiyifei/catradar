<template>
	<view class="container">
		<view class="grid col-3 grid-square margin-top">
			<view class="bg-img" v-for="(item,index) in list" :key="index">
				<image :src="item" mode="aspectFill" @tap="chooseImg" :data-index="index" @load="loading=false"></image>
				<view class="cu-tag bg-red" @tap.stop="delItem(index)">
					<text class='cuIcon-close'></text>
				</view>
				<text :class="loading===index?'cu-load load-cuIcon loading text-white':''"></text>
			</view>
			<view class="solids" @tap="chooseImg" v-if="multiple || !list.length">
				<text :class="loading===-1?'cu-load load-cuIcon loading text-white':'cuIcon-cameraadd'"></text>
			</view>
		</view>
		
		 <cropper :src="path"  @confirm="upload"></cropper>
	</view>
</template>

<script>
	import cropper from '@/components/cropper/cropper.vue'
	export default {
		components: {
			cropper
		},
		name: 'upload',
		props: {
			value: Array | String,
			multiple: {
				type: Boolean,
				default: false
			},
			crop: {
				type: Boolean,
				default: false
			}
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data() {
			return {
				path: '',
				loading: false,
				list: []
			}
		},
		created() {
			if(!this.value) {
				return
			}
			if(this.multiple) {
				this.list = this.value
			}else {
				this.list.push(this.value)
			}
		},
		methods: {
			chooseImg(e) {
				const { index = -1 } = e.currentTarget.dataset,
					count = this.multiple ? 9 : 1
				uni.chooseImage({
					count,
					success: res => {
						res.tempFiles.forEach(item => {
							if(this.crop) {
								this.path = item.path
							}else {
								this.upload(item.path, index)
							}
						})
					}
				})
			},
			upload(filePath, index = 0) {
				this.$set(this.list, index, '')
				this.loading = index
				uniCloud.uploadFile({
					filePath,
					cloudPath: new Date().getTime() + '.jpg',
					success: (res) => {
						this.loading = false
						if(this.multiple) {
							if(index > -1) {
								this.list[index] = res.fileID
							}else {
								this.list.push(res.fileID)
							}
							this.$emit('change',this.list)
						}else {
							this.list[0] = res.fileID
							this.$emit('change',res.fileID)
						}
					}
				})
			},
			delItem(index) {
				this.list.splice(index,1)
			}
		}
	}
</script>

<style>
	.container {
		width: 100%;
	}
	
	.grid .cu-load {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(0,0,0,.5);
	}
	
	.grid .cu-load::before {
		font-size: 26px;
	}
</style>
