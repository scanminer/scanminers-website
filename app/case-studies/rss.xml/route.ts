export const runtime = 'edge'
export function GET() {
	return new Response('Moved: use /case-studies/feed.xml', { status: 410, headers: { 'content-type': 'text/plain' } })
}
