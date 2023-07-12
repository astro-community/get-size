/// <reference types="node" />

/** @typedef {import('../types.d.ts').ImageResult} ImageResult */
/** @typedef {import('node:fs').PathLike} PathLike */
/** @typedef {import('./FileSync.d.ts').GetSizeFromFileSyncOptions} GetSizeFromFileSyncOptions */

import { openSync, fstatSync, readSync } from 'node:fs'
import getSizeFromIterator from './Iterable.js'

import './Uint8Array.js'
import '../types.js'
import '../getType.js'
import '../utils/getMergedUint8Array.js'

export default function getSizeFromFileSync(/** @type {PathLike} */ path, /** @type {GetSizeFromFileSyncOptions} */ opts = null) {
	const chunkSize = Number(Object(opts).chunkSize) || defaultChunkSize
	const fileReadIterator = readFileIteratorSync(path, { chunkSize })

	return getSizeFromIterator(fileReadIterator)
}

function * readFileIteratorSync(path, opts) {
	opts = Object(opts)

	const chunkSize = Number(opts.chunkSize) || defaultChunkSize
	const fileDescriptor = openSync(path, 'r')
	const fileStats = fstatSync(fileDescriptor)
	const buffer = Buffer.alloc(Math.min(fileStats.size, chunkSize))

	/** @type {number} */
	let read

	while (read = readSync(fileDescriptor, buffer, 0, buffer.length, null), read !== 0) {
		yield new Uint8Array(buffer)
	}
}

const defaultChunkSize = 256
