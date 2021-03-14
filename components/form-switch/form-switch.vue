<template>
	<switch :checked="checked" :class="customClass+(checked?' checked':'')" @change="onChange" :color="color"></switch>
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
			customClass: String
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
</style>
