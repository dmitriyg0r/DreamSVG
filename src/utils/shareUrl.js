const URL_PARAM = 's'

async function compress(svg) {
  const bytes = new TextEncoder().encode(svg)
  const stream = new CompressionStream('deflate-raw')
  const writer = stream.writable.getWriter()
  writer.write(bytes)
  writer.close()
  const buf = await new Response(stream.readable).arrayBuffer()
  const binary = Array.from(new Uint8Array(buf), (b) => String.fromCharCode(b)).join('')
  // URL-safe base64, no padding
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function decompress(encoded) {
  const pad = '=='.slice((encoded.length + 3) % 4)
  const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/') + pad)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  const stream = new DecompressionStream('deflate-raw')
  const writer = stream.writable.getWriter()
  writer.write(bytes)
  writer.close()
  const buf = await new Response(stream.readable).arrayBuffer()
  return new TextDecoder().decode(buf)
}

export function getRawShareParam() {
  return new URLSearchParams(window.location.search).get(URL_PARAM)
}

export async function decodeSvgFromUrl(encoded) {
  return decompress(encoded)
}

export async function buildShareUrl(svg) {
  const encoded = await compress(svg)
  const { origin, pathname } = window.location
  return `${origin}${pathname}?${URL_PARAM}=${encoded}`
}

export function clearShareParam() {
  const url = new URL(window.location.href)
  url.searchParams.delete(URL_PARAM)
  window.history.replaceState({}, '', url.pathname + (url.search || ''))
}
