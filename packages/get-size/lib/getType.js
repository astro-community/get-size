/** @typedef {import('./types.d.ts').SupportedImageType} SupportedImageType */

import { types } from './types.js'

/** @type {SupportedImageType[]} */
const keys = Object.keys(types)

// This map helps avoid validating for every single image type
/** @type {{ [byte: number]: SupportedImageType }} */
const firstBytes = {
	0x38: 'psd',
	0x42: 'bmp',
	0x44: 'dds',
	0x47: 'gif',
	0x52: 'webp',
	0x69: 'icns',
	0x89: 'png',
	0xff: 'jpg'
}

export default function getType(/** @type {Uint8Array} */ input) {
	const byte = input[0]

	if (byte in firstBytes) {
		const type = firstBytes[byte]

		if (type && types[type].validate(input)) {
			return type
		}
	}

	return keys.find(
		(/** @type {SupportedImageType} */ key) => types[key].validate(input)
	) || null
}
