export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

export default function middleware(request: Request) {
	const authorization = request.headers.get("Authorization")

	const expectedUser = process.env.BASIC_AUTH_USER
	const expectedPassword = process.env.BASIC_AUTH_PASSWORD

	// Skip auth if env vars not configured
	if (!expectedUser || !expectedPassword) {
		return new Response(null, { status: 200 })
	}

	if (authorization) {
		const [scheme, encoded] = authorization.split(" ")
		if (scheme === "Basic" && encoded) {
			const decoded = atob(encoded)
			const colonIndex = decoded.indexOf(":")
			const user = decoded.slice(0, colonIndex)
			const password = decoded.slice(colonIndex + 1)

			if (user === expectedUser && password === expectedPassword) {
				return undefined
			}
		}
	}

	return new Response("Authentication required", {
		status: 401,
		headers: {
			"WWW-Authenticate": 'Basic realm="Business Admin"',
		},
	})
}
