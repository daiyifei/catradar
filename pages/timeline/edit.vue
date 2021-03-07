<template>
	<view>
		<view class="cu-load loading text-gray" v-if="loading"></view>
		<form @submit="onSubmit" v-else>
			<view class="cu-form-group">
				<remote-input placeholder="照片中的是谁？" ref="input" v-model="form.cat_id"/>
			</view>
			<view class="cu-form-group">
				<textarea name="text" placeholder="写点什么吧..." maxlength="140" v-model="form.text"></textarea>
			</view>
			<view class="cu-form-group"> 
				<drag-album name="album" v-model="form.album" ref="album"></drag-album>
			</view>
			<button form-type="submit" class="cu-btn block bg-blue margin lg" :loading="saving" :disabled="!form.cat_id||!form.text||!form.album.length">{{form._id?'保存':'发布'}}</button>
		</form>
	</view>
</template>

<script>
	const db = uniCloud.database(),
		pages = getCurrentPages(),
		prevPage = pages.length > 1 ? pages[pages.length - 2] : {}
	export default {
		data() {
			return {
				form: {},
				data: {},
				loading: false,
				saving: false
			}
		},
		async onLoad(options) {
			if(options.paths) {
				this.$set(this.form, 'album', JSON.parse(options.paths))
			}
			
			if(options.id) {
				uni.setNavigationBarTitle({
					title: "编辑"
				})
				this.loading = true
				db.collection('timeline').doc(options.id).get().then(res => {
					this.form = res.result.data[0]
					this.loading = false
				})
			}
		},
		methods: {
			async onSubmit() {
				this.saving = true
				try{
					await this.$refs.album.upload()
					if(this.form._id) {
						// 编辑
						const { cat_id, text, album } = this.form
						await db.collection('timeline').update(this.form._id, {
							cat_id,
							text,
							album
						})
						uni.showToast({
							title: '保存成功'
						})
					}else {
						// 新建
						await db.collection('timeline').add(this.form)
						uni.showToast({
							title: '发布成功'
						})
						prevPage.fetchData()
					}
					this.saving = false
					setTimeout(() => {
						uni.navigateBack()
					}, 500)
				}catch(e){
					console.log(e)
					this.saving = false
				}
			}
		}
	}
</script>

<style>

</style>
