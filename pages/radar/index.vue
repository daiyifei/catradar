<template>
	<view>
		<map longitude="118.916949" latitude="32.096591" :markers="markers" class="map" scale="17" show-location show-compass enable-overlooking enable-3D></map>
	</view>
</template>

<script>
	export default {
		name: "radar",
		data() {
			return {
				markers: [{
					iconPath: '/static/location.png',
					latitude: 32.095194,
					longitude: 118.916238
				},{
					iconPath: '/static/location.png',
					latitude: 32.095194,
					longitude: 118.916238
				},{
					iconPath: '/static/location.png',
					latitude: 32.095194,
					longitude: 118.916238
				},{
					iconPath: '/static/location.png',
					latitude: 32.095194,
					longitude: 118.916238
				},{
					iconPath: '/static/location.png',
					latitude: 32.095194,
					longitude: 118.916238
				},{
					iconPath: '/static/location.png',
					latitude: 32.095194,
					longitude: 118.916238
				}]
			}
		},
		created() {
		},
		methods: {
			
		}
	}
</script>

<style>
.banner {
	width: 100%;
}

.map {
	width: 100%;
	height: 100vh;
}
</style>
