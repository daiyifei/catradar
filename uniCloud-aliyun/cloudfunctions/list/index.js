'use strict';
const uniID = require('uni-id')
const db = uniCloud.database()

exports.main = async (event, context) => {
	let params = event.params || {}
	let payload = {}
	
	// 权限检查
	let noCheckAction = ['getStat','getList']

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
		case 'getStat':
			return getStat(params)
			break
		default:
			return {
				code: 403,
				msg: '非法访问'
			}
			break
	}
}

// 统计
async function getStat(params) {
	const $ = db.command.aggregate
	const { total } = await db.collection('list').where({
			_id: db.command.exists(true)
		}).count()
	const { data } = await db.collection('list').aggregate()
		.match({
			state: 0,
			base_id: params.base_id
		})
		.group({
			_id: '$' + params.key,
			num: $.sum(1)
		})
		.sort({
			_id: 1
		})
		.end()
	return {
		code: 0,
		data: {
			total,
			data
		}
	}
}
