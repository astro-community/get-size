{
	const { prototype } = ReadableStream
	const { asyncIterator } = Symbol

	if (!(asyncIterator in prototype)) {
		Object.assign(prototype, {
			/** @this {ReadableStream<Uint8Array>} */
			async * [asyncIterator]() {
				const reader = this.getReader()

				try {
					while (true) {
						const { done, value } = await reader.read()

						if (done) {
							return
						}

						yield value
					}
				} finally {
					reader.releaseLock()
				}
			},
		})
	}
}
