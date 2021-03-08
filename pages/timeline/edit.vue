<template>
	<view>
		<view class="cu-load loading text-gray" v-if="loading"></view>
		<form @submit="onSubmit" v-else>
			<view class="cu-form-group">
				<remote-input placeholder="照片中的是谁？" ref="remote" v-model="form.cat_id" style="width: 100%;"/>
			</view>
			<view class="cu-form-group">
				<textarea name="text" placeholder="写点什么吧..." maxlength="140" v-model="form.text"></textarea>
			</view>
			<view class="cu-form-group"> 
				<drag-album name="album" ref="album" v-model="form.album" style="width: 100%;"></drag-album>
			</view>
			<button form-type="submit" class="cu-btn block bg-blue margin lg" :loading="saving" :disabled="!form.cat_id||!form.text||!form.album.length">{{id?'保存':'发布'}}</button>
		</form>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				id: '',
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
				this.id = options.id
				this.loading = true
				const { result: { data }} = await db.collection('timeline').doc(options.id).get()
				this.form = data[0]
				this.loading = false
			}
		},
		methods: {
			test(e) {
				console.log(e)
			},
			async onSubmit() {
				this.saving = true
				try{
					await this.$refs.album.upload()
					if(this.id) {
						// 编辑
						delete this.form._id
						console.log(this.form.cat_id)
						await db.collection('timeline').doc(this.id).update(this.form)
						uni.showToast({
							title: '保存成功'
						})
						this.form._id = this.id
						this.form.cat = [this.$refs.remote.selected]
						uni.$emit('refresh', this.form)
					}else {
						// 新建
						await db.collection('timeline').add(this.form)
						uni.showToast({
							title: '发布成功'
						})
						uni.$emit('refresh')
					}
					this.saving = false
					setTimeout(() => {
						uni.navigateBack()
					}, 500)
				}catch(err){
					uni.showToast({
						title: err.message,
						icon: 'none'
					})
					this.saving = false
				}
			}
		}
	}
</script>

<style>

</style>
