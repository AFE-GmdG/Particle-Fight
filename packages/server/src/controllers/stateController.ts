import { Request, Response } from "express";

const serverHealthCheck = (_req: Request, res: Response) => res.status(200).json({ message: "pong" });

export default {
  serverHealthCheck,
};
