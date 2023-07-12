import getSizeFromAsyncIterable from './AsyncIterable.js'

import './Uint8Array.js'
import '../types.js'
import '../detector.js'
import '../utils/getMergedUint8Array.js'

export default async function getSizeFromReadableStream(/** @type {ReadableStream<Uint8Array>} */ readableStream) {
	await import('../utils/ReadableStreamPolyfill.js')

	return await getSizeFromAsyncIterable(readableStream)
}
