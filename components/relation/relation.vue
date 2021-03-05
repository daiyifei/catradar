<template>
	<view class="container">
		<!-- 列表 -->
		<drag-album v-model="list" custom @add="showModal">
			<view slot-scope="{ item,index }" class="grid" @tap.stop.prevent="showModal(item,index)">
				<image :src="item.detail.avatar" mode="aspectFill"></image>
				<view class="name">{{item.tag}} - {{item.detail.name}}</view>
			</view>
		</drag-album>
		
		<!-- 对话框 -->
		<view class="cu-modal" :class="show?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end">
					<view class="content">关系</view>
					<view class="action" @tap="hideModal">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="form padding-xl">
					<view class="cu-form-group">
						<view class="title">猫咪</view>
						<remote-input placeholder="请输入猫咪姓名" v-model="form.detail._id" :data="form.detail"/>
					</view>
					<view class="cu-form-group">
						<view class="title">关系</view>
						<input placeholder="请输入和本猫咪的关系" name="relation" v-model="form.tag"></input>
					</view>
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn line-green text-green" @tap="hideModal">取消</button>
						<button class="cu-btn bg-green margin-left" @tap="onConfirm">确定</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			value: {
				type: Array
			}
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data() {
			return {
				list: [],
				show: false,
				form: {
					detail: {}
				},
				index: -1
			}
		},
		created() {
			this.list = this.value
		},
		methods: {
			delItem(index) {
				this.list.splice(index,1)
			},
			showModal(item,index) {
				if(index > -1) {
					this.form = JSON.parse(JSON.stringify(item))
					this.index = index
				}else {
					this.form = {
						detail: {},
						tag: ''
					}
				}
				this.show = true
			},
			hideModal() {
				this.index = -1
				this.show = false
			},
			onConfirm() {
				if(!this.form.detail || !this.form.tag) {
					uni.showToast({
						title: '请填写完整信息',
						icon: 'none'
					})
					return
				}
				const form = {
					tag: this.form.tag,
					detail: {
						_id: this.form.detail._id,
						name: this.form.detail.name,
						avatar: this.form.detail.avatar
					}
				}
				if(this.index > -1) {
					this.$set(this.list,this.index,form)
				}else {
					this.list.push(form)
				}
				this.$emit('change',this.list)
				this.hideModal()
			}
		}
	}
</script>

<style>
	.container {
		flex: 1;
	}
	
	.cu-modal {
		z-index: 99 !important;
	}
	
	.form {
		padding-bottom: 350rpx;
	}
	
	.grid,
	.grid image {
		width: 100%;
		height: 100%;
	}
	
	.name {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 3px;
		font-size: 24rpx;
		color: #fff;
		text-align: center;
		background-color: rgba(0,0,0,.5);
	}
</style>
