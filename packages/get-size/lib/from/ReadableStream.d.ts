import type { ImageResult } from '../types.d.ts'

export default function getSizeFromReadableStream(readableStream: ReadableStream<Uint8Array>): Promise<ImageResult | null>
