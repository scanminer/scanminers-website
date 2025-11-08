export function GET() {
	return new Response('Moved: use /insights/feed.xml', { status: 410, headers: { 'content-type': 'text/plain' } })
}
