// 深圳坐标
const SHENZHEN_LAT = 22.5431;
const SHENZHEN_LON = 114.0579;

// 使用 Open-Meteo 免费天气 API (无需密钥)
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// 天气图标映射
const weatherIcons = {
    'Sunny': '☀️',
    'Clear': '🌙',
    'Cloudy': '☁️',
    'Rainy': '🌧️',
    'Thunderstorm': '⛈️',
    'Snowy': '❄️',
    'Mist': '🌫️',
    'Partly cloudy': '⛅',
    'Overcast': '☁️',
    'Light rain': '🌦️',
    'Heavy rain': '🌧️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Default': '🌤️'
};

// WMO 天气代码对应描述和图标
const wmoWeatherCodes = {
    0: { desc: '晴朗', icon: '☀️' },
    1: { desc: '主要晴朗', icon: '🌤️' },
    2: { desc: '部分多云', icon: '⛅' },
    3: { desc: '阴天', icon: '☁️' },
    45: { desc: '有雾', icon: '🌫️' },
    48: { desc: '沉积雾', icon: '🌫️' },
    51: { desc: '轻微细雨', icon: '🌦️' },
    53: { desc: '中等细雨', icon: '🌦️' },
    55: { desc: '密集细雨', icon: '🌦️' },
    61: { desc: '轻微雨', icon: '🌧️' },
    63: { desc: '中等雨', icon: '🌧️' },
    65: { desc: '大雨', icon: '⛈️' },
    71: { desc: '轻微雪', icon: '❄️' },
    73: { desc: '中等雪', icon: '❄️' },
    75: { desc: '大雪', icon: '❄️' },
    77: { desc: '雪粒', icon: '❄️' },
    80: { desc: '轻微阵雨', icon: '🌧️' },
    81: { desc: '中等阵雨', icon: '⛈️' },
    82: { desc: '强阵雨', icon: '⛈️' },
    85: { desc: '轻微阵雪', icon: '❄️' },
    86: { desc: '强阵雪', icon: '❄️' },
    95: { desc: '雷暴', icon: '⛈️' },
    96: { desc: '轻微冰雹雷暴', icon: '⛈️' },
    99: { desc: '强冰雹雷暴', icon: '⛈️' }
};

// 获取天气数据
async function fetchWeatherData() {
    try {
        const response = await fetch(
            `${WEATHER_API}?latitude=${SHENZHEN_LAT}&longitude=${SHENZHEN_LON}&current=temperature_2m,weather_code,humidity,pressure_msl,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,humidity_2m_max,wind_speed_10m_max&timezone=Asia/Shanghai&forecast_days=15`
        );

        if (!response.ok) throw new Error('天气数据获取失败');

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('错误:', error);
        showError('无法获取天气数据，请稍后重试');
        return null;
    }
}

// 获取天气描述
function getWeatherDescription(code) {
    return wmoWeatherCodes[code] || wmoWeatherCodes[0];
}

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];
    return `${month}/${day} ${weekDay}`;
}

// 显示当前天气
function displayCurrentWeather(data) {
    const current = data.current;
    const weather = getWeatherDescription(current.weather_code);

    document.getElementById('currentTemp').textContent = Math.round(current.temperature_2m);
    document.getElementById('weatherDesc').textContent = weather.desc;
    document.getElementById('humidity').textContent = current.humidity + '%';
    document.getElementById('windSpeed').textContent = Math.round(current.wind_speed_10m) + ' km/h';
    document.getElementById('pressure').textContent = Math.round(current.pressure_msl) + ' hPa';
    document.getElementById('updateTime').textContent = new Date().toLocaleString('zh-CN');
    document.getElementById('lastUpdate').textContent = new Date().toLocaleString('zh-CN');
}

// 显示15天预报
function displayForecast(data) {
    const daily = data.daily;
    const container = document.getElementById('forecastContainer');
    container.innerHTML = '';

    for (let i = 0; i < daily.time.length; i++) {
        const weather = getWeatherDescription(daily.weather_code[i]);
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${formatDate(daily.time[i])}</div>
            <div class="forecast-icon">${weather.icon}</div>
            <div class="forecast-desc">${weather.desc}</div>
            <div class="forecast-temp">
                <span class="max-temp">↑ ${Math.round(daily.temperature_2m_max[i])}°</span>
                <span class="min-temp">↓ ${Math.round(daily.temperature_2m_min[i])}°</span>
            </div>
            <div class="forecast-details">
                <p>降水: ${daily.precipitation_sum[i]} mm</p>
                <p>湿度: ${daily.humidity_2m_max[i]}%</p>
                <p>风速: ${Math.round(daily.wind_speed_10m_max[i])} km/h</p>
            </div>
        `;
        container.appendChild(card);
    }
}

// 显示错误信息
function showError(message) {
    const container = document.getElementById('forecastContainer');
    container.innerHTML = `<div class="loading" style="color: red;">${message}</div>`;
}

// 初始化
async function init() {
    const data = await fetchWeatherData();
    if (data) {
        displayCurrentWeather(data);
        displayForecast(data);
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', init);

// 每30分钟自动刷新一次
setInterval(init, 30 * 60 * 1000);