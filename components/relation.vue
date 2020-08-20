<template>
	<view class="container">
		<!-- 列表 -->
		<view class="relation grid col-3 grid-square">
			<view class="bg-img margin-top-sm" v-for="(item,index) in value" :key="index">
				<image :src="item.detail.avatar" mode="aspectFill" @tap="showModal(item,index)"></image>
				<view class="name">
					<view>{{item.tag}} - {{item.detail.name}}</view>
				</view>
				<view class="cu-tag bg-red">
					<text class='cuIcon-close' @tap.stop="delItem(index)"></text>
				</view>
			</view>
			<view class="bg-img solids margin-top-sm" @tap="showModal">
				<text class='cuIcon-add'></text>
			</view>
		</view>
		
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
						<remote placeholder="请输入猫咪姓名" v-model="form.detail"></remote>
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
	import remote from '@/components/remote.vue'
	export default {
		name: 'relation',
		components: {
			remote
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
				show: false,
				index: -1,
				form: {}
			}
		},
		methods: {
			showModal(item,index) {
				if(item) {
					this.form = JSON.parse(JSON.stringify(item))
					this.index = index
				}else {
					this.form = {
						detail: {
							name: ''
						},
						tag: ''
					}
					this.index = -1
				}
				this.show = true
			},
			hideModal() {
				this.show = false
			},
			delItem(index) {
				this.value.splice(index,1)
			},
			onConfirm() {
				if(!this.form.detail || !this.form.tag) {
					uni.showToast({
						title: '请填写完整信息',
						icon: 'none'
					})
					return
				}
				if(this.index > -1) {
					this.value[this.index] = this.form
				}else {
					this.value.push(this.form)
				}
				this.$emit('change',this.value)
				this.hideModal()
			}
		}
	}
</script>

<style>
	.container,
	.relation {
		width: 100%;
	}
	
	.cu-modal {
		z-index: 99 !important;
	}
	
	.cu-dialog {
		margin-bottom: 50%;
	}
	
	.name {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: px;
		font-size: 24rpx;
		color: #fff;
		text-align: center;
		background-color: rgba(0,0,0,.5);
	}
</style>
