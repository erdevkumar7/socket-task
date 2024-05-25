// src/middleware/cache.ts
import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

const cacheMiddleware = (key: string) => async (req: Request, res: any, next: NextFunction) => {
  const cachedData = await redisClient.get(key);

  if (cachedData) {
    return res.status(200).json(JSON.parse(cachedData));
  }

  res.sendResponse = res.json;
  res.json = (body: any) => {
    //redisClient.set(key, JSON.stringify(body), 'EX', 3600); // Cache for 1 hour
    res.sendResponse(body);
  };

  next();
};

export default cacheMiddleware;
