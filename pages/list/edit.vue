<template>
	<view>
		<form @submit="onSubmit" v-if="loaded">
			<view class="cu-form-group margin-top">
				<view class="title">头像</view>
				<upload v-model="form.avatar" crop />
			</view>
			<view class="cu-form-group">
				<view class="title">姓名</view>
				<input placeholder="请输入猫咪姓名" v-model="form.name"></input>
			</view>
			<view class="cu-form-group">
				<view class="title">性别</view>
				<form-switch type="switch-sex" v-model="form.female" />
			</view>
			<view class="cu-form-group">
				<view class="title">状态</view>
				<form-picker v-model="form.state" :range="['流浪中','待领养','已领养','失踪中','回喵星']" />
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
				<view class="title">位置</view>
				<form-picker v-model="form.location" :range="Array.from(Array(19),(v,k)=>k+17+'幢')" />
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
			<button form-type="submit" class="cu-btn block bg-blue margin lg" :loading="saving">{{id?'更新':'新建'}}</button>
			<button class="cu-btn block bg-red margin lg" :loading="deleting" v-if="id" @tap="onDelete">删除</button>
		</form>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: '',
				form: {
					female: false,
					neuter: false
				},
				loaded: false,
				saving: false,
				deleting: false
			}
		},
		onLoad(option) {
			if (!option.id) {
				this.loaded = true
				return
			}
			this.id = option.id
			this.fetchData()
		},
		methods: {
			fetchData() {
				this.$get('list', this.id).then(res => {
					this.form = res.data[0]
					this.loaded = true
				})
			},
			async onSubmit() {
				if (!this.form.name) {
					uni.showModal({
						showCancel: false,
						content: '请输入猫咪姓名'
					})
					return
				}
				this.saving = true
				
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
				
				// 保存表单
				this.$request('list', 'save', this.form).then(res => {
					this.saving = false
					uni.showToast({
						title: '保存成功'
					})
					setTimeout(() => {
						this.updateList()
					}, 1000)
				}).catch(err => {
					if(~err.errMsg.indexOf('duplicate key error')) {
						uni.showToast({
							title: '猫咪已存在',
							icon: 'none'
						})
					}
					this.saving = false
				})
			},
			onDelete() {
				uni.showModal({
					content: '确定删除此档案吗？',
					showCancel: true,
					success: (res) => {
						if (res.confirm) {
							this.deleting = true
							this.$request('list', 'del', {
								_id: this.id
							}).then(res => {
								this.updateList()
							})
						}
					}
				})
			},
			updateList() {
				const pages = getCurrentPages()
				if (pages.length > 1) {  
				    const prevPage = pages[pages.length - 2]  
				    prevPage.$vm.$refs.indexList.fetchData()
						uni.navigateBack()
				 }  
			}
		}
	}
</script>

<style>
	
</style>
