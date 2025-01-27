import { Request, Response } from "express"

export const getVolunteers = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export const getVolunteer = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export const createVolunteer = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export const updateVolunteer = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export const deleteVolunteer = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export default {
  getVolunteers,
  getVolunteer,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
}
