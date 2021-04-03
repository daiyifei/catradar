<template>
	<view>
		<unicloud-db
			ref="udb"
			:where="condition"
			manual
			v-slot:default="{data, loading, hasMore}" 
			collection="timeline,list,uni-id-users"
			field="cat_id{_id,name,avatar},uid{_id,nickname,avatar},content_type,text,album,create_date"
			orderby="create_date desc">
			<timeline-item :item="item" v-for="(item, index) in data" :key="index" @del="onDel" />
			<view class="cu-load loading text-gray" v-if="loading"></view>
			<u-empty v-else-if="!data.length" class="padding"></u-empty>
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
		},
		onReady() {
			this.$refs.udb.loadData()
		},
		methods: {
			onDel(id) {
				this.$refs.udb.remove(id)
				const pages = getCurrentPages()
				if(pages.length > 1) {
					const prevPage = pages[pages.length - 2]
					if(prevPage.$vm.$refs.udb) {
						prevPage.$vm.$refs.udb.remove(id)
					}
				}
			}
		}
	}
</script>

<style>
</style>
