<template>
	<view>
		<switch :checked="checked" :class="type + (checked?' checked':'')" @change="onChange" :color="color"></switch>
	</view>
</template>

<script>
	export default {
		behaviors: ['uni://form-field'],
		props: {
			value: {
				type: Boolean,
				default: false
			},
			color: String,
			type: String
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data() {
			return {
				checked: false
			}
		},
		created() {
			this.checked = this.value
		},
		methods: {
			onChange(e) {
				this.checked = e.detail.value
				this.$emit('change',e.detail.value)
			}
		}
	}
</script>

<style scoped>
	.gender>>>.uni-switch-input,
	.gender>>>wx-switch-input {
		background: #0081FF !important;
	}
	
	.gender.checked>>>.uni-switch-input,
	.gender.checked>>>wx-switch-input {
		background: #e54d42 !important;
	}
	
	.gender::after {
		content: "\e71a";
	}

	.gender::before {
		content: "\e71c";
	}
</style>
