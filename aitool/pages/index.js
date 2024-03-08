//前端页面
//包括登录和订阅的相关逻辑
import React, { useState } from 'react';
import { SignIn, SignUp, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { loadStripe } from '@stripe/stripe-js';

export default function Home() {
  const [scenarioCount, setScenarioCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { isSignedIn } = useUser();
  const stripePromise = loadStripe('pk_test_yourPublishableKey'); // 替换为你的 Stripe publishable key

  const scenarios = [
    { description: "女朋友问她的闺蜜谁好看？你回答后，她生气了", winRate: "10%" },
    { description: "被女同事夸帅，女朋友不开心了", winRate: "15%" },
    // 添加更多场景以模拟完整的列表
  ];
  
  //useEffect 钩子函数是用来在用户登录后启动一个轮询，该进程会定期（每5秒一次）向服务器发送请求，查询当前用户的订阅状态
  useEffect(() => {
    if (isSignedIn) {
      const interval = setInterval(async () => {
        const response = await fetch('/api/check-subscription');
        const data = await response.json();
        if (data.isSubscribed) {
          setIsSubscribed(true);
          clearInterval(interval);
        }
      }, 5000); // 每5秒查询一次

      return () => clearInterval(interval);
    }
  }, [isSignedIn]);
  

  const handleScenarioClick = () => {
    if (scenarioCount >= 1 && !isSubscribed && isSignedIn) {
      setShowModal(true);
      return;
    }
    setScenarioCount(scenarioCount + 1);
  };

  const handleSubscribe = async () => {
    const response = await fetch('/api/updateSubscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: true }), // 假设 status 为 true 表示订阅
    });

    if (response.ok) {
      setIsSubscribed(true);
      setShowModal(false); // 关闭模态框
    } else {
      console.error('Failed to update subscription');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Welcome to "Cheer up girlfriend" website</h1>
      <p className="mt-4">"Cheer up girlfriend" web is based on AI tech...</p>
      <div className="mt-4">
        {scenarios.slice(0, 5).map((scenario, index) => (
          <div key={index} className="mt-2" onClick={handleScenarioClick}>
            <a href="#" className="text-blue-500">{scenario.description}</a>
            <span className="float-right">胜率: {scenario.winRate}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">提交你自定义的吵架场景</button>
      <a href="https://twitter.com" className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded">联系开发者</a>

      {showModal && (
        <SignedOut>
          <div className="modal bg-white p-4 rounded-lg shadow-lg text-center">
            <SignIn />
            <SignUp />
          </div>
        </SignedOut>
      )}

      {showModal && isSignedIn && !isSubscribed && (
        <SignedIn>
          <div className="modal bg-white p-4 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold">Subscribe to Continue</h2>
            <button onClick={handleSubscribe}>Subscribe</button>
          </div>
        </SignedIn>
      )}
    </div>
  );
}
