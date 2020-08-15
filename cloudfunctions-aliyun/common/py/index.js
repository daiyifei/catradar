'use strict';
const pinyin = require("pinyin")

const pyGroupSort = (arr,key) => {
	let letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
	let groups = []
	letters.map(letter => {
		let cur = {
			name: letter.toUpperCase(),
			data: []
		}
		arr.map(item => {
			let initial = pinyin(item[key], {
			  style: pinyin.STYLE_FIRST_LETTER
			})
			if (initial[0][0] === letter) {
				cur.data.push(item)
			}
		})
		if (cur.data.length) {
			cur.data.sort(function(a, b) {
				return pinyin.compare(a[key],b[key])
			})
			groups.push(cur)
		}
	})
	return groups
}

module.exports = {
	pyGroupSort: pyGroupSort
}
