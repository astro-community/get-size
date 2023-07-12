import type { ImageResult } from '../types.d.ts'

export default function getSizeFromURL(input: URL | RequestInfo): Promise<ImageResult | null>
