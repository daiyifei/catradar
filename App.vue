<script>
	import Vue from 'vue'
	import { mapMutations } from 'vuex'
	export default {
		methods: {
			...mapMutations(['login'])
		},
		onLaunch: function() {
			// auto login
			this.$request('user-center','checkToken')
				.then(res => {
					this.login(res.userInfo)
				})
				.catch(() => {
					uni.clearStorageSync('uni_id_token')
					uni.clearStorageSync('uni_id_token_expired')
				})
			
			// check update
			// #ifdef APP-PLUS
			plus.runtime.getProperty(plus.runtime.appid, ({
				version
			}) => {
				this.$request('check-update', '', {
					version
				}).then(res => {
					if (res.update) {
						uni.showModal({
							title: '检测到新版本',
							content: res.version + '\n' + res.note,
							confirmText: '立即更新',
							cancelText: '以后再说',
							success: ({ confirm }) => {
								if (confirm) {
									const downloadTask = uni.downloadFile({
										url: res.url,
										success: (res) => {
											if (res.statusCode === 200) {
												plus.nativeUI.closeWaiting()
												plus.runtime.install(res.tempFilePath, {
													force: false
												}, (e) => {
													uni.showToast({
														title: '更新成功',
														icon: 'none',
														duration: 1000
													})
													setTimeout(() => {
														plus.runtime.restart()
													},1000)
												}, (e) => {
													uni.showToast({
														title: e.message,
														icon: 'none'
													})
												})
											}
										}
									})
									plus.nativeUI.showWaiting()
								}
							}
						})
					}
				})
			});
			// #endif
		},
		onShow: function() {},
		onHide: function() {}
	}
</script>

<style lang="scss">
	/* #ifndef APP-PLUS-NVUE */
	@import "colorui/main.css";
	@import "colorui/icon.css";

	.cu-form-group .title {
		min-width: calc(4em + 15px);
	}
	/* #endif */
</style>
