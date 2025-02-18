import express, { Request, Response } from "express"

// test endpoint

export const test = (req: Request, res: Response) => {
  const { name } = req.body
  if (!name) {
    return res.status(400).json({ error: "Name is required" })
  }
  res.status(200).json({ message: `Hello, ${name}!` })
}

export default test
