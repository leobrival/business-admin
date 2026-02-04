import { next } from "@vercel/edge"

export default function middleware(request: Request) {
	const authorization = request.headers.get("Authorization")

	if (authorization) {
		const [scheme, encoded] = authorization.split(" ")
		if (scheme === "Basic" && encoded) {
			const decoded = atob(encoded)
			const [user, password] = decoded.split(":")

			if (
				user === process.env.BASIC_AUTH_USER &&
				password === process.env.BASIC_AUTH_PASSWORD
			) {
				return next()
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
