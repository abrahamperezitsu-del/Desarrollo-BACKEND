// ============================================================================
// STARTER NOTE — Stations 2, 3 and 4 live here.
//
// Contracts to honor (see docs/http-contract.md and your auth-contract.md):
//
//   register(body) -> { id, email, role: 'requester', createdAt }
//     * allowlist: only email and password may arrive. Any server-controlled
//       field present in the body (role, id, createdAt, updatedAt, createdBy,
//       passwordHash) -> AppError('contract', 'SERVER_CONTROLLED_FIELD', ...).
//       Reject explicitly — never ignore silently.
//     * email: required, basic format, normalize (trim + lowercase) BEFORE
//       storing -> AppError('contract', 'INVALID_EMAIL', ...) otherwise.
//     * password: string of 15..128 characters (Unicode and spaces allowed,
//       no arbitrary composition rules) -> AppError('contract',
//       'INVALID_PASSWORD', ...) otherwise. NEVER log it.
//     * duplicate email -> AppError('domain', 'ACCOUNT_CANNOT_BE_CREATED',
//       'The account cannot be created with the supplied information.')
//       — generic on purpose: do not confirm that the email exists.
//       (pg raises error.code '23505' on a unique violation.)
//     * store ONLY the hash produced by hashPassword — never the password.
//
//   login(body) -> { accessToken, tokenType: 'Bearer', expiresIn: <seconds> }
//     * EVERY failure (unknown email, wrong password, anything else) answers
//       the SAME AppError('auth', 'INVALID_CREDENTIALS',
//       'Email or password is incorrect.') — identical bytes, no clues.
//     * verify with verifyPassword against the stored hash.
//
//   getCurrentUser(actor) -> { id, email, role }
//     * actor comes from req.auth (station 5). Never return password
//       material of any kind.
// ============================================================================
import { AppError } from '../../app-error.js';
import {
  hashPassword,
  verifyPassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH
} from './password.js';
import { issueToken, TOKEN_TTL_SECONDS } from './token.js';
import { findByEmail, findById, insertUser } from '../users/users.store.js';
import { mapUserRow } from '../users/user.mapper.js';

const SERVER_CONTROLLED_FIELDS = [
  'role',
  'id',
  'createdAt',
  'updatedAt',
  'createdBy',
  'passwordHash'
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function assertEmailAllowed(email) {
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    throw new AppError('contract', 'INVALID_EMAIL',
      'A valid email is required.');
  }
}

function assertPasswordAllowed(password) {
  if (typeof password !== 'string'
    || password.length < PASSWORD_MIN_LENGTH
    || password.length > PASSWORD_MAX_LENGTH) {
    throw new AppError('contract', 'INVALID_PASSWORD',
      `The password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`);
  }
}

export async function register(body) {
  const input = body ?? {};

  // Allowlist estricta: solo email y password pueden llegar. Cualquier
  // campo controlado por el servidor se rechaza explícitamente — ignoralo
  // en silencio enseñaría que intentar escalar es gratis.
  for (const field of SERVER_CONTROLLED_FIELDS) {
    if (field in input) {
      throw new AppError('contract', 'SERVER_CONTROLLED_FIELD',
        `The field "${field}" is controlled by the server.`);
    }
  }

  // Normalización ANTES de guardar.
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : input.email;
  assertEmailAllowed(email);
  assertPasswordAllowed(input.password);

  // El rol lo impone la base (DEFAULT 'requester'); insertUser nunca lo recibe.
  const hash = await hashPassword(input.password);

  // Unicidad: pg lanza 23505 (unique_violation) -> 409 genérico.
  const row = await insertUser({ email, passwordHash: hash }).catch((error) => {
    if (error.code === '23505') {
      throw new AppError('domain', 'ACCOUNT_CANNOT_BE_CREATED',
        'The account cannot be created with the supplied information.');
    }
    throw error;
  });

  return mapUserRow(row);
}

export async function login(body) {
  const input = body ?? {};
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : input.email;

  // Un solo fallo genérico para cada causa: email inexistente, password
  // incorrecta o cualquier otra cosa responde bytes idénticos, para no
  // permitir enumerar cuentas.
  const row = await findByEmail(email);
  const valid = row && await verifyPassword(input.password, row.password_hash);
  if (!valid) {
    throw new AppError('auth', 'INVALID_CREDENTIALS',
      'Email or password is incorrect.');
  }

  const token = await issueToken(row);
  return {
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn: TOKEN_TTL_SECONDS
  };
}

export async function getCurrentUser(actor) {
  // TODO (station 5): load the user behind actor.userId and answer only
  // id, email and role.
  throw new Error('TODO: getCurrentUser is not implemented yet.');
}
