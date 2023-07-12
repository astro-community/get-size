/// <reference types="node" />

import type { ImageResult } from '../types.d.ts'
import type { PathLike } from 'node:fs'

export interface GetSizeFromFileSyncOptions {
	chunkSize: number;
}

export default function getSizeFromFileSync(path: PathLike, opts?: GetSizeFromFileSyncOptions): ImageResult | null
