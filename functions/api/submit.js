/**
 * 表单提交 API - 将数据写入 R2 存储桶
 * 路径: /api/submit
 * 方法: POST
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  const bucket = env.FORM_BUCKET;  // 绑定的 R2 存储桶

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
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 生成数据行和文件名
    const now = new Date();
    const timestamp = now.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });

    const dataLine = `${storeCode},${storeName},${phone},${timestamp}\n`;

    // 文件名格式: submissions/2026-01-15/1705301234567.txt
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.getTime().toString();        // 毫秒时间戳
    const objectKey = `submissions/${dateStr}/${timeStr}.txt`;

    // 写入 R2（注意：R2 的 put 方法是覆盖写入，需要先读取已有数据再合并）
    // 方案一：每条记录单独存一个文件（推荐，简单且避免并发问题）
    await bucket.put(objectKey, dataLine, {
      httpMetadata: { contentType: 'text/plain;charset=utf-8' }
    });

    return new Response(
      JSON.stringify({ success: true, message: '预约成功！' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('保存失败:', error);
    return new Response(
      JSON.stringify({ success: false, message: '服务器错误，请稍后重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}