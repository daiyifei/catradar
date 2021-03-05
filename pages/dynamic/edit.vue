<template>
	<view>
		<form @submit="onSubmit">
			<view class="cu-form-group">
				<remote-input placeholder="照片中的是谁？" v-model="form.cat_id" :data="data"/>
			</view>
			<view class="cu-form-group">
				<textarea name="text" placeholder="写点什么吧..." maxlength="140" v-model="form.text"></textarea>
			</view>
			<view class="cu-form-group"> 
				<drag-album name="album" v-model="form.album"></drag-album>
			</view>
			<button form-type="submit" class="cu-btn block bg-blue margin lg" :loading="saving" :disabled="!form.cat_id||!form.text||!form.album.length">发布</button>
		</form>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				form: {},
				data: {},
				saving: false
			}
		},
		onLoad(e) {
			if(e.paths) {
				this.$set(this.form, 'album', JSON.parse(e.paths))
			}
			if(e.item) {
				uni.setNavigationBarTitle({
					title: "编辑"
				})
				const item = JSON.parse(e.item)
				this.data = item
				item.cat_id = this.data._id
				this.form = item
			}
		},
		methods: {
			async onSubmit(e) {
				this.saving = true
				
				// 上传图片
				try {
					await Promise.all(this.form.album.map(async (item, index) => {
						if(!~item.indexOf('https://')) {
							const { fileID } = await uniCloud.uploadFile({
								filePath: item,
								cloudPath: new Date().getTime() + '.jpg'
							})
							this.form.album[index] = fileID
						}
					}))
				}catch (err) {
					uni.showToast({
						title: '上传出错',
						icon: 'none'
					})
					this.saving = false
					return
				}
				
				const pages = getCurrentPages(),
					prevPage = pages[pages.length - 2]
				prevPage.$refs.timeline.add(this.form, {
					toastTitle: '发布成功',
					success: () => {
						prevPage.$refs.timeline.loadData({
							clear: true
						})
						uni.navigateBack()
					},
					fail: err => {
						uni.showToast(err.message)
					}
				})
			}
		}
	}
</script>

<style>

</style>
