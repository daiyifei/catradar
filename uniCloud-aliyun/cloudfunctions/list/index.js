'use strict';
const uniID = require('uni-id')
const db = uniCloud.database()
const { pyGroupSort } = require("py")

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
		case 'getList':
			return getList(params)
			break
		case 'save':
			return save(params)
			break
		case 'del':
			return await db.collection('list').doc(params._id).remove()
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
		.group({
			_id: '$' + params.key,
			num: $.sum(1)
		})
		.sort({
			_id: 1
		})
		.end()
	return {
		total,
		data
	}
}

// 获取列表
async function getList(params) {
	const { condition = {} } = params
	if(params.searchKey && params.searchValue) {
		condition[params.searchKey] = new RegExp('.*' + params.searchValue,'i') 
	}
	const { data } = await db.collection('list').where(condition).get()
	return {
		total: data.length,
		data: pyGroupSort(data,'name')
	}
}

async function save(params) {
	if (params._id) {
		// update
		params.updated = new Date().getTime()
		const _id = params._id
		delete params._id
		return await db.collection('list').doc(_id).update(params)
	} else {
		// add
		params.created = new Date().getTime()
		try {
			return await db.collection('list').add(params)
		}
		catch(err){
			return {
				code: 403,
				msg: err
			}
		}
	}
}
