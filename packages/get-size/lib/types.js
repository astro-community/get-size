// @ts-check

const decoder = new TextDecoder()

const toUTF8String = (/** @type {Uint8Array} */ input, start = 0, end = input.length) => decoder.decode(input.slice(start, end))
const toHexString = (/** @type {Uint8Array} */ input, start = 0, end = input.length) => input.slice(start, end).reduce((memo, i) => memo + ('0' + i.toString(16)).slice(-2), '')
const readInt16LE = (/** @type {Uint8Array} */ input, offset = 0) => {
	const val = input[offset] + input[offset + 1] * 2 ** 8
	return val | (val & 2 ** 15) * 0x1fffe
}
const readUInt16BE = (/** @type {Uint8Array} */ input, offset = 0) => input[offset] * 2 ** 8 + input[offset + 1]
const readUInt16LE = (/** @type {Uint8Array} */ input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8
const readUInt24LE = (/** @type {Uint8Array} */ input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16
const readInt32LE = (/** @type {Uint8Array} */ input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16 + (input[offset + 3] << 24)
const readUInt32BE = (/** @type {Uint8Array} */ input, offset = 0) => input[offset] * 2 ** 24 + input[offset + 1] * 2 ** 16 + input[offset + 2] * 2 ** 8 + input[offset + 3]
const readUInt32LE = (/** @type {Uint8Array} */ input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16 + input[offset + 3] * 2 ** 24

// Abstract reading multi-byte unsigned integers
/** @type {Record<string, (input: Uint8Array, offset?: number) => number>} */
const methods = {
	readUInt16BE,
	readUInt16LE,
	readUInt32BE,
	readUInt32LE,
}

function readUInt(/** @type {Uint8Array} */ input, /** @type {number} */ bits, /** @type {number} */ offset, /** @type {boolean} */ isBigEndian) {
	offset = offset || 0

	const endian = isBigEndian ? 'BE' : 'LE'
	const methodName = ('readUInt' + bits + endian)

	return methods[methodName](input, offset)
}

const validate$f = (/** @type {Uint8Array} */ input) => toUTF8String(input, 0, 2) === 'BM'
const calculate$f = (/** @type {Uint8Array} */ input) => ({
	height: Math.abs(readInt32LE(input, 22)),
	width: readUInt32LE(input, 18),
})

let BMP = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$f,
	calculate: calculate$f
})

const TYPE_ICON = 1

/**
 * ICON Header
 *
 * | Offset | Size | Purpose |
 * | 0	    | 2    | Reserved. Must always be 0.  |
 * | 2      | 2    | Image type: 1 for icon (.ICO) image, 2 for cursor (.CUR) image. Other values are invalid. |
 * | 4      | 2    | Number of images in the file. |
 *
 */
const SIZE_HEADER$1 = 2 + 2 + 2 // 6

/**
 * Image Entry
 *
 * | Offset | Size | Purpose |
 * | 0	    | 1    | Image width in pixels. Can be any number between 0 and 255. Value 0 means width is 256 pixels. |
 * | 1      | 1    | Image height in pixels. Can be any number between 0 and 255. Value 0 means height is 256 pixels. |
 * | 2      | 1    | Number of colors in the color palette. Should be 0 if the image does not use a color palette. |
 * | 3      | 1    | Reserved. Should be 0. |
 * | 4      | 2    | ICO format: Color planes. Should be 0 or 1. |
 * |        |      | CUR format: The horizontal coordinates of the hotspot in number of pixels from the left. |
 * | 6      | 2    | ICO format: Bits per pixel. |
 * |        |      | CUR format: The vertical coordinates of the hotspot in number of pixels from the top. |
 * | 8      | 4    | The size of the image's data in bytes |
 * | 12     | 4    | The offset of BMP or PNG data from the beginning of the ICO/CUR file |
 *
 */
const SIZE_IMAGE_ENTRY = 1 + 1 + 1 + 1 + 2 + 2 + 4 + 4 // 16

function getSizeFromOffset(/** @type {Uint8Array} */ input, /** @type {number} */ offset) {
	const value = input[offset]
	return value === 0 ? 256 : value
}
function getImageSize$1(/** @type {Uint8Array} */ input, /** @type {number} */ imageIndex) {
	const offset = SIZE_HEADER$1 + (imageIndex * SIZE_IMAGE_ENTRY)
	return {
		height: getSizeFromOffset(input, offset + 1),
		width: getSizeFromOffset(input, offset),
	}
}

const validate$e = (/** @type {Uint8Array} */ input) => {
	const reserved = readUInt16LE(input, 0)
	const imageCount = readUInt16LE(input, 4)
	if (reserved !== 0 || imageCount === 0) {
		return false
	}
	const imageType = readUInt16LE(input, 2)
	return imageType === TYPE_ICON
}

const calculate$e = (/** @type {Uint8Array} */ input) => {
	const nbImages = readUInt16LE(input, 4)
	const imageSize = getImageSize$1(input, 0)
	if (nbImages === 1) {
		return imageSize
	}
	const imgs = [ imageSize ]
	for (let imageIndex = 1; imageIndex < nbImages; imageIndex += 1) {
		imgs.push(getImageSize$1(input, imageIndex))
	}
	return {
		height: imageSize.height,
		width: imageSize.width,
		images: imgs,
	}
}

let ICO = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$e,
	calculate: calculate$e
})

const TYPE_CURSOR = 2

const validate$d = (/** @type {Uint8Array} */ input) => {
	const reserved = readUInt16LE(input, 0)
	const imageCount = readUInt16LE(input, 4)
	if (reserved !== 0 || imageCount === 0) { return false }
	const imageType = readUInt16LE(input, 2)
	return imageType === TYPE_CURSOR
}

const calculate$d = (/** @type {Uint8Array} */ input) => calculate$e(input)

let CUR = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$d,
	calculate: calculate$d
})

const validate$c = (/** @type {Uint8Array} */ input) => readUInt32LE(input, 0) === 0x20534444
const calculate$c = (/** @type {Uint8Array} */ input) => ({
	height: readUInt32LE(input, 12),
	width: readUInt32LE(input, 16)
})

let DDS = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$c,
	calculate: calculate$c
})

/** 8-bit representation of "GIF87a" */
const gif87a = [ 0x47, 0x49, 0x46, 0x38, 0x37, 0x61 ]

/** 8-bit representation of "GIF89a" */
const gif89a = [ 0x47, 0x49, 0x46, 0x38, 0x39, 0x61 ]

const validate$b = (/** @type {Uint8Array} */ input) => (input[0] === gif87a[0] &&
	input[1] === gif87a[1] &&
	input[2] === gif87a[2] &&
	input[3] === gif87a[3] &&
	(input[4] === gif87a[4] ||
		input[4] === gif89a[4]) &&
	input[5] === gif87a[5])

const calculate$b = (/** @type {Uint8Array} */ input) => ({
	height: readUInt16LE(input, 8),
	width: readUInt16LE(input, 6),
})

let GIF = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$b,
	calculate: calculate$b
})

/**
 * ICNS Header
 *
 * | Offset | Size | Purpose                                                |
 * | 0	    | 4    | Magic literal, must be "icns" (0x69, 0x63, 0x6e, 0x73) |
 * | 4      | 4    | Length of file, in bytes, msb first.                   |
 *
 */
const SIZE_HEADER = 4 + 4 // 8

const FILE_LENGTH_OFFSET = 4 // MSB => BIG ENDIAN

/**
 * Image Entry
 *
 * | Offset | Size | Purpose                                                          |
 * | 0	    | 4    | Icon type, see OSType below.                                     |
 * | 4      | 4    | Length of data, in bytes (including type and length), msb first. |
 * | 8      | n    | Icon data                                                        |
 */
const ENTRY_LENGTH_OFFSET = 4 // MSB => BIG ENDIAN

/** @type {Record<string, number>} */
const ICON_TYPE_SIZE = {
	ICON: 32,
	'ICN#': 32,
	// m => 16 x 16
	'icm#': 16,
	icm4: 16,
	icm8: 16,
	// s => 16 x 16
	'ics#': 16,
	ics4: 16,
	ics8: 16,
	is32: 16,
	s8mk: 16,
	icp4: 16,
	// l => 32 x 32
	icl4: 32,
	icl8: 32,
	il32: 32,
	l8mk: 32,
	icp5: 32,
	ic11: 32,
	// h => 48 x 48
	ich4: 48,
	ich8: 48,
	ih32: 48,
	h8mk: 48,
	// . => 64 x 64
	icp6: 64,
	ic12: 32,
	// t => 128 x 128
	it32: 128,
	t8mk: 128,
	ic07: 128,
	// . => 256 x 256
	ic08: 256,
	ic13: 256,
	// . => 512 x 512
	ic09: 512,
	ic14: 512,
	// . => 1024 x 1024
	ic10: 1024,
}

function readImageHeader(/** @type {Uint8Array} */ input, /** @type {number} */ imageOffset) {
	const imageLengthOffset = imageOffset + ENTRY_LENGTH_OFFSET

	return /** @type {[ string, number ]} */ ([
		toUTF8String(input, imageOffset, imageLengthOffset),
		readUInt32BE(input, imageLengthOffset)
	])
}

function getImageSize(/** @type {string} */ type) {
	const size = ICON_TYPE_SIZE[type]

	return {
		width: size,
		height: size,
		type,
	}
}

const validate$a = (/** @type {Uint8Array} */ input) => toUTF8String(input, 0, 4) === 'icns'

const calculate$a = (/** @type {Uint8Array} */ input) => {
	const inputLength = input.length
	const fileLength = readUInt32BE(input, FILE_LENGTH_OFFSET)

	let imageOffset = SIZE_HEADER
	let imageHeader = readImageHeader(input, imageOffset)
	let imageSize = getImageSize(imageHeader[0])

	imageOffset += imageHeader[1]

	if (imageOffset === fileLength) {
		return imageSize
	}

	const result = {
		height: imageSize.height,
		width: imageSize.width,
		images: [
			imageSize
		],
	}

	while (imageOffset < fileLength && imageOffset < inputLength) {
		imageHeader = readImageHeader(input, imageOffset)
		imageSize = getImageSize(imageHeader[0])
		imageOffset += imageHeader[1]

		result.images.push(imageSize)
	}

	return result
}

let ICNS = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$a,
	calculate: calculate$a
})

// TODO: this doesn't seem right. SIZ marker doesn't have to be right after the SOC
const validate$9 = (/** @type {Uint8Array} */ input) => toHexString(input, 0, 4) === 'ff4fff51'

const calculate$9 = (/** @type {Uint8Array} */ input) => ({
	height: readUInt32BE(input, 12),
	width: readUInt32BE(input, 8),
})

let J2C = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$9,
	calculate: calculate$9
})

const BoxTypes = {
	ftyp: '66747970',
	ihdr: '69686472',
	jp2h: '6a703268',
	jp__: '6a502020',
	rreq: '72726571',
	xml_: '786d6c20'
}

const calculateRREQLength = (/** @type {Uint8Array} */ box) => {
	const unit = box[0]

	let offset = 1 + (2 * unit)

	const numStdFlags = readUInt16BE(box, offset)
	const flagsLength = numStdFlags * (2 + unit)

	offset = offset + 2 + flagsLength

	const numVendorFeatures = readUInt16BE(box, offset)
	const featuresLength = numVendorFeatures * (16 + unit)

	return offset + 2 + featuresLength
}

const parseIHDR = (/** @type {Uint8Array} */ box) => {
	return {
		height: readUInt32BE(box, 4),
		width: readUInt32BE(box, 8),
	}
}

const validate$8 = (/** @type {Uint8Array} */ input) => {
	const signature = toHexString(input, 4, 8)
	const signatureLength = readUInt32BE(input, 0)

	if (signature !== BoxTypes.jp__ || signatureLength < 1) {
		return false
	}

	const ftypeBoxStart = signatureLength + 4
	const ftypBoxLength = readUInt32BE(input, signatureLength)
	const ftypBox = input.slice(ftypeBoxStart, ftypeBoxStart + ftypBoxLength)

	return toHexString(ftypBox, 0, 4) === BoxTypes.ftyp
}

const calculate$8 = (/** @type {Uint8Array} */ input) => {
	const signatureLength = readUInt32BE(input, 0)
	const ftypBoxLength = readUInt16BE(input, signatureLength + 2)

	let offset = signatureLength + 4 + ftypBoxLength

	const nextBoxType = toHexString(input, offset, offset + 4)

	switch (nextBoxType) {
	case BoxTypes.rreq:
		// WHAT ARE THESE 4 BYTES?????
		// eslint-disable-next-line no-case-declarations
		const MAGIC = 4

		offset = offset + 4 + MAGIC + calculateRREQLength(input.slice(offset + 4))

		return parseIHDR(input.slice(offset + 8, offset + 24))

	case BoxTypes.jp2h:
		return parseIHDR(input.slice(offset + 8, offset + 24))

	default:
		throw new TypeError('Unsupported header found: ' + toUTF8String(input, offset, offset + 4))
	}
}

let JP2 = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$8,
	calculate: calculate$8
})

// NOTE: we only support baseline and progressive JPGs here
// due to the structure of the loader class, we only get a buffer
// with a maximum size of 4096 bytes. so if the SOF marker is outside
// if this range we can't detect the file size correctly.

/** 8-bit representation of "Exif" */
const EXIF_MARKER = [ 0x45, 0x78, 0x69, 0x66 ]

const APP1_DATA_SIZE_BYTES = 2

const EXIF_HEADER_BYTES = 6

const TIFF_BYTE_ALIGN_BYTES = 2

const BIG_ENDIAN_BYTE_ALIGN = [ 0x4D, 0x4D ]

const LITTLE_ENDIAN_BYTE_ALIGN = [ 0x49, 0x49 ]

// Each entry is exactly 12 bytes
const IDF_ENTRY_BYTES = 12

const NUM_DIRECTORY_ENTRIES_BYTES = 2

const isEXIF = (/** @type {Uint8Array} */ input) => (
	input[2] === EXIF_MARKER[0] &&
	input[3] === EXIF_MARKER[1] &&
	input[4] === EXIF_MARKER[2] &&
	input[5] === EXIF_MARKER[3]
)

function extractSize(/** @type {Uint8Array} */ input, /** @type {number} */ index) {
	return {
		height: readUInt16BE(input, index),
		width: readUInt16BE(input, index + 2),
	}
}

function extractOrientation(/** @type {Uint8Array} */ exifBlock, /** @type {boolean} */ isBigEndian) {
	// TODO: assert that this contains 0x002A
	// let STATIC_MOTOROLA_TIFF_HEADER_BYTES = 2
	// let TIFF_IMAGE_FILE_DIRECTORY_BYTES = 4
	// TODO: derive from TIFF_IMAGE_FILE_DIRECTORY_BYTES
	const idfOffset = 8

	// IDF osset works from right after the header bytes
	// (so the offset includes the tiff byte align)
	const offset = EXIF_HEADER_BYTES + idfOffset

	const idfDirectoryEntries = readUInt(exifBlock, 16, offset, isBigEndian)

	for (let directoryEntryNumber = 0; directoryEntryNumber < idfDirectoryEntries; directoryEntryNumber++) {
		const start = offset + NUM_DIRECTORY_ENTRIES_BYTES + (directoryEntryNumber * IDF_ENTRY_BYTES)
		const end = start + IDF_ENTRY_BYTES

		// Skip on corrupt EXIF blocks
		if (start > exifBlock.length) {
			return
		}

		const block = exifBlock.slice(start, end)
		const tagNumber = readUInt(block, 16, 0, isBigEndian)

		// 0x0112 (decimal: 274) is the `orientation` tag ID
		if (tagNumber === 274) {
			const dataFormat = readUInt(block, 16, 2, isBigEndian)

			if (dataFormat !== 3) {
				return
			}

			// unsinged int has 2 bytes per component
			// if there would more than 4 bytes in total it's a pointer
			const numberOfComponents = readUInt(block, 32, 4, isBigEndian)

			if (numberOfComponents !== 1) {
				return
			}

			return readUInt(block, 16, 8, isBigEndian)
		}
	}
}

function validateExifBlock(/** @type {Uint8Array} */ input, /** @type {number} */ index) {
	// Skip APP1 Data Size
	const exifBlock = input.slice(APP1_DATA_SIZE_BYTES, index)

	// Consider byte alignment
	const byteAlign = exifBlock.slice(EXIF_HEADER_BYTES, EXIF_HEADER_BYTES + TIFF_BYTE_ALIGN_BYTES)

	// Ignore Empty EXIF. Validate byte alignment
	const isBigEndian = byteAlign[0] === BIG_ENDIAN_BYTE_ALIGN[0] && byteAlign[1] === BIG_ENDIAN_BYTE_ALIGN[1]

	const isLittleEndian = byteAlign[0] === LITTLE_ENDIAN_BYTE_ALIGN[0] && byteAlign[1] === LITTLE_ENDIAN_BYTE_ALIGN[1]

	if (isBigEndian || isLittleEndian) {
		return extractOrientation(exifBlock, isBigEndian)
	}
}

function validateInput(/** @type {Uint8Array} */ input, /** @type {number} */ index) {
	// index should be within buffer limits
	if (index > input.length) {
		throw new TypeError('Corrupt JPG, exceeded buffer limits')
	}

	// Every JPEG block must begin with a 0xFF
	if (input[index] !== 0xFF) {
		throw new TypeError('Invalid JPG, marker table corrupted')
	}
}

const validate$7 = (/** @type {Uint8Array} */ input) => input[0] === 0xFF && input[1] === 0xD8
const calculate$7 = (/** @type {Uint8Array} */ input) => {
	// Skip 4 chars, they are for signature
	input = input.slice(4)

	let orientation
	let next

	while (input.length) {
		// read length of the next block
		const i = readUInt16BE(input, 0)

		if (isEXIF(input)) {
			orientation = validateExifBlock(input, i)
		}

		// ensure correct format
		validateInput(input, i)

		// 0xFFC0 is baseline standard(SOF)
		// 0xFFC1 is baseline optimized(SOF)
		// 0xFFC2 is progressive(SOF2)
		next = input[i + 1]

		if (next === 0xC0 || next === 0xC1 || next === 0xC2) {
			const size = extractSize(input, i + 5)

			// TODO: is orientation=0 a valid answer here?
			if (!orientation) {
				return size
			}

			return {
				height: size.height,
				orientation,
				width: size.width
			}
		}

		// move to the next block
		input = input.slice(i + 2)
	}

	throw new TypeError('Invalid JPG, no size found')
}

let JPG = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$7,
	calculate: calculate$7
})

const validate$6 = (/** @type {Uint8Array} */ input) => toUTF8String(input, 1, 7) === 'KTX 11'
const calculate$6 = (/** @type {Uint8Array} */ input) => ({
	height: readUInt32LE(input, 40),
	width: readUInt32LE(input, 36),
})

let KTX = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$6,
	calculate: calculate$6
})

const pngSignature = 'PNG\r\n\x1a\n'
const pngImageHeaderChunkName = 'IHDR'

// Used to detect "fried" png's: http://www.jongware.com/pngdefry.html
const pngFriedChunkName = 'CgBI'

const validate$5 = (/** @type {Uint8Array} */ input) => {
	if (pngSignature === toUTF8String(input, 1, 8)) {
		let chunkName = toUTF8String(input, 12, 16)

		if (chunkName === pngFriedChunkName) {
			chunkName = toUTF8String(input, 28, 32)
		}

		if (chunkName !== pngImageHeaderChunkName) {
			// throw new TypeError('Invalid PNG')
			return false
		}

		return true
	}

	return false
}

const calculate$5 = (/** @type {Uint8Array} */ input) => (toUTF8String(input, 12, 16) === pngFriedChunkName
	? {
		height: readUInt32BE(input, 36),
		width: readUInt32BE(input, 32),
	}
	: {
		height: readUInt32BE(input, 20),
		width: readUInt32BE(input, 16),
	})

let PNG = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$5,
	calculate: calculate$5
})

/** @type {Record<string, string>} */
const PNMTypes = {
	P1: 'pbm/ascii',
	P2: 'pgm/ascii',
	P3: 'ppm/ascii',
	P4: 'pbm',
	P5: 'pgm',
	P6: 'ppm',
	P7: 'pam',
	PF: 'pfm',
}

/** @type {Record<string, (lines: string[]) => { width: number, height: number }>} */
const handlers = {
	default: (lines) => {
		/** @type {string[]} */
		let dimensions = []

		while (lines.length > 0) {
			const line = /** @type {string} */ (lines.shift())

			if (line[0] === '#') {
				continue
			}

			dimensions = line.split(' ')

			break
		}

		if (dimensions.length === 2) {
			return {
				height: parseInt(dimensions[1], 10),
				width: parseInt(dimensions[0], 10),
			}
		} else {
			throw new TypeError('Invalid PNM')
		}
	},
	pam: (lines) => {
		const size = /** @type {{ width: number, height: number }} */ ({})

		while (lines.length > 0) {
			const line = /** @type {string} */ (lines.shift())

			if (line.length > 16 || line.charCodeAt(0) > 128) {
				continue
			}

			const [ key, value ] = line.split(' ')

			if (key && value) {
				size[key.toLowerCase()] = parseInt(value, 10)
			}

			if (size.height && size.width) {
				break
			}
		}

		if (size.height && size.width) {
			return {
				height: size.height,
				width: size.width
			}
		} else {
			throw new TypeError('Invalid PAM')
		}
	}
}

const validate$4 = (/** @type {Uint8Array} */ input) => toUTF8String(input, 0, 2) in PNMTypes

const calculate$4 = (/** @type {Uint8Array} */ input) => {
	const signature = toUTF8String(input, 0, 2)
	const type = PNMTypes[signature]

	// TODO: this probably generates garbage. move to a stream based parser
	const lines = toUTF8String(input, 3).split(/[\r\n]+/)
	const handler = handlers[type] || handlers.default

	return handler(lines)
}

let PNM = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$4,
	calculate: calculate$4
})

const validate$3 = (/** @type {Uint8Array} */ input) => toUTF8String(input, 0, 4) === '8BPS'

const calculate$3 = (/** @type {Uint8Array} */ input) => ({
	height: readUInt32BE(input, 14),
	width: readUInt32BE(input, 18)
})

let PSD = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$3,
	calculate: calculate$3
})

const svgReg = /<svg\s([^>"']|"[^"]*"|'[^']*')*>/

const extractorRegExps = {
	height: /\sheight=(['"])([^%]+?)\1/,
	root: svgReg,
	viewbox: /\sviewBox=(['"])(.+?)\1/i,
	width: /\swidth=(['"])([^%]+?)\1/,
}

const INCH_CM = 2.54

const units = {
	in: 96,
	cm: 96 / INCH_CM,
	em: 16,
	ex: 8,
	m: 96 / INCH_CM * 100,
	mm: 96 / INCH_CM / 10,
	pc: 96 / 72 / 12,
	pt: 96 / 72,
	px: 1
}

const unitsReg = new RegExp(`^([0-9.]+(?:e\\d+)?)(${Object.keys(units).join('|')})?$`)

function parseLength(/** @type {string} */ len) {
	const m = unitsReg.exec(len)

	if (!m) {
		return 0
	}

	return Math.round(Number(m[1]) * (units[m[2]] || 1))
}

function parseViewbox(/** @type {string} */ viewbox) {
	const bounds = viewbox.split(' ')

	return {
		height: parseLength(bounds[3]),
		width: parseLength(bounds[2]),
	}
}

function parseAttributes(/** @type {string} */ root) {
	const width = root.match(extractorRegExps.width)
	const height = root.match(extractorRegExps.height)
	const viewbox = root.match(extractorRegExps.viewbox)

	return {
		height: height ? parseLength(height[2]) : 0,
		viewBox: viewbox ? parseViewbox(viewbox[2]) : { width: 0, height: 0 },
		width: width ? parseLength(width[2]) : 0,
	}
}

function calculateByDimensions(/** @type {ReturnType<typeof parseAttributes>} */ attrs) {
	return {
		height: attrs.height,
		width: attrs.width,
	}
}

function calculateByViewbox(/** @type {ReturnType<typeof parseAttributes>} */ attrs, /** @type {ReturnType<typeof parseAttributes>['viewBox']} */viewbox) {
	const ratio = viewbox.width / viewbox.height

	if (attrs.width) {
		return {
			height: Math.floor(attrs.width / ratio),
			width: attrs.width,
		}
	}

	if (attrs.height) {
		return {
			height: attrs.height,
			width: Math.floor(attrs.height * ratio),
		}
	}

	return {
		height: viewbox.height,
		width: viewbox.width,
	}
}

const validate$2 = (/** @type {Uint8Array} */ input) => svgReg.test(toUTF8String(input))

const calculate$2 = (/** @type {Uint8Array} */ input) => {
	const root = toUTF8String(input).match(extractorRegExps.root)

	if (root) {
		const attrs = parseAttributes(root[0])

		if (attrs.width && attrs.height) {
			return calculateByDimensions(attrs)
		}

		if (attrs.viewBox) {
			return calculateByViewbox(attrs, attrs.viewBox)
		}
	}

	throw new TypeError('Invalid SVG')
}

let SVG = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$2,
	calculate: calculate$2
})

const validate$1 = (/** @type {Uint8Array} */ input) => (readUInt16LE(input, 0) === 0 && readUInt16LE(input, 4) === 0)

const calculate$1 = (/** @type {Uint8Array} */ input) => ({
	height: readUInt16LE(input, 14),
	width: readUInt16LE(input, 12),
})

let TGA = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate: validate$1,
	calculate: calculate$1
})

// based on https://developers.google.com/speed/webp/docs/riff_container
function calculateExtended(/** @type {Uint8Array} */ input) {
	return {
		height: 1 + readUInt24LE(input, 7),
		width: 1 + readUInt24LE(input, 4),
	}
}

function calculateLossless(/** @type {Uint8Array} */ input) {
	return {
		height: 1 + (((input[4] & 0xF) << 10) | (input[3] << 2) | ((input[2] & 0xC0) >> 6)),
		width: 1 + (((input[2] & 0x3F) << 8) | input[1]),
	}
}

function calculateLossy(/** @type {Uint8Array} */ input) {
	// `& 0x3fff` returns the last 14 bits
	// TO-DO: include webp scaling in the calculations
	return {
		height: readInt16LE(input, 8) & 0x3fff,
		width: readInt16LE(input, 6) & 0x3fff,
	}
}

const validate = (/** @type {Uint8Array} */ input) => {
	const riffHeader = toUTF8String(input, 0, 4) === 'RIFF'
	const webpHeader = toUTF8String(input, 8, 12) === 'WEBP'
	const vp8Header = toUTF8String(input, 12, 15) === 'VP8'

	return (riffHeader && webpHeader && vp8Header)
}

const calculate = (/** @type {Uint8Array} */ input) => {
	const chunkHeader = toUTF8String(input, 12, 16)

	input = input.slice(20, 30)

	// Extended webp stream signature
	if (chunkHeader === 'VP8X') {
		const extendedHeader = input[0]
		const validStart = (extendedHeader & 0xc0) === 0
		const validEnd = (extendedHeader & 0x01) === 0

		if (validStart && validEnd) {
			return calculateExtended(input)
		} else {
			throw new TypeError('Invalid WebP')
		}
	}

	// Lossless webp stream signature
	if (chunkHeader === 'VP8 ' && input[0] !== 0x2f) {
		return calculateLossy(input)
	}

	// Lossy webp stream signature
	const signature = toHexString(input, 3, 6)

	if (chunkHeader === 'VP8L' && signature !== '9d012a') {
		return calculateLossless(input)
	}

	throw new TypeError('Invalid WebP')
}

let WEBP = /* #__PURE__ */Object.freeze({
	__proto__: null,
	validate,
	calculate
})

/** @type {import('./types.d.ts').ImageTypes} */
export const types = {
	bmp: BMP,
	cur: CUR,
	dds: DDS,
	gif: GIF,
	icns: ICNS,
	ico: ICO,
	j2c: J2C,
	jp2: JP2,
	jpg: JPG,
	ktx: KTX,
	png: PNG,
	pnm: PNM,
	psd: PSD,
	svg: SVG,
	tga: TGA,
	webp: WEBP,
}
