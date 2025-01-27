import { Request, Response } from "express"

export const getOrganizations = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export const getOrganization = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export const createOrganization = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export const updateOrganization = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export const deleteOrganization = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export default {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
}
