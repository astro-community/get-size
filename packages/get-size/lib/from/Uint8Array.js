/** @typedef {import('../types.d.ts').ImageResult} ImageResult */

import { types } from '../types.js'
import getType from '../getType.js'

export default function getSizeFromUint8Array(/** @type {Uint8Array} */ input) {
	const type = getType(input)

	if (type !== null) {
		try {
			const size = types[type].calculate(input)

			return /** @type {ImageResult} */ ({
				type,
				...size,
			})
		} catch {
			// do nothing and continue
		}
	}

	return null
}
