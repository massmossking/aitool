//后端API,用于处理胜率计算。连接数据库
export default function handler(req, res) {
  if (req.method === 'GET') {
    // 这里可以替换为从数据库获取数据
    const scenarios = [
      { description: "女朋友问她的闺蜜谁好看？你回答后，她生气了", winRate: "10%" },
      { description: "被女同事夸帅，女朋友不开心了", winRate: "15%" }
    ];
    res.status(200).json(scenarios);
  } else {
    // 处理其他类型的请求，例如POST
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
