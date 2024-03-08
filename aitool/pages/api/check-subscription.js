// pages/api/check-subscription.js
import { withSession } from '@clerk/clerk-sdk-node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default withSession(async (req, res) => {
  if (req.method === 'GET') {
    try {
      const userId = req.session.userId;

      // 假设您的用户表有一个字段存储 Stripe 客户 ID 和订阅状态
      const { rows } = await pool.query('SELECT subscription_status FROM users WHERE id = $1', [userId]);

      const isSubscribed = rows[0]?.subscription_status === 'active';

      res.status(200).json({ isSubscribed });
    } catch (error) {
      console.error('Error checking subscription:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});
