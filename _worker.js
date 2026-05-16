export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // API 路由
    if (url.pathname === '/api/submit' && request.method === 'POST') {
      try {
        const bucket = env.FORM_BUCKET;
        const data = await request.json();
        
        const now = new Date();
        const dataLine = `${data.storeCode || '未填写'},${data.storeName},${data.phone},${now.toLocaleString()}\n`;
        const dateStr = now.toISOString().split('T')[0];
        const objectKey = `submissions/${dateStr}/${now.getTime()}.txt`;
        
        await bucket.put(objectKey, dataLine);
        
        return new Response(JSON.stringify({ success: true, message: '预约成功' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 静态资源：直接返回 index.html
    return new Response(null, { status: 404 });
  }
};
