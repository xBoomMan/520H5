/**
 * 晨光520特惠节 H5翻页邀请函
 * 功能：Swiper翻页、倒计时、音乐控制、樱花飘落、表单提交保存到txt
 */

// ======================= 初始化 Swiper 翻页效果 =======================
const swiper = new Swiper('.swiper', {
    direction: 'vertical',
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
    },
    touchRatio: 1,
    resistance: true,
    resistanceRatio: 0.85,
    speed: 400,
    keyboard: true
});

// ======================= 倒计时 (活动开始 2026年5月18日 00:00:00) =======================
const targetDate = new Date(2026, 4, 18, 0, 0, 0);

function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        const cdBox = document.querySelector('.countdown-box');
        if (cdBox && !cdBox.hasAttribute('data-started')) {
            const titleDiv = cdBox.querySelector('.countdown-title');
            if (titleDiv) titleDiv.innerHTML = '<i class="fas fa-party-horn"></i> 狂欢进行时 快来参与！';
            cdBox.setAttribute('data-started', 'true');
        }
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    document.getElementById('days').innerText = days < 10 ? '0' + days : days;
    document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
    document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
}

// 初始化倒计时并每秒更新
updateTimer();
setInterval(updateTimer, 1000);

// ======================= 音乐自动播放与交互控制 =======================
const audio = document.getElementById('bgAudio');
const musicBtn = document.getElementById('musicToggle');
let isPlaying = false;

// 尝试自动播放（浏览器策略限制，可能需要用户首次交互）
function attemptAutoPlay() {
    audio.play().then(() => {
        isPlaying = true;
        musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
        console.log("音乐自动播放成功");
    }).catch(err => {
        console.log("自动播放被浏览器阻止，等待用户点击音乐按钮", err);
        musicBtn.style.opacity = "0.8";
    });
}

// 页面加载时尝试自动播放
setTimeout(attemptAutoPlay, 500);

// 音乐按钮点击事件
musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isPlaying) {
        audio.play().then(() => {
            isPlaying = true;
            musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
            musicBtn.style.opacity = "1";
        }).catch(err => {
            alert("请手动点击页面允许播放音乐");
        });
    } else {
        audio.pause();
        isPlaying = false;
        musicBtn.innerHTML = '<i class="fas fa-music"></i>';
    }
});

// ======================= 地图导航模拟 =======================
const mapTrigger = document.getElementById('mapTrigger');
if (mapTrigger) {
    mapTrigger.addEventListener('click', () => {
        alert("📍 会议地址：晨光文具临沂配送中心\n山东省临沂市兰山区大山路与工业二路交汇处\n可使用高德/百度地图导航。");
    });
}

// 表单提交 - 保存到 R2
async function saveToTxt(storeCode, storeName, phone) {
    // 构造标准的 JSON 对象
    const requestData = {
        storeCode: storeCode,
        storeName: storeName,
        phone: phone
    };

    try {
        console.log("正在提交到 /api/submit...");
        const response = await fetch('https://h5.myoracle.us.ci/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8' // 显式声明为 JSON 格式
            },
            body: JSON.stringify(requestData) // 将对象序列化为字符串
        });
        
        const result = await response.json();
        if (result.success) {
            return true;
        } else {
            showToast("❌ " + result.message, true);
            return false;
        }
    } catch (error) {
        console.error('提交失败:', error);
        showToast("❌ 网络错误，请稍后重试", true);
        return false;
    }
}
/**
 * 降级方案：保存到 localStorage 并提供下载
 */
function fallbackSaveToLocal(line) {
    try {
        let existingData = localStorage.getItem('bookingRecords') || '';
        existingData += line;
        localStorage.setItem('bookingRecords', existingData);

        // 生成txt下载
        const blob = new Blob([existingData], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = 'booking_records_backup.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (e) {
        console.error("降级方案也失败了:", e);
        return false;
    }
}

/**
 * 显示提示消息
 */
function showToast(msg, isError = false) {
    const toast = document.createElement('div');
    toast.innerText = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '100px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = isError ? '#c0392be6' : '#2c1e12e6';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.color = '#ffefcf';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '50px';
    toast.style.zIndex = '1000';
    toast.style.fontSize = '0.9rem';
    toast.style.whiteSpace = 'nowrap';
    toast.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// 表单提交事件
const submitBtn = document.getElementById('submitBookingBtn');
if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
        const storeCode = document.getElementById('storeCode').value.trim();
        const storeName = document.getElementById('storeName').value.trim();
        const phone = document.getElementById('phone').value.trim();

        // 验证必填字段
        if (!storeName) {
            showToast("❌ 请填写门店名称！", true);
            return;
        }
        if (!phone) {
            showToast("❌ 请填写联系电话！", true);
            return;
        }

        // 电话号码验证（手机号或座机）
        const phoneRegex = /^1[3-9]\d{9}$|^\d{7,11}$/;
        if (!phoneRegex.test(phone) && phone.length < 7) {
            showToast("❌ 请填写有效的联系电话（手机或固话）", true);
            return;
        }

        // 显示加载状态
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> 提交中...';
        submitBtn.disabled = true;

        // 保存数据
        const success = await saveToTxt(storeCode, storeName, phone);

        // 恢复按钮状态
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (success) {
            showToast("✅ 预约成功！感谢您的参与，期待光临！");
            // 清空表单
            document.getElementById('storeCode').value = '';
            document.getElementById('storeName').value = '';
            document.getElementById('phone').value = '';

            // 可选：震动反馈（移动端）
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
        } else {
            showToast("❌ 保存失败，请检查网络后重试", true);
        }
    });
}

// ======================= 樱花飘落效果 (Canvas动画 - 缓慢自然飘落) =======================
(function sakuraEffect() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '3';
    document.body.appendChild(canvas);

    let ctx = canvas.getContext('2d');
    let width, height;
    let petals = [];
    const PETAL_COUNT = 50;  // 花瓣数量

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    class Petal {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height - height;
            this.size = 6 + Math.random() * 8;
            // 缓慢飘落速度
            this.speedY = 0.3 + Math.random() * 0.5;
            this.speedX = (Math.random() - 0.5) * 0.25;
            this.rotate = Math.random() * Math.PI * 2;
            this.rotateSpeed = (Math.random() - 0.5) * 0.02;
            this.opacity = 0.5 + Math.random() * 0.4;
            // 樱花淡粉色系
            const pinkHue = 340 + Math.random() * 20;
            this.color = `hsla(${pinkHue}, 70%, 70%, ${this.opacity})`;
            this.type = Math.floor(Math.random() * 3);
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotate);
            ctx.beginPath();

            if (this.type === 0) {
                // 花瓣形状1
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(this.size / 2, -this.size / 2, this.size, 0);
                ctx.quadraticCurveTo(this.size / 2, this.size / 2, 0, 0);
            } else if (this.type === 1) {
                // 花瓣形状2 - 椭圆形
                ctx.ellipse(0, 0, this.size / 2, this.size / 3, 0, 0, Math.PI * 2);
            } else {
                // 花瓣形状3 - 心形轮廓
                ctx.moveTo(0, -this.size / 2);
                ctx.quadraticCurveTo(this.size / 2, 0, 0, this.size / 2);
                ctx.quadraticCurveTo(-this.size / 2, 0, 0, -this.size / 2);
            }

            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotate += this.rotateSpeed;

            // 超出底部重置到顶部
            if (this.y > height + 50) {
                this.y = -30;
                this.x = Math.random() * width;
            }
            // 超出左右边界回绕
            if (this.x < -50) this.x = width + 30;
            if (this.x > width + 50) this.x = -30;
        }
    }

    function initPetals() {
        petals = [];
        for (let i = 0; i < PETAL_COUNT; i++) {
            petals.push(new Petal());
        }
    }

    function animatePetals() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        for (let p of petals) {
            p.update();
            p.draw();
        }
        requestAnimationFrame(animatePetals);
    }

    // 窗口大小改变时重新初始化
    window.addEventListener('resize', () => {
        resizeCanvas();
        initPetals();
    });

    resizeCanvas();
    initPetals();
    animatePetals();
})();

// ======================= 控制台提示信息 =======================
console.log("%c🌸 晨光520特惠节 H5邀请函已加载 🌸\n✅ 樱花缓缓飘落效果已开启\n✅ 表单数据将保存到 booking_records.txt\n✅ 音乐已尝试自动播放\n✅ 门店编码为选填项", "color: #e67e22; font-size: 14px; font-weight: bold;");
