<template>
	<view>
		<picker mode="date" @change="onChange" :value="date">
			<view class="picker">
				{{date?date:placeholder}}
			</view>
		</picker>
	</view>
</template>

<script>
	export default {
		props: {
			value: String,
			placeholder: {
				type: String,
				default: '选择日期'
			}
		},
		data() {
			return {
				date: ''
			}
		},
		created() {
			this.date = this.value || ''
		},
		methods: {
			onChange(e) {
				this.date = e.detail.value
				this.$emit('input',e.detail.value)
			}
		}
	}
</script>

<style>

</style>
