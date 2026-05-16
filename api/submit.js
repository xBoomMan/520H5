// functions/api/submit.js

export async function onRequestPost({ request, env }) {
  // 辅助函数：返回 JSON 响应
  function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    // 检查 R2 绑定
    const bucket = env.FORM_BUCKET;
    if (!bucket) {
      return jsonResponse({ success: false, message: '服务器配置错误' }, 500);
    }

    // 解析请求数据
    let storeCode, storeName, phone;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await request.json();
      storeCode = data.storeCode?.trim() || '未填写';
      storeName = data.storeName?.trim();
      phone = data.phone?.trim();
    } else {
      const formData = await request.formData();
      storeCode = formData.get('storeCode')?.trim() || '未填写';
      storeName = formData.get('storeName')?.trim();
      phone = formData.get('phone')?.trim();
    }

    // 验证
    if (!storeName) {
      return jsonResponse({ success: false, message: '请填写门店名称' }, 400);
    }
    if (!phone) {
      return jsonResponse({ success: false, message: '请填写联系电话' }, 400);
    }

    // 生成数据
    const now = new Date();
    const timestamp = now.toLocaleString('zh-CN');
    const dataLine = `${storeCode},${storeName},${phone},${timestamp}\n`;
    
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.getTime().toString();
    const objectKey = `submissions/${dateStr}/${timeStr}.txt`;

    // 写入 R2
    await bucket.put(objectKey, dataLine, {
      httpMetadata: { contentType: 'text/plain;charset=utf-8' }
    });

    return jsonResponse({ success: true, message: '预约成功！期待您的光临' });

  } catch (error) {
    console.error('保存失败:', error);
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}

// 处理 GET 请求 - 用于测试
export async function onRequestGet() {
  return new Response(JSON.stringify({ success: true, message: 'API 正常运行' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
