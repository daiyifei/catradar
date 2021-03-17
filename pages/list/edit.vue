<template>
	<view>
		<view class="cu-load loading text-gray" v-if="loading"></view>
		<form @submit="onSubmit" v-else>
			<view class="cu-form-group required">
				<view class="title">头像</view>
				<avatar-cropper v-model="form.avatar" class="response" @change="onChange('avatar', $event)" />
			</view>
			<view class="cu-form-group required">
				<view class="title">名字</view>
				<input placeholder="请输入猫咪名字" v-model="form.name"></input>
			</view>
			<view class="cu-form-group required">
				<view class="title">花色</view>
				<form-picker v-model="form.color" :range="['三花','橘猫','奶牛','白猫','狸花','玳瑁','黑猫']"  @change="onChange('color', $event)" />
			</view>
			<view class="cu-form-group">
				<view class="title">性别</view>
				<form-switch custom-class="switch-sex" v-model="form.female" @change="onChange('female', $event)" />
			</view>
			<view class="cu-form-group">
				<view class="title">状态</view>
				<form-picker v-model="form.state" :range="['流浪中','失踪中','已领养','回喵星']" @change="onChange('state', $event)" />
			</view>
			<view class="cu-form-group" v-if="form.state===0">
				<view class="title">位置</view>
				<form-picker v-model="form.location" :range="Array.from(Array(19),(v,k)=>k+17+'幢')" @change="onChange('location', $event)" />
			</view>
			<view class="cu-form-group">
				<view class="title">生日</view>
				<date-picker v-model="form.birthday" @change="onChange('birthday', $event)" />
			</view>
			<view class="cu-form-group">
				<view class="title">绝育</view>
				<form-switch v-model="form.neuter" @change="onChange('neuter', $event)" />
			</view>
			<view class="cu-form-group" v-if="form.neuter">
				<view class="title">绝育时间</view>
				<date-picker v-model="form.neuterDate" @change="onChange('neuterDate', $event)" />
			</view>
			<view class="cu-form-group">
				<view class="title">简介</view>
				<textarea placeholder="请输入猫咪简介" v-model="form.intro"></textarea>
			</view>
			<view class="cu-form-group margin-top">
				<view class="title">相册</view>
				<drag-album v-model="form.album" class="response" @change="onChange('album', $event)"></drag-album>
			</view>
			<view class="cu-form-group margin-top">
				<view class="title">关系</view>
				<relation v-model="form.relation" class="response" @change="onChange('relation', $event)"></relation>
			</view>
			<button form-type="submit" class="cu-btn block bg-blue margin lg" :disabled="!form.name" :loading="saving">保存</button>
			<button class="cu-btn block bg-red margin lg" v-if="id&&userInfo.scope===9" @tap="onDelete">删除</button>
		</form>
	</view>
</template>

<script>
	const db = uniCloud.database()
	import pinyin from 'pinyin'
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				id: '',
				form: {
					name: '',
					state: 0,
					album: [],
					relation: []
				},
				loading: false,
				saving: false
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
		async onLoad(options) {
			if(options.id) {
				this.id = options.id
				this.loading = true
				const { result: { data } } = await db.collection('list').doc(options.id).get()
				this.form = data[0]
				this.loading = false
			}
			
			if(options.path) {
				JSON.parse(options.path).forEach(item => {
					this.form.album.unshift(item)
				})
			}
			
			uni.$on('uAvatarCropper', path => {
				this.$set(this.form, 'avatar', path)
			})
		},
		methods: {
			chooseAvatar() {
				this.$u.route({
					url: '/pages/cropper/cropper',
					params: {
						destWidth: 300,
						rectWidth: 200,
						fileType: 'jpg',
					}
				})
			},
			onChange(key, value) {
				this.$set(this.form, key, value)
			},
			async onSubmit(e) {
				this.saving = true
				
				// 拼音
				this.form.py = pinyin(this.form.name, {
					style: pinyin.STYLE_NORMAL
				}).join('')
				
				try {
					this.form.avatar = await this.$upload(this.form.avatar)
					this.form.album = await this.$upload(this.form.album)
					// 重名检查
					const { result: { data } } = await db.collection('list').where({
						_id: db.command.neq(this.id),
						name: this.form.name
					}).get()
					if(data.length) {
						throw({
							message: '名字已存在'
						})
					}
					
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
						uni.$emit('refresh')
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
								uni.$emit('refresh')
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
	.cu-form-group.required .title::after {
		content: '*';
		display: inline-block;
		margin-left: 6rpx;
		color: #e54d42;
		font-size: 34rpx;
	}
</style>
