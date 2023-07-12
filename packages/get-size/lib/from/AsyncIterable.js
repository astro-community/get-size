import getSizeFromUint8Array from './Uint8Array.js'
import getMergedUint8Array from '../utils/getMergedUint8Array.js'

import '../types.js'
import '../detector.js'

export default async function getSizeFromAsyncIterable(/** @type {Iterable<Uint8Array> | AsyncIterable<Uint8Array>} */ iteratable) {
	await import('../utils/ReadableStreamPolyfill.js')

	let array = new Uint8Array()

	for await (const chunk of iteratable) {
		array = getMergedUint8Array(array, chunk)

		const result = getSizeFromUint8Array(array)

		if (result !== null && !isNaN(result.width)) {
			return result
		}
	}

	return null
}
