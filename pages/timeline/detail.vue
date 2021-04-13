<template>
	<view>
		<unicloud-db
			ref="udb"
			manual
			v-slot:default="{data, loading}" 
			collection="timeline,list,uni-id-users"
			field="cat_id{_id,name,avatar},uid{_id,nickname,avatar},content_type,text,album,create_date"
			:where="condition">
			<timeline-item :item="data[0]" @del="onDel" />
			<view class="cu-load loading text-gray" v-if="loading"></view>
		</unicloud-db>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				condition: ''
			}
		},
		onLoad(options) {
			this.condition = `_id=='${options.id}'`
			// #ifdef MP-WEIXIN
			uni.hideShareMenu()
			// #endif
		},
		onReady() {
			this.$refs.udb.loadData()
		},
		methods: {
			onDel(id) {
				this.$refs.udb.remove(id)
			}
		},
		onShareAppMessage(e) {
			return e.target.dataset.shareinfo
		}
	}
</script>

<style>
</style>
