<template>
	<view class="container">
		<view class="grid col-3 grid-square margin-top">
			<view class="bg-img" @tap="chooseImg" v-for="(item,index) in list" :key="index">
				<image :src="item" mode="aspectFill" @load="loading=false"></image>
				<view class="cu-tag bg-red" @tap.stop="delItem(index)">
					<text class='cuIcon-close'></text>
				</view>
			</view>
			<view class="solids" @tap="chooseImg" v-if="multiple || !list.length">
				<text :class="loading?'cu-load load-cuIcon loading text-white':'cuIcon-cameraadd'"></text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'upload',
		props: {
			value: Array | String,
			multiple: {
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
				uni.chooseImage({
					count: 1,
					success: (res) => {
						if (res.tempFilePaths.length > 0) {
							let filePath = res.tempFilePaths[0],
								fileName = res.tempFiles[0].name ? res.tempFiles[0].name : filePath.substr(filePath.lastIndexOf("/") + 1)
							console.log(fileName)
							this.loading = true
							uniCloud.uploadFile({
								filePath: filePath,
								cloudPath: fileName,
								success:(res) => {
									this.loading = false
									if(this.multiple) {
										this.list.push(res.fileID)
										this.$emit('change',this.list)
									}else {
										this.list[0] = res.fileID
										this.$emit('change',res.fileID)
									}
								}
							})
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
