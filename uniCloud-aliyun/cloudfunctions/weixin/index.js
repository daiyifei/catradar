'use strict';
const TEMPLATES = {
	'comment': {
		template_id: '73TwwDG5U8hoQT_WCOC85kt7Rr5lr_v8aZb-a9M_hl8', // 收到评论回复通知
		keys: ['thing5','thing2','thing1','time3'], // 回复主题,回复内容,回复人,回复时间
		page: '/pages/mine/comments'
	},
	'message': {
		template_id: 'xY6bQVGDtKb7JSHYdBHhV2BvALcKbBG4kWvxEwr2WH8', // 消息未读提醒
		keys: ['name1','thing2','time3'], // 发送人,消息内容,发送时间
		page: '/pages/mine/messages'
	}
}

const uniID = require('uni-id')
const openapi = require('mp-cloud-openapi')
const db = uniCloud.database()
const $ = db.command.aggregate
const _ = db.command

const openapiWeixin = openapi.initWeixin({
	appId: 'wxbc23bad197c8cb97',
	secret: 'ef1ef23e50d3baa8cfff937227feb577'
})

exports.main = async (event, context) => {
	let params = event.params || {}
	let payload = {}
	const { accessToken } = await openapiWeixin.auth.getAccessToken()
	
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
		params.accessToken = accessToken
	}
	
	// 路由
	switch (event.action) {
		case 'msgCheck':
			return msgCheck(params)
		case 'imgCheck':
			return imgCheck(params)
		case 'sendMsg':
			return sendMsg(params)
		default:
			return {
				code: 403,
				msg: '非法访问'
			}
	}
}

// 违规检查
async function msgCheck(params) {
	const api = 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token=' + params.accessToken
	const { data } = await uniCloud.httpclient.request(api, {
		method: 'POST', 
		contentType: 'json',
		dataType: 'json',
		data: {
			content: params.content
		}
	})
	return {
		code: data.errcode,
		msg: data.errmsg
	}
}

async function imgCheck(params) {
	const api = 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token=' + params.accessToken
	
	const formData = new FormData()
	formData.append('media', params.media)
	console.log(formData)
	const { data } = await uniCloud.httpclient.request(api, {
		method: 'POST', 
		dataType: 'json',
		content: formData
	})
	return {
		code: data.errcode,
		msg: data.errmsg
	}
}

// 订阅消息
async function sendMsg(params) {
	const { data: [{ wx_openid,nickname }] } = await db.collection('uni-id-users').doc(params.touid).get()
	const data = {}
	const { template_id, keys, page } = TEMPLATES[params.type]
	keys.map((item,index) => {
		data[item] = {
			value: params.data[index]
		}
	})
	
	try {
		const result = await openapiWeixin.subscribeMessage.send({
			accessToken: params.accessToken,
			touser: wx_openid['mp-weixin'],
			template_id,
			page: params.page || page,
			data,
			// miniprogram_state: 'developer'
		})
		return {
			code: 0,
			result
		}
	}catch(e) {
		return e
	}
}
