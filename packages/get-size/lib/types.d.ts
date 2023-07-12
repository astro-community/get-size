export type ImageSize = {
	width: number
	height: number
}

export type ImageDetector = {
	validate(input: Uint8Array): boolean
	calculate(input: Uint8Array): ImageSize
}

export type SupportedImageType = 'bmp' | 'cur' | 'dds' | 'gif' | 'icns' | 'ico' | 'j2c' | 'jp2' | 'jpg' | 'ktx' | 'png' | 'pnm' | 'psd' | 'svg' | 'tga' | 'webp'

export type ImageTypes = Record<SupportedImageType, ImageDetector>

export type ImageResult = {
	type: SupportedImageType
} & ImageSize

export const types: ImageTypes
