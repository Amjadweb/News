import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../src/types';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'truthpulse_secure_jwt_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  tokenPayload?: TokenPayload;
}

// Role-Based Permissions Matrix
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  OWNER: [
    'ADMIN_ACCESS',
    'MANAGE_SOURCES',
    'MANAGE_SETTINGS',
    'MANAGE_USERS',
    'PUBLISH_NEWS',
    'EDIT_NEWS',
    'DELETE_NEWS',
    'TRIGGER_INGESTION',
    'VIEW_AUDIT_LOGS',
    'VIEW_METRICS',
    'USE_AI_ASSISTANT',
    'FACT_CHECK_MANAGE',
  ],
  EDITOR: [
    'ADMIN_ACCESS',
    'PUBLISH_NEWS',
    'EDIT_NEWS',
    'TRIGGER_INGESTION',
    'VIEW_AUDIT_LOGS',
    'VIEW_METRICS',
    'USE_AI_ASSISTANT',
    'FACT_CHECK_MANAGE',
  ],
  ANALYST: [
    'ADMIN_ACCESS',
    'VIEW_AUDIT_LOGS',
    'VIEW_METRICS',
    'USE_AI_ASSISTANT',
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function hashPassword(plainPassword: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainPassword, salt);
}

export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

export function generateJwtToken(user: User): { token: string; expiresAt: string } {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return { token, expiresAt };
}

export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Authentication Middleware
 * Extracts and verifies JWT from Bearer Authorization header
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token is required to access this resource.',
      code: 'UNAUTHORIZED_MISSING_TOKEN',
    });
  }

  const payload = verifyJwtToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token. Please sign in again.',
      code: 'UNAUTHORIZED_INVALID_TOKEN',
    });
  }

  const user = db.getUserById(payload.userId) || db.users.find((u) => u.email === payload.email);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'User associated with this token no longer exists.',
      code: 'UNAUTHORIZED_USER_NOT_FOUND',
    });
  }

  req.user = user;
  req.tokenPayload = payload;
  next();
}

/**
 * Role-Based Access Control (RBAC) Middleware
 * Ensures the authenticated user has one of the allowed roles
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required before checking role authorization.',
        code: 'UNAUTHORIZED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied. Your role (${req.user.role}) lacks sufficient permissions for this operation. Required: [${allowedRoles.join(', ')}]`,
        code: 'FORBIDDEN_INSUFFICIENT_ROLE',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
}

/**
 * Permission-Based Middleware
 */
export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
        code: 'UNAUTHORIZED',
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied. Permission '${permission}' is required.`,
        code: 'FORBIDDEN_INSUFFICIENT_PERMISSION',
        requiredPermission: permission,
        userRole: req.user.role,
      });
    }

    next();
  };
}
