'use strict';
const db = uniCloud.database()

exports.main = async (event, context) => {
	const { version: oldVer } = event.params
	const { data: [{ version, note, url }] } = await db.collection('uni-app-version').get()
	return {
		update: parseInt(version.replace(/\./g,'')) > parseInt(oldVer.replace(/\./g,'')),
		version,
		note,
		url
	}
}