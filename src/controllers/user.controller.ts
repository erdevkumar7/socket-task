// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import redisClient from '../config/redis';

interface getRequest extends Request {
  user?: any;
}

export const getUserProfile = async (req: getRequest, res: Response) => {
  const { id } = req.user;
  const cacheKey = `user_profile_${id}`;

  try {
    // Check if the profile data is in the cache
    const cachedProfile = await redisClient.get(cacheKey);

    if (cachedProfile) {
      return res.status(200).json(JSON.parse(cachedProfile));
    }

    // If not in cache, fetch from the database
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cache the profile data and send response
    // redisClient.set(cacheKey, JSON.stringify(user), 'EX', 3600); // Cache for 1 hour
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
