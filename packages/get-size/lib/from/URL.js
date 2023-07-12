import getSizeFromAsyncIterable from './AsyncIterable.js'

import './Uint8Array.js'
import '../types.js'
import '../getType.js'
import '../utils/getMergedUint8Array.js'

export default async function getSizeFromURL(input) {
	const response = await fetch(input)

	return await getSizeFromAsyncIterable(response.body)
}
