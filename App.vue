<script>
	import Vue from 'vue'
	export default {
		onLaunch: function() {
			uni.getSystemInfo({
				success: function(e) {
					// #ifndef APP-PLUS-NVUE
					plus.navigator.closeSplashscreen();
					// #endif
				}
			})
		},
		onShow: function() {
		},
		onHide: function() {
		}
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
