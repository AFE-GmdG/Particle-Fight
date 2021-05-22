import { Request, Response, NextFunction } from "express";

const knownUser = new Map<number, string>();

function getRandomUid() {
  const end = 10000;
  const start = 1000;
  const freeKeys = Array
    .from({ length: end - start }, (_, k) => k + start)
    .filter((k) => !knownUser.has(k));
  if (freeKeys.length) {
    const newUid = freeKeys[Math.floor(Math.random() * freeKeys.length)];
    knownUser.set(newUid, "");
    return newUid;
  }
  return 0;
}

const login = (_req: Request, res: Response, next: NextFunction) => {
  const uid = getRandomUid();
  if (uid) {
    res.status(200).json({ uid });
    return;
  }
  next();
};

export default {
  getRandomUid,
  login,
};
