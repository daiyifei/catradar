<script>
	import Vue from 'vue'
	export default {
		onLaunch: function() {
			// custom bar
			uni.getSystemInfo({
				success: function(e) {
					// #ifndef MP
					Vue.prototype.StatusBar = e.statusBarHeight;
					if (e.platform == 'android') {
						Vue.prototype.CustomBar = e.statusBarHeight + 50;
					} else {
						Vue.prototype.CustomBar = e.statusBarHeight + 45;
					};
					// #endif

					// #ifdef MP-WEIXIN
					Vue.prototype.StatusBar = e.statusBarHeight;
					let custom = wx.getMenuButtonBoundingClientRect();
					Vue.prototype.Custom = custom;
					Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
					// #endif		

					// #ifdef MP-ALIPAY
					Vue.prototype.StatusBar = e.statusBarHeight;
					Vue.prototype.CustomBar = e.statusBarHeight + e.titleBarHeight;
					// #endif
				},
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

<style>
	/* #ifndef APP-PLUS-NVUE */
	@import "colorui/main.css";
	@import "colorui/icon.css";

	.cu-form-group .title {
		min-width: calc(4em + 15px);
	}

	/* #endif */
</style>
