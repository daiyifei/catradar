<template>
	<view>
		<unicloud-db ref="udb" collection="timeline" v-slot:default="{data, loading, error, options}" >
			<form @submit="onSubmit">
				<view class="cu-form-group">
					<remote-input name="cat_id" placeholder="照片中的是谁？" v-model="form.cat_id"/>
				</view>
				<view class="cu-form-group">
					<textarea name="text" placeholder="写点什么吧..." maxlength="140" v-model="form.text"></textarea>
				</view>
				<view class="cu-form-group"> 
					<drag-album name="album" v-model="form.album"></drag-album>
				</view>
				<button form-type="submit" class="cu-btn block bg-blue margin lg" :loading="saving" :disabled="!form.cat_id || !form.album.length">发布</button>
			</form>
		</unicloud-db>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				form: {},
				saving: false
			}
		},
		onLoad(e) {
			this.$set(this.form, 'album', JSON.parse(e.paths))
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
				
				this.$refs.udb.add(this.form, {
					toastTitle: '发布成功',
					success: res => {
						uni.navigateBack()
					},
					fail: err => {
						const { message } = err
						uni.showToast(message)
					}
				})
			}
		}
	}
</script>

<style>

</style>
