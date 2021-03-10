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

<style>
	.switch-sex>>>.uni-switch-input,
	.switch-sex>>>wx-switch-input {
		background: #0081FF !important;
	}
	
	.switch-sex.checked>>>.uni-switch-input,
	.switch-sex.checked>>>wx-switch-input {
		background: #e54d42 !important;
	}

	.switch-sex::after {
		content: "\e71a";
	}

	.switch-sex::before {
		content: "\e71c";
	}
</style>
