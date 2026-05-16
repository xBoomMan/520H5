/**
 * 表单提交 API - 将数据写入 R2 存储桶
 * 路径: /api/submit
 * 方法: POST
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // 辅助函数：返回 JSON 响应
  function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  try {
    // 检查 R2 绑定是否存在
    const bucket = env.FORM_BUCKET;
    if (!bucket) {
      console.error('R2 绑定未找到，请检查 Pages 设置中的 R2 绑定配置');
      return jsonResponse({ 
        success: false, 
        message: '服务器配置错误：存储桶未绑定' 
      }, 500);
    }

    // 解析表单数据
    let storeCode, storeName, phone;
    
    // 支持 JSON 和 FormData 两种格式
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

    // 验证必填字段
    if (!storeName) {
      return jsonResponse({ success: false, message: '请填写门店名称' }, 400);
    }
    if (!phone) {
      return jsonResponse({ success: false, message: '请填写联系电话' }, 400);
    }

    // 生成数据行
    const now = new Date();
    const timestamp = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const dataLine = `${storeCode},${storeName},${phone},${timestamp}\n`;
    
    // 文件名: submissions/2026-01-15/1705301234567.txt
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.getTime().toString();
    const objectKey = `submissions/${dateStr}/${timeStr}.txt`;

    // 写入 R2
    await bucket.put(objectKey, dataLine, {
      httpMetadata: { contentType: 'text/plain;charset=utf-8' }
    });

    console.log(`预约记录已保存: ${objectKey}`);
    
    return jsonResponse({ 
      success: true, 
      message: '预约成功！期待您的光临' 
    });

  } catch (error) {
    console.error('保存失败:', error);
    return jsonResponse({ 
      success: false, 
      message: `服务器错误: ${error.message}` 
    }, 500);
  }
}

// 处理 GET 请求（用于测试 API 是否正常工作）
export async function onRequestGet() {
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'API 服务正常运行，请使用 POST 方法提交表单' 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
