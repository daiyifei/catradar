<template>
	<view>
		<unicloud-db
			ref="udb"
			v-slot:default="{data, loading, error, options}" 
			collection="list"
			getone
			manual
			:where="`_id=='${id}'`"
			@load="loaded">
		</unicloud-db>
		
		<view class="cu-load loading text-gray" v-if="loading"></view>
		<form @submit="onSubmit" v-else>
			<view class="cu-form-group required">
				<view class="title">头像</view>
				<upload v-model="form.avatar" crop />
			</view>
			<view class="cu-form-group required">
				<view class="title">名字</view>
				<input placeholder="请输入猫咪名字" v-model="form.name"></input>
			</view>
			<view class="cu-form-group required">
				<view class="title">性别</view>
				<form-switch type="switch-sex" v-model="form.female" />
			</view>
			<view class="cu-form-group">
				<view class="title">状态</view>
				<form-picker v-model="form.state" :range="['流浪中','待领养','已领养','失踪中','回喵星']" />
			</view>
			<view class="cu-form-group" v-if="form.state===0">
				<view class="title">位置</view>
				<form-picker v-model="form.location" :range="Array.from(Array(19),(v,k)=>k+17+'幢')" />
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
				<view class="title">花色</view>
				<form-picker v-model="form.color" :range="['三花','橘猫','奶牛','白猫','狸花','玳瑁','黑猫']" />
			</view>
			<view class="cu-form-group">
				<view class="title">生日</view>
				<date-picker v-model="form.birthday" />
			</view>
			<view class="cu-form-group">
				<view class="title">简介</view>
				<textarea placeholder="请输入猫咪简介" v-model="form.intro"></textarea>
			</view>
			<view class="cu-form-group margin-top">
				<view class="title">相册</view>
				<drag-album v-model="form.album"></drag-album>
			</view>
			<view class="cu-form-group margin-top">
				<view class="title">关系</view>
				<relation v-model="form.relation"></relation>
			</view>
			<button form-type="submit" class="cu-btn block bg-blue margin lg" :disabled="!form.name" :loading="saving">保存</button>
			<button class="cu-btn block bg-red margin lg" :loading="deleting" v-if="id" @tap="onDelete">删除</button>
		</form>
	</view>
</template>

<script>
	import pinyin from 'pinyin'
	export default {
		data() {
			return {
				id: '',
				form: {},
				loading: true,
				saving: false,
				deleting: false,
				finish: {
					success: () => {
						setTimeout(() => {
							uni.navigateBack()
						}, 500)
					},
					complete: () => {
						this.saving = false
					}
				}
			}
		},
		onLoad(option) {
			this.id = option.id || ''
		},
		mounted() {
			if(this.id) {
				this.$refs.udb.loadData()
			}else {
				this.loading = false
			}
		},
		methods: {
			loaded(data) {
				this.loading = false
				this.form = data || {}
			},
			async onSubmit() {
				this.saving = true
				
				// 拼音
				this.form.py = pinyin(this.form.name, {
					style: pinyin.STYLE_NORMAL
				}).join('')
				
				// 上传图片
				try {
					const { album = [] } = this.form
					await Promise.all(album.map(async (item, index) => {
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
				
				if(this.id) {
					// 编辑
					delete this.form._id
					this.$refs.udb.update(this.id, this.form, this.finish) 
				}else {
					// 新建
					const { data } = await this.$get('list',{
						name: this.form.name
					})
					
					// 重名
					if(data.length) {
						uni.showToast({
							title: '名字已存在',
							icon: 'none'
						})
						this.saving = false
						return
					}
					
					this.$refs.udb.add(this.form, this.finish) 
				}
			},
			onDelete() {
				this.$refs.udb.remove(this.id, this.finish)
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
		font-size: 40rpx;
	}
</style>
