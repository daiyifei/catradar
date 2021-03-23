<template>
	<view>
		<view class="cu-load loading text-gray" v-if="loading"></view>
		<form @submit="onSubmit" v-else>
			<view class="cu-form-group">
				<remote-input :placeholder="(form.content_type?'视频':'照片')+'中的是谁？'" ref="remote" v-model="form.cat_id" class="response" @change="onChange('cat_id', $event)" />
			</view>
			<view class="cu-form-group">
				<textarea name="text" placeholder="写点什么吧..." maxlength="140" v-model="form.text" @change="onChange('text', $event)"></textarea>
			</view>
			<view class="cu-form-group">
				<video-item :src="form.album[0]" v-if="form.content_type" style="width: 60%;"/>
				<drag-album name="album" v-model="form.album" class="response" @change="onChange('album', $event)" v-else />
			</view>
			<button form-type="submit" class="cu-btn block bg-blue margin lg" :loading="saving" :disabled="!form.cat_id||!form.text||!form.album.length">{{id?'保存':'发布'}}</button>
		</form>
	</view>
</template>

<script>
	const db = uniCloud.database()
	import {
		mapState,
		mapMutations
	} from 'vuex'
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
		computed: mapState(['hasLogin', 'userInfo']),
		async onLoad(options) {
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
				this.loading = true
				const { result: { data }} = await db.collection('timeline').doc(options.id).get()
				this.form = data[0]
				this.loading = false
			}
		},
		methods: {
			onChange(key, value) {
				this.$set(this.form, key, value)
			},
			async onSubmit() {
				this.saving = true
				try{
					this.form.album = await this.$upload(this.form.album)
					if(this.id) {
						// 编辑
						delete this.form._id
						await db.collection('timeline').doc(this.id).update(this.form)
						this.form._id = this.id
						this.form.cat = [this.$refs.remote.selected]
						uni.$emit('timelineUpdate', this.id)
					}else {
						// 新建
						await db.collection('timeline').add(this.form)
						uni.$emit('timelineUpdate')
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
