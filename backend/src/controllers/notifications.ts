import { Request, Response } from 'express';
import { getDatabaseAdapter } from '../storage/DatabaseService.js';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

const dbNotifications = getDatabaseAdapter<Notification>('notifications');

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    let notifications = await dbNotifications.getAll();

    if (userId) {
      notifications = notifications.filter(n => n.userId === userId || n.userId === 'all');
    }

    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const newNotification: Notification = {
      ...req.body,
      id: `not_${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString()
    };
    const saved = await dbNotifications.insert(newNotification);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = await dbNotifications.update(id, { read: true } as any);
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await dbNotifications.delete(id);
    if (!deleted) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};
