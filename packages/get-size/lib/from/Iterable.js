import getSizeFromUint8Array from './Uint8Array.js'
import getMergedUint8Array from '../utils/getMergedUint8Array.js'

import '../types.js'
import '../detector.js'

export default function getSizeFromIterator(/** @type {Iterable<Uint8Array>} */ iterable) {
	let array = new Uint8Array()

	for (const chunk of iterable) {
		array = getMergedUint8Array(array, chunk)

		const result = getSizeFromUint8Array(array)

		if (result !== null && !isNaN(result.width)) {
			return result
		}
	}

	return null
}
