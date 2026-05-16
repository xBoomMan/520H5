/**
 * 表单提交 API - 将数据写入 R2 存储桶
 * 路径: /api/submit
 * 方法: POST
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  const bucket = env.FORM_BUCKET;  // 绑定的 R2 存储桶

  // 1. 兜底防御：检查存储桶绑定是否存在
  if (!bucket) {
    return new Response(
      JSON.stringify({ success: false, message: '服务器未正确绑定 R2 存储桶' }),
      { status: 500, headers: { 'Content-Type': 'application/json;charset=utf-8' } }
    );
  }

  try {
    // 解析表单数据
    const formData = await request.formData();
    const storeCode = formData.get('storeCode')?.trim() || '未填写';
    const storeName = formData.get('storeName')?.trim();
    const phone = formData.get('phone')?.trim();

    // 验证必填字段
    if (!storeName || !phone) {
      return new Response(
        JSON.stringify({ success: false, message: '请填写门店名称和联系电话' }),
        { status: 400, headers: { 'Content-Type': 'application/json;charset=utf-8' } }
      );
    }

    // ======= 修复时区与格式化问题 =======
    // 强制转换为北京时间 (UTC+8)
    const now = new Date();
    const utc8Time = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    
    // 手工提取年月日时分秒（全环境安全兼容）
    const year = utc8Time.getUTCFullYear();
    const month = String(utc8Time.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utc8Time.getUTCDate()).padStart(2, '0');
    const hours = String(utc8Time.getUTCHours()).padStart(2, '0');
    const minutes = String(utc8Time.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc8Time.getUTCSeconds()).padStart(2, '0');

    // 拼接成标准时间格式: 2026/05/16 15:00:22
    const timestamp = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;

    // 拼接写入 txt 的数据行
    const dataLine = `${storeCode},${storeName},${phone},${timestamp}\n`;

    // 文件名格式: submissions/2026-05-16/1715842822000.txt
    const dateStr = `${year}-${month}-${day}`;
    const timeStr = now.getTime().toString();        // 毫秒时间戳保持唯一
    const objectKey = `submissions/${dateStr}/${timeStr}.txt`;

    // 2. 写入 R2
    await bucket.put(objectKey, dataLine, {
      httpMetadata: { contentType: 'text/plain;charset=utf-8' }
    });

    return new Response(
      JSON.stringify({ success: true, message: '预约成功！' }),
      { status: 200, headers: { 'Content-Type': 'application/json;charset=utf-8' } }
    );

  } catch (error) {
    // 即使极端情况报错，也确保向前端输出标准 JSON 避免 1101
    return new Response(
      JSON.stringify({ success: false, message: '服务器错误', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json;charset=utf-8' } }
    );
  }
}
