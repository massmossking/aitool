// pages/api/updateSubscription.js
// 处理用户订阅状态的更新

import { withSession } from '@clerk/clerk-sdk-node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default withSession(async (req, res) => {
  if (req.method === 'POST') {
    try {
      const userId = req.session.userId; // 使用 Clerk 提供的会话信息获取用户 ID
      const status = req.body.status; // 订阅状态从请求体中获取

      // 根据 userId 更新数据库中的订阅状态
      const result = await pool.query(
        'UPDATE users SET subscription_status = $2 WHERE id = $1 RETURNING *',
        [userId, status]
      );

      res.status(200).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});
