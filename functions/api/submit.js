export async function onRequestPost(context) {
  const { request, env } = context;
  const bucket = env.FORM_BUCKET;
  const fileName = 'booking_records.txt';

  try {
    const formData = await request.formData();
    const storeCode = formData.get('storeCode')?.trim() || '未填写';
    const storeName = formData.get('storeName')?.trim();
    const phone = formData.get('phone')?.trim();

    if (!storeName || !phone) {
      return new Response(JSON.stringify({ success: false, message: '请填写完整信息' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 1. 读取现有文件内容（如果存在）
    let existingData = '';
    try {
      const existingFile = await bucket.get(fileName);
      if (existingFile) {
        existingData = await existingFile.text();
      }
    } catch (err) {
      // 文件不存在，忽略错误
    }

    // 2. 追加新数据
    const now = new Date().toLocaleString('zh-CN');
    const newLine = `${storeCode},${storeName},${phone},${now}\n`;
    const newData = existingData + newLine;

    // 3. 写回 R2（覆盖写入）
    await bucket.put(fileName, newData, {
      httpMetadata: { contentType: 'text/plain;charset=utf-8' }
    });

    return new Response(JSON.stringify({ success: true, message: '预约成功！' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('保存失败:', error);
    return new Response(JSON.stringify({ success: false, message: '服务器错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
