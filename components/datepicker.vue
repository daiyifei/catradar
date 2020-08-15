<template>
	<view>
		<picker mode="date" @change="onChange" :value="value">
			<view class="picker">
				{{value?value:placeholder}}
			</view>
		</picker>
	</view>
</template>

<script>
	export default {
		name: 'datepicker',
		props: {
			value: String,
			placeholder: {
				type: String,
				default: '选择日期'
			}
		},
		model: {
			prop: 'value',
			event: 'change'
		},
		data() {
			return {
				
			}
		},
		methods: {
			onChange(e) {
				this.$emit('change',e.detail.value)
			}
		}
	}
</script>

<style>

</style>
