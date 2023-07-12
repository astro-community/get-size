import type { ImageResult } from '../types.d.ts'

export default function getSizeFromAsyncIterable(iteratable: Iterable<Uint8Array> | AsyncIterable<Uint8Array>): Promise<ImageResult | null>
