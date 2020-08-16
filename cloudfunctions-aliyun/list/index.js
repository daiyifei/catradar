'use strict';
const uniID = require('uni-id')
const db = uniCloud.database()
const { pyGroupSort } = require("py")

exports.main = async (event, context) => {
	let params = event.params || {}
	let payload = {}
	let res = {}
	
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
			const $ = db.command.aggregate
			res = await db.collection('list').aggregate()
			  .group({
			    _id: '$location',
			    num: $.sum(1)
			  })
			  .end()
			break
		case 'getList':
			let condition = {}
			if(params.searchKey && params.searchValue) {
				condition[params.searchKey] = new RegExp('.*' + params.searchValue,'i') 
			}else if(params.condition) {
				condition = params.condition
			}
			const { data } = await db.collection('list').where(condition).get()
			res = {
				total: data.length,
				data: pyGroupSort(data,'name')
			}
			break
		case 'save':
			if (params._id) {
				// update
				params.updated = new Date().getTime()
				const _id = params._id
				delete params._id
				await db.collection('list').doc(_id).update(params)
			} else {
				// add
				params.created = new Date().getTime()
				try {
					res = await db.collection('list').add(params)
				}
				catch(err){
					res = {
						code: 403,
						msg: err
					}
				}
			}
			break
		case 'del':
			res = await db.collection('list').doc(params._id).remove()
			break
		default:
			res = {
				code: 403,
				msg: '非法访问'
			}
			break
	}

	//返回数据给客户端
	return res
}
