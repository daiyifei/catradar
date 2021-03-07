<template>
	<view>
		<view class="fullscreen" v-if="!hasLogin">
			<u-empty text="请登录后关注动态" mode="data" >
				<navigator url="/pages/mine/index" class="cu-btn bg-blue margin radius" slot="bottom" open-type="switchTab">去登录</navigator>
			</u-empty>
		</view>
		
		<view v-else>
			<!--列表主体-->
			<unicloud-db
				ref="udb"
				v-slot:default="{data, loading, hasMore, error, options}" 
				collection="timeline,list,uni-id-users"
				field="cat_id{_id,name,avatar},user_id{nickname,avatar},text,album,create_date"
				:page-size="5"
				orderby="create_date desc">
				<view class="cu-list menu-avatar comment solids-top" v-if="data">
					<view class="cu-item" v-for="(item, index) in data" :key="index">
						<!-- 操作按钮 -->
						<view 
							class="btn-more padding cuIcon-moreandroid text-gray"
							v-if="userInfo.scope==9||userInfo._id==item.user_id[0]._id"
							@tap="showMenu(item._id)">
						</view>
						<!-- 头像 -->
						<navigator :url="'/pages/list/detail?id='+item.cat_id[0]._id" class="cu-avatar">
							<image :src="item.cat_id[0].avatar" mode="aspectFill" class="cu-avatar radius"></image>
						</navigator>
						<view class="content">
							<view class="text-grey">{{item.cat_id[0].name}}</view>
							<!-- 内容区域 -->
							<view class="text-content">{{item.text}}</view>
							<view class="grid grid-square col-3 margin-top-sm">
								<view class="bg-img" v-for="(pic,idx) in item.album" :key="idx">
									<image :src="pic" mode="aspectFill" @tap.stop="preview(item.album, idx)"></image>
								</view>
							</view>
							<!-- 发布信息区域 -->
							<view class="margin-top-sm flex justify-between">
								<view class="text-gray">
									<image :src="item.user_id[0].avatar" mode="aspectFill" class="cu-avatar sm round margin-right-xs"></image>
									<text>{{item.user_id[0].nickname}} 发布于{{item.create_date|timeFrom}}</text>
								</view>
							</view>
							<!-- 留言区域 -->
							<message-board :ref="item._id" :timeline-id="item._id"></message-board>
						</view>
					</view>
				</view>
				<view class="cu-item">
					<view class="content">
						<text class="cu-load text-gray text-sm loading" v-if="loading"></text>
						<text class="cu-load text-gray text-sm" v-else>{{hasMore ? '加载更多' : '没有更多了'}}</text>
					</view>
				</view>
			</unicloud-db>
			
			<!--新建按钮-->
			<btn-new choose-image/>
			
			<!--操作菜单-->
			<u-action-sheet :list="actions" @click="click" v-model="show"></u-action-sheet>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				actions: [{
					text: '编辑'
				},{
					text: '删除',
					color: 'red'
				}],
				show: false,
				id: ''
			}
		},
		computed: mapState(['hasLogin', 'userInfo']),
		onPullDownRefresh() {
			this.$refs.udb.loadData({
				clear: true
			}, () => {
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			if(this.$refs.udb) {
				this.$refs.udb.loadMore()
			}
		},
		methods: {
			preview(urls, current) {
				uni.previewImage({
				  urls,
				  current
				})
			},
			showMenu(id) {
				this.id = id
				this.show = true
			},
			click(index) {
				if(index === 0) {
					uni.navigateTo({
						url: 'edit?id=' + this.id
					})
				}
				if(index === 1) {
					this.$refs.udb.remove(this.id, {
						confirmContent: '是否删除该条动态？'
					})
				}
			}
		}
	}
</script>

<style>
.fullscreen {
	height: 100vh;
}
	
.btn-more {
	position: absolute;
	top: 0;
	right: 0;
	z-index: 1;
}
</style>
