<template>
	<view>
		<form @submit="onSubmit">
			<view class="cu-form-group">
				<remote-input placeholder="照片中的是谁？" ref="input" v-model="form.cat_id" :data="data"/>
			</view>
			<view class="cu-form-group">
				<textarea name="text" placeholder="写点什么吧..." maxlength="140" v-model="form.text"></textarea>
			</view>
			<view class="cu-form-group"> 
				<drag-album name="album" v-model="form.album" ref="album"></drag-album>
			</view>
			<button form-type="submit" class="cu-btn block bg-blue margin lg" :loading="saving" :disabled="!form.cat_id||!form.text||!form.album.length">{{id?'保存':'发布'}}</button>
		</form>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: '',
				db: {},
				form: {},
				data: {},
				saving: false
			}
		},
		onLoad(e) {
			if(e.paths) {
				this.$set(this.form, 'album', JSON.parse(e.paths))
			}
			
			if(e.id) {
				uni.setNavigationBarTitle({
					title: "编辑"
				})
				this.id = e.id
				
				const pages = getCurrentPages(),
					prevPage = pages[pages.length - 2]
					
				this.db = prevPage.$refs.udb
				
				const data = this.$u.deepClone(this.db.dataList.find(item => {
					return item._id === e.id
				}))
				delete data.user_id
				this.data = data.cat_id[0]
				this.form = Object.assign(data, {
					cat_id: data.cat_id[0]._id
				})
			}
		},
		methods: {
			loaded(data) {
				this.loading = false
			},
			async onSubmit() {
				this.saving = true
				
				try{
					await this.$refs.album.upload()
					if(this.id) {
						// 编辑
						delete this.form._id
						this.db.update(this.id, this.form, {
							success: () => {
								let data = this.db.dataList.find(item => {
									return item._id === this.id
								})
								
								data.cat_id[0] = this.$refs.input.selected
								data.text = this.form.text
								data.album = this.form.album
								
								setTimeout(() => {
									uni.navigateBack()
								}, 500)
							},
							complete: () => {
								this.saving = false
							}
						}) 
					}else {
						// 新建
						this.db.add(this.form, {
							toastTitle: '发布成功',
							success: () => {
								this.db.loadData({
									clear: true
								})
								setTimeout(() => {
									uni.navigateBack()
								}, 500)
							},
							complete: () => {
								this.saving = false
							}
						}) 
					}
				}catch(e){
					this.saving = false
				}
			}
		}
	}
</script>

<style>

</style>
