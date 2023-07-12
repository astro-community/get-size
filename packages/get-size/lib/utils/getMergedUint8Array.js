export default function getMergedUint8Array(/** @type {Uint8Array} */ array1, /** @type {Uint8Array} */ array2) {
	const merged = new Uint8Array(array1.length + array2.length)

	merged.set(array1)
	merged.set(array2, array1.length)

	return merged
}
