<template>
	<view class="container">
		<!-- 列表 -->
		<drag-sort v-model="list" :showDelete="false">
			<template v-slot="{ item,index }">
				<view class="grid" @tap="showModal(item, index)">
					<image :src="item.detail.avatar" mode="aspectFill"></image>
					<view class="name">{{item.tag}} - {{item.detail.name}}</view>
					<view class="close" @tap.prevent.stop="delItem(index)">
						<text class='cuIcon-close'></text>
					</view>
				</view>
			</template>
			<view slot="append" class="grid solids" @tap="showModal">
				<text class="cuIcon-add"></text>
			</view>
		</drag-sort>
		
		<!-- 对话框 -->
		<view class="cu-modal" :class="show?'show':''">
			<view class="cu-dialog" v-if="show">
				<view class="cu-bar bg-white justify-end">
					<view class="content">关系</view>
					<view class="action" @tap="hideModal">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="form padding-xl">
					<view class="cu-form-group">
						<view class="title">猫咪</view>
						<remote-input placeholder="请输入猫咪姓名" v-model="form.detail._id" ref="remote" :limit="5" class="text-left" style="width: 100%;"/>
					</view>
					<view class="cu-form-group">
						<view class="title">关系</view>
						<input placeholder="请输入和本猫咪的关系" class="text-left" v-model="form.tag"></input>
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
	import dragSort from '../dragSort.vue'
	export default {
		behaviors: ['uni://form-field'],
		components: {
			dragSort
		},
		props: {
			value: {
				type: Array,
				default: () => []
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
		watch: {
			list(val) {
				this.$emit('change', this.list)
			}
		},
		methods: {
			delItem(index) {
				this.list.splice(index,1)
			},
			showModal(item,index) {
				if(index > -1) {
					this.form = this.$u.deepClone(item)
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
				const { _id, name, avatar } = this.$refs.remote.selected
				const form = {
					tag: this.form.tag,
					detail: {
						_id,
						name,
						avatar
					}
				}
				if(this.index > -1) {
					this.$set(this.list,this.index,form)
				}else {
					this.list.push(form)
				}
				this.hideModal()
			}
		}
	}
</script>

<style>
	.container {
		flex: 1;
		margin-top: 15px;
		margin-bottom: 15px;
	}
	
	.cu-modal {
		z-index: 99 !important;
	}
	
	.form {
		padding-bottom: 500rpx;
	}
	
	.grid {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		color: #666;
		font-size: 40rpx;
		border-radius: 6rpx;
		overflow: hidden;
	}
	
	.grid image {
		display: block;
		width: 100%;
		height: 100%;
	}

 .grid .close {
	 position: absolute;
	 top: 0;
	 right: 0;
	 display: flex;
	 justify-content: center;
	 align-items: center;
	 width: 40rpx;
	 height: 40rpx;
	 font-size: 30rpx;
	 color: #fff;
	 background: rgba(0,0,0,.5);
	 border-radius: 6rpx;
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
