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
				this.$emit('input', e.detail.value)
			}
		}
	}
</script>

<style>
</style>
