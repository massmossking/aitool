// pages/api/create-subscription.js
import Stripe from 'stripe';
import { withSession } from '@clerk/clerk-sdk-node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default withSession(async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { priceId } = req.body;
      const { userId, emailAddress } = req.session;

      // 在 Stripe 中为用户创建一个新的客户
      const customer = await stripe.customers.create({
        email: emailAddress,
      });

      // 创建 Stripe checkout 会话
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: 'http://localhost:3000/success', // 替换为实际的成功页面 URL
        cancel_url: 'http://localhost:3000/cancel', // 替换为实际的取消页面 URL
      });

      // 更新数据库中的用户订阅状态为 pending，等待支付成功的 webhook
      await pool.query(
        'UPDATE users SET subscription_status = $2 WHERE id = $1 RETURNING *',
        [userId, 'pending']
      );

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});
