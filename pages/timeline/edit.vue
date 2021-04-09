<template>
	<view>
		<view class="cu-load loading text-gray" v-if="loading"></view>
		<view class="cu-form-group" v-else>
			<remote-input collection="list" value-key="name" search-key="name,py" :placeholder="(form.content_type?'视频':'照片')+'中的是谁？'" ref="remote" v-model="form.cat_id" class="response" @change="onChange('cat_id', $event)" />
		</view>
		<view class="cu-form-group">
			<textarea name="text" placeholder="写点什么吧..." maxlength="140" v-model="form.text" @change="onChange('text', $event)"></textarea>
		</view>
		<view class="cu-form-group">
			<video-item :src="form.album[0]" v-if="form.content_type" style="width: 60%;"/>
			<drag-album name="album" v-model="form.album" class="response" @change="onChange('album', $event)" v-else />
		</view>
		<button class="cu-btn block bg-blue margin lg" :loading="saving" :disabled="disabled" @tap="onSubmit">{{id?'保存':'发布'}}</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: '',
				form: {
					cat_id: '',
					text: '',
					album: [],
					content_type: 0,
				},
				data: {},
				loading: false,
				saving: false
			}
		},
		computed: {
			disabled() {
				return !this.form.cat_id||!this.form.text||!this.form.album.length
			}
		},
		async onLoad(options) {
			if(options.cat_id) {
				this.$set(this.form, 'cat_id', options.cat_id)
			}
			if(options.files) {
				const files = JSON.parse(options.files)
				if(files.type === 'video') {
					this.form.content_type = 1
					this.form.album = [files.tempFiles[0].tempFilePath]
				}else {
					if(files.tempFilePaths) {
						this.form.album = files.tempFilePaths
					}else {
						const paths = []
						files.tempFiles.forEach(item => {
							paths.push(item.tempFilePath)
						})
						this.form.album = paths
					}
				}
			}
			
			if(options.id) {
				uni.setNavigationBarTitle({
					title: "编辑"
				})
				this.id = options.id
			}
		},
		mounted() {
			if(this.id) {
				const pages = getCurrentPages(),
					prevPage = pages[pages.length - 2]
				const data = prevPage.$vm.$refs.udb.dataList.find(v => v._id == this.id)
				this.form = {
					cat_id: data.cat_id[0]._id,
					text: data.text,
					album: this.$u.deepClone(data.album),
					content_type: data.content_type
				}
			}
		},
		methods: {
			onChange(key, value) {
				this.$set(this.form, key, value)
			},
			async onSubmit() {
				this.saving = true
				const pages = getCurrentPages(),
					prevPage = pages[pages.length - 2],
					{ udb } = prevPage.$vm.$refs,
					{ selected } = this.$refs.remote
				
				try{
					this.form.base_id = this.baseInfo._id
					this.form.album = await this.$upload(this.form.album)
					if(this.id) {
						// 编辑
						udb.update(this.id, this.form, {
							success: () => {
								const target = udb.dataList.find(v => v._id == this.id)
								target.cat_id = [selected]
								target.text = this.form.text
								target.album = this.form.album
							}
						})
					}else {
						// 新建
						udb.add(this.form, {
							toastTitle: '发布成功',
							success: () => {
								udb.loadData({
									clear: true
								})
							}
						})
						this.saving = false
					}
					uni.navigateBack()
				}catch(err){
					this.saving = false
					uni.showToast({
						title: err.message,
						icon: 'none'
					})
				}
			}
		}
	}
</script>

<style>
</style>
