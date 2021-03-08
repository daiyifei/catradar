'use strict';
const uniID = require('uni-id')
const db = uniCloud.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
	let params = event.params || {}
	let payload = {}
	
	// 权限检查
	let noCheckAction = []

	if (noCheckAction.indexOf(event.action) === -1) {
		if (!event.uniIdToken) {
			return {
				code: 403,
				msg: '非法访问'
			}
		}
		payload = await uniID.checkToken(event.uniIdToken)
		if (payload.code && payload.code > 0) {
			return payload
		}
		params.uid = payload.uid
	}
	
	// 路由
	switch (event.action) {
		case 'getList':
			return getList(params)
			break
		default:
			return {
				code: 403,
				msg: '非法访问'
			}
			break
	}
}


async function getList(params) {
	const { limit = 20, page = 1 } = params
	const { total } = await db.collection('timeline').count()
	const { data } = await db.collection('timeline').aggregate()
		.lookup({
			from: 'list',
			let: {
				id: '$cat_id'
			},
			pipeline: $.pipeline()
				.match(_.expr(
					$.eq(['$_id', '$$id'])
				))
				.project({
					_id: 1,
					name: 1,
					avatar: 1
				})
				.done(),
			as: 'cat',
		})
		.lookup({
			from: 'uni-id-users',
			let: {
				id: '$user_id'
			},
			pipeline: $.pipeline()
				.match(_.expr(
					$.eq(['$_id', '$$id'])
				))
				.project({
					_id: 1,
					nickname: 1,
					avatar: 1
				})
				.done(),
			as: 'user',
		})
		.lookup({
			from: 'comments',
			let: {
				id: '$_id'
			},
			pipeline: $.pipeline()
				.match(_.expr(
					$.eq(['$timeline_id', '$$id'])
				))
				.lookup({
					from: 'uni-id-users',
					let: {
						id: '$user_id'
					},
					pipeline: $.pipeline()
						.match(_.expr(
							$.eq(['$_id', '$$id'])
						))
						.project({
							_id: 1,
							nickname: 1,
							avatar: 1
						})
						.done(),
					as: 'user',
				})
				.lookup({
					from: 'uni-id-users',
					let: {
						id: '$reply_user_id'
					},
					pipeline: $.pipeline()
						.match(_.expr(
							$.eq(['$_id', '$$id'])
						))
						.project({
							_id: 1,
							nickname: 1,
							avatar: 1
						})
						.done(),
					as: 'reply_user',
				})
				.sort({
					create_date: -1
				})
				.done(),
			as: 'comments',
		})
		.skip(limit * (page - 1))
		.limit(limit)
		.sort({
			create_date: -1
		})
		.end()
	
	return {
		code: 0,
		page,
		limit,
		total,
		data
	}	
}