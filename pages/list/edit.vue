<template>
	<view>
		<view class="cu-load loading text-gray" v-if="loading"></view>
		<form @submit="onSubmit" v-else>
			<view class="cu-form-group required">
				<view class="title">头像</view>
				<avatar-cropper v-model="form.avatar" class="response" />
			</view>
			<view class="cu-form-group required">
				<view class="title">名字</view>
				<input placeholder="请输入猫咪名字" v-model="form.name"></input>
			</view>
			<view class="cu-form-group required">
				<view class="title">花色</view>
				<form-picker v-model="form.color" :range="colors" />
			</view>
			<view class="cu-form-group">
				<view class="title">性别</view>
				<form-switch custom-class="switch-sex" v-model="form.female" />
			</view>
			<view class="cu-form-group">
				<view class="title">状态</view>
				<form-picker v-model="form.state" :range="states" />
			</view>
			<view class="cu-form-group" v-if="form.state===0">
				<view class="title">位置</view>
				<form-picker v-model="form.location" value-key="id" range-key="name" :range="baseInfo.locations" />
			</view>
			<view class="cu-form-group" v-if="form.state===1">
				<view class="title">失踪时间</view>
				<date-picker v-model="form.missing_date" />
			</view>
			<view class="cu-form-group" v-if="form.state===2">
				<view class="title">主人</view>
				<remote-input v-model="form.uid" collection="uni-id-users" value-key="nickname" search-key="nickname" class="response" />
			</view>
			<view class="cu-form-group" v-if="form.state===3">
				<view class="title">死亡时间</view>
				<date-picker v-model="form.death_date" />
			</view>
			<view class="cu-form-group">
				<view class="title">生日</view>
				<date-picker v-model="form.birthday" />
			</view>
			<view class="cu-form-group">
				<view class="title">绝育</view>
				<form-switch v-model="form.neuter" />
			</view>
			<view class="cu-form-group" v-if="form.neuter">
				<view class="title">绝育时间</view>
				<date-picker v-model="form.neuterDate" />
			</view>
			<view class="cu-form-group">
				<view class="title">简介</view>
				<textarea placeholder="请输入猫咪简介" v-model="form.intro"></textarea>
			</view>
			<view class="cu-form-group margin-top">
				<view class="title">相册</view>
				<drag-album v-model="form.album" class="response" />
			</view>
			<view class="cu-form-group margin-top">
				<view class="title">关系</view>
				<relation v-model="form.relation" class="response" />
			</view>
			<button form-type="submit" class="cu-btn block bg-blue margin lg" :disabled="!form.name" :loading="saving">保存</button>
			<button class="cu-btn block bg-red margin lg" v-if="id" @tap="onDelete">删除</button>
		</form>
	</view>
</template>

<script>
	const db = uniCloud.database()
	import pinyin from 'pinyin'
	export default {
		data() {
			return {
				id: '',
				form: {
					name: '',
					state: 0
				},
				colors: this.$colors,
				states: this.$states,
				loading: false,
				saving: false
			}
		},
		async onLoad(options) {
			if(options.id) {
				this.id = options.id
				await this.fetchData()
			}
			
			if(options.path) {
				const { album } = this.form
				this.form.album.unshift(...JSON.parse(options.path))
			}
		},
		methods: {
			async fetchData() {
				this.loading = true
				const { result: { data } } = await db.collection('list').doc(this.id).get({
					getOne: true
				})
				this.form = data
				this.loading = false
			},
			async onSubmit(e) {
				console.log(this.form)
					return
				
				this.saving = true
				
				// 拼音
				this.form.py = pinyin(this.form.name, {
					style: pinyin.STYLE_NORMAL
				}).join('')
				
				try {
					// 重名检查
					const { result: { data } } = await db.collection('list').where({
						_id: db.command.neq(this.id),
						name: this.form.name,
						base_id: this.baseInfo._id
					}).get()
					if(data.length) {
						throw({
							message: '名字已存在'
						})
					}
					
					this.form.avatar = await this.$upload(this.form.avatar)
					this.form.album = await this.$upload(this.form.album)
					this.form.base_id = this.baseInfo._id
					
					if(this.id) {
						// 编辑
						delete this.form._id
						await db.collection('list').doc(this.id).update(this.form)
						this.form._id = this.id
					}else {
						// 新建
						await db.collection('list').add(this.form)
					}
					uni.showToast({
						title: '保存成功'
					})
					setTimeout(() => {
						uni.$emit('listUpdate')
						uni.navigateBack()
					}, 500)
				}catch(err) {
					uni.showToast({
						title: err.message,
						icon: 'none'
					})
				}
				this.saving = false
			},
			onDelete() {
				uni.showModal({
					confirmColor: '#e54d42',
					confirmText: '删除',
					content: '确定要删除吗？',
					success: res => {
						if(res.confirm) {
							db.collection('list').doc(this.id).remove().then(() => {
								uni.showToast({
									title: '删除成功'
								})
								uni.$emit('listUpdate')
								setTimeout(() => {
									uni.navigateBack()
								}, 500)
							})
						}
					}
				})
			}
		}
	}
</script>

<style>

</style>
