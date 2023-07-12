import { getSizeFromReadableStream } from '@astropub/get-size'

const blob = new Blob([], { type: 'text/css' })

console.log(await getSizeFromReadableStream(blob.stream()))
