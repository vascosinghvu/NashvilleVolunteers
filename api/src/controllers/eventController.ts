import { Request, Response } from "express"

export const getEvents = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export const getEvent = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export const createEvent = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export const updateEvent = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export const deleteEvent = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" })
}

export default {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
}
