<template>
	<view id="sort-box">
		<view :style="[areaStyle]" class="sort-wrap" @touchend="onEnd">
			<template v-for="item in sortList" >
				<view 
					@touchmove.stop.prevent="onMove($event, item)"
					@longpress="onStart($event, item)"
					:key="item._key" 
					:class="[item._key === activeKey ? 'active' : '', `sort-item-${item._key}`, 'sort-item']"
					:style="{ 
						height: height + 'px', 
						width: width + 'px',
						top: itemY(item) + 'px',
						left: itemX(item) + 'px',
						opacity: item._key === activeKey && inDelete ? 0.5 : 1,
						transition: item._key === activeKey || !animation ? 'none' : '0.3s'
					}">
					<slot :item="item._value" :index="item._index"></slot>
				</view>	
			</template>
			<view 
				v-if="$slots.append"
				class="sort-item" 
				:style="{ 
					height: height + 'px', 
					width: width + 'px',
					top: itemY({ _index: list.length }) + 'px',
					left: itemX({ _index: list.length }) + 'px'
				}">
				<slot name="append"></slot>
			</view>
		</view>
		<view 
			v-if="showDelete"
			class="delete-box" 
			:style="{ height: deleteHeight + 'px', display: activeKey === null ? 'none' : '' }">
			{{ inDelete ? '松手即可删除' : '拖动至此处删除' }}
		</view>
	</view>
</template>

<script>
	const { windowHeight, safeArea, screenHeight } = uni.getSystemInfoSync()
	export default {
		props: {
			disabled: {
				type: Boolean,
				default: false
			},
			cols: {
				type: Number,
				default: 3
			},
			square: {
				type: Boolean,
				default: true
			},
			itemHeight: {
				type: Number,
				default: 90
			},
			margin: {
				type: Number,
				default: 10
			},
			value: {
				type: Array,
				default: () => []
			},
			showDelete: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				inDelete: false,
				moveX: 0,
				moveY: 0,
				list: [],
				areaWidth: '',
				activeKey: null,
				activeIndex: null,
				sortList: [],
				deleteHeight: 64 + (screenHeight - safeArea.bottom),
				startItem: { x: 0, y: 0 },
				startTouch: { x: 0, y: 0 },
				animation: true,
				touchBottom: 0, // 触点到移动盒子底部的距离
			}
		},
		watch: {
			value: {
				handler(val) {
					if(JSON.stringify(this.list) !== JSON.stringify(val)) {
						this.removeAnimation()
						this.list = [...val]
						this.sortList = val.map((v,i) => ({
							_index: i,
							_key: i,
							_value: v
						}))
					}
				},
				deep: true,
				immediate: true
			}
		},
		computed: {
			width() {
				return (this.areaWidth + this.margin) / this.cols - this.margin
			},
			height() {
				return this.square ? this.width : this.itemHeight
			},
			rows() {
				const l = this.list.length
				const cols = this.cols
				return Math.ceil(l / cols)
			},
			areaHeight() {
				const rows = this.$slots.append ? Math.ceil((this.list.length + 1) / this.cols) : this.rows
				return rows * (this.height + this.margin) - this.margin
			},
			areaStyle() {
				return {
					width: this.areaWidth + 'px',
					height: this.areaHeight + 'px'
				}
			}
		},
		methods: {
			onMove(e, item) {
				
				if(this.activeKey !== null && item._key === this.activeKey) {
					
					const {clientX, clientY} = e.touches[0]
					const x = this.startItem.x + (clientX - this.startTouch.x)
					const y = this.startItem.y + (clientY - this.startTouch.y)
					if(this.showDelete) this.inDelete = windowHeight - (clientY + this.touchBottom) < this.deleteHeight
					this.onChange({ x, y })
				}
			},
			removeAnimation() {
				this.animation = false
				setTimeout(() => {
					this.animation = true
				}, 300)
			},
			onStart(e, item) {
				if(this.disabled) return
				
				uni.vibrateShort()
				this.moveX = this.itemX(item)
				this.moveY = this.itemY(item)
				this.activeKey = item._key

				this.activeIndex = item._index
				
				this.startItem = {
					x: this.moveX,
					y: this.moveY
				}
				this.startTouch = {
					x: e.touches[0].clientX,
					y: e.touches[0].clientY
				}

				if(this.showDelete) {
					uni.createSelectorQuery().select(`.sort-item-${item._key}`).boundingClientRect(({ top, bottom }) => {
						this.touchBottom = bottom - e.touches[0].clientY
					}).exec()	
				} 

					
			},
			onEnd() {
				if(this.activeKey !== null) {
					
					if(this.inDelete) {
						this.removeAnimation()
						
						this.inDelete = false

						const i = this.sortList.findIndex(v => v._key === this.activeKey)
						this.sortList.splice(i, 1)
						this.$emit('delete')
						
					}
					this.activeKey = null	
					this.activeIndex = null
					this.list = [...this.sortList].sort((a,b) => a._index - b._index).map(v => v._value)
					this.$emit('input', [...this.list])
					this.$emit('change', [...this.list])
				}
			},
			itemX(item){
				const index = item._index
				return item._key === this.activeKey ? this.moveX : (index % this.cols) * (this.width + this.margin)
			},
			itemY(item){
				
				const index = item._index 
				return item._key === this.activeKey ? this.moveY : Math.floor(index / this.cols) * (this.height + this.margin)
			},
			onChange({ x, y }) {

				this.moveX = x
				this.moveY = y
				
				let col = Math.floor((x + this.width/2) / (this.width + this.margin))
				let row = Math.floor((y + this.height/2) / (this.height + this.margin))
				
				row = row > (this.rows - 1) ? (this.rows - 1) : (row < 0 ? 0 : row)
				col = col > (this.cols - 1) ? (this.cols - 1) : (col < 0 ? 0 : col)
				
				let currentIndex = row * this.cols + col
				currentIndex = this.inDelete ? (this.list.length - 1) : (currentIndex > this.list.length - 1 ? this.list.length - 1 : currentIndex)
				
				if(currentIndex !== this.activeIndex) {
					
					this.sortList.forEach(val => {
						if(val._index === this.activeIndex) {
							val._index = currentIndex
						} else if(val._index > this.activeIndex && val._index <= currentIndex) {
							val._index--
						} else if (val._index < this.activeIndex && val._index >= currentIndex) {
							val._index++
						}
					})
					this.activeIndex = currentIndex
				} 
				
			}
		},
		mounted() {
			this.$nextTick(() => {
				uni.createSelectorQuery().in(this).select('#sort-box').boundingClientRect(res => {
					if(res) {
						this.areaWidth = res.width
					}
				}).exec()	
			})
		}
	}
</script>
<style scoped lang="scss">
	.sort-wrap{
		position: relative;
	}
	.sort-item{
		position: absolute;
		box-sizing: border-box;
		transition: .1s;
		&.active{
			transition: none;
			z-index: 99;
			transform: scale(1.1);
		}
	}
	.delete-box{
		width: 100%;
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 9999;
		background: #C04A42;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 16px;
	}
	.sort-item{
		/deep/ uni-image{
			img{
				display: none;
			}
		} 
	} 
</style>
