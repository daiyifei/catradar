'use strict';
const uniID = require('uni-id')
const openapi = require('mp-cloud-openapi')
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
		case 'sendMsg':
			return sendMsg(params)
		default:
			return {
				code: 403,
				msg: '非法访问'
			}
	}
}

async function sendMsg(params) {
	const { data: [{ wx_openid,nickname }] } = await db.collection('uni-id-users').doc(params.touser).get()
	const openapiWeixin = openapi.initWeixin({
	  appId: 'wxbc23bad197c8cb97',
	  secret: 'ef1ef23e50d3baa8cfff937227feb577'
	})
	const { accessToken } = await openapiWeixin.auth.getAccessToken()
	try {
	 const result =	await openapiWeixin.subscribeMessage.send({
			accessToken,
			touser: wx_openid['mp-weixin'],
			template_id: '73TwwDG5U8hoQT_WCOC85kt7Rr5lr_v8aZb-a9M_hl8',
			page: params.url,
			data: {
				thing5: {
					value: params.subject,
				},
				thing2: {
					value: params.content
				},
				thing1: {
					value: params.username
				},
				time3: {
					value: params.date
				}
			}
		})
		return {
			code: 0,
			result
		}
	}catch(e) {
		return e
	}
}
