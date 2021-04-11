<template>
	<view>
		<picker :value="index" :range="range" :range-key="rangeKey" @change="onChange">
			<view class="picker">
				{{label?label:placeholder}}
			</view>
		</picker>
	</view>
</template>

<script>
	export default {
		props: {
			value: Number | undefined,
			range: Array | Object,
			valueKey: String,
			rangeKey: String,
			placeholder: {
				type: String,
				default: '请选择'
			}
		},
		data() {
			return {
				index: 0,
				label: ''
			}
		},
		created() {
			if(this.rangeKey) {
				const index = this.range.findIndex(v => v[this.valueKey] === this.value) 
				this.index = ~index ? index : 0
				this.label = this.range[this.index][this.rangeKey]
			}else {
				this.index = this.value
				this.label = this.range[this.value]
			}
		},
		methods: {
			onChange(e) {
				const index = e.detail.value
				if(this.rangeKey) {
					this.label = this.range[index][this.rangeKey]
					this.$emit('input',this.range[index][this.valueKey])
				}else {
					this.label = this.range[index]
					this.$emit('input', parseInt(e.detail.value))
				}
			}
		}
	}
</script>

<style>

</style>
