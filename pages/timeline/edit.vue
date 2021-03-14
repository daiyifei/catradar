<template>
	<view>
		<view class="cu-load loading text-gray" v-if="loading"></view>
		<form @submit="onSubmit" v-else>
			<view class="cu-form-group">
				<remote-input placeholder="照片中的是谁？" ref="remote" v-model="form.cat_id" class="response" @change="onChange('cat_id', $event)" />
			</view>
			<view class="cu-form-group">
				<textarea name="text" placeholder="写点什么吧..." maxlength="140" v-model="form.text" @change="onChange('text', $event)"></textarea>
			</view>
			<view class="cu-form-group"> 
				<drag-album name="album" ref="album" v-model="form.album" class="response" @change="onChange('album', $event)" />
			</view>
			<button form-type="submit" class="cu-btn block bg-blue margin lg" :loading="saving" :disabled="!form.cat_id||!form.text||!form.album.length">{{id?'保存':'发布'}}</button>
		</form>
		<button class="cu-btn block bg-green margin lg" v-if="id&&userInfo.scope===9" @tap="syncToAlbum">同步到相册</button>
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
					album: []
				},
				data: {},
				loading: false,
				saving: false
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
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
			onChange(key, value) {
				this.$set(this.form, key, value)
			},
			async onSubmit() {
				this.saving = true
				try{
					await this.$refs.album.upload()
					if(this.id) {
						// 编辑
						delete this.form._id
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
			},
			syncToAlbum() {
				uni.navigateTo({
					url: '/pages/list/edit?id=' + this.form.cat_id + '&path=' + JSON.stringify(this.form.album)
				})
			}
		}
	}
</script>

<style>

</style>
