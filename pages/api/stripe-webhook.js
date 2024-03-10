// pages/api/stripe-webhook.js
// 处理 Stripe 订阅成功的事件
import Stripe from 'stripe';
import { buffer } from 'micro';

// Stripe 需要原始的 body 来验证 webhook 签名
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let event;
    const reqBuffer = await buffer(req);
    const signature = req.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(reqBuffer, signature, webhookSecret);
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 处理订阅创建成功的事件
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // 在这里处理订阅逻辑，比如更新用户的订阅状态
      // 根据 session.customer 或 session.subscription 获取所需信息

      // 假设我们存储了用户与 Stripe 客户 ID 的映射
      // 更新用户订阅状态的逻辑...
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
