<template>
	<view>
		<picker :value="value" :range="range" @change="onChange">
			<view class="picker">
				{{value!==undefined?label:placeholder}}
			</view>
		</picker>
	</view>
</template>

<script>
	export default {
		props: {
			value: Number,
			range: {
				type: Array,
				default: () => Array
			},
			placeholder: {
				type: String,
				default: '请选择'
			}
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data() {
			return {
				label: ''
			}
		},
		created() {
			this.label = this.range[this.value]
		},
		methods: {
			onChange(e) {
				this.label = this.range[e.detail.value]
				this.$emit('change',e.detail.value)
			}
		}
	}
</script>

<style>

</style>
