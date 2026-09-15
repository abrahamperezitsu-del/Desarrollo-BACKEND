// Issuing and verifying the workshop JWT. Used by the auth service (issue)
// and the authenticate middleware (verify). Enforces the exact claims the
// contract requires: sub, role, iat, exp (1h), iss, aud. Signed HS256 with
// JWT_SECRET. A JWT is signed, not encrypted: no secrets in the payload.
import 'dotenv/config';
import { SignJWT, jwtVerify } from 'jose';

// Fail early: an API that signs tokens with an empty secret is worse
// than an API that refuses to start.
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required.');
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);
const ALGORITHM = 'HS256';
const ISSUER = process.env.JWT_ISSUER ?? 'backend-course-api';
const AUDIENCE = process.env.JWT_AUDIENCE ?? 'backend-course-client';

export const TOKEN_TTL_SECONDS = Number(process.env.JWT_TTL_SECONDS ?? 3600);

export async function issueToken(user) {
  // Verify signals trust; decoding only reads. We sign, so anyone can read
  // the payload — carry nothing sensitive (no sender here anyway).
  return await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: ALGORITHM, typ: 'JWT' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(SECRET_KEY);
}

export async function verifyToken(token) {
  // Verify — never merely decode. jwtVerify checks the signature, the
  // algorithm, the issuer, the audience and the expiry together; any
  // mismatch rejects the whole token, so every failure here is treated
  // alike by the caller.
  const { payload } = await jwtVerify(token, SECRET_KEY, {
    algorithms: [ALGORITHM],
    issuer: ISSUER,
    audience: AUDIENCE
  });
  return payload;
}
