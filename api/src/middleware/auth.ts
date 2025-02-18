import { Request, Response, NextFunction } from 'express'
import { UserRole } from '../types/auth'
import sql from '../config/db'

const checkUserRole = async (authId: string): Promise<UserRole> => {
  // Check volunteer table
  const volunteer = await sql`
    SELECT * FROM volunteers WHERE auth_id = ${authId}
  `
  if (volunteer.length > 0) {
    return UserRole.VOLUNTEER
  }

  // Check organization table
  const organization = await sql`
    SELECT * FROM organizations WHERE auth_id = ${authId}
  `
  if (organization.length > 0) {
    return UserRole.ORGANIZATION
  }

  throw new Error('User not found')
}

export const checkRole = (allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authId = req.headers['auth-id'] as string
      if (!authId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Check user role in database
      const userRole = await checkUserRole(authId)
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      next()
    } catch (error) {
      res.status(500).json({ error: 'Error checking authorization' })
    }
  }
} 