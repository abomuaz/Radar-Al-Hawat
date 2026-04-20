const FAVORITE_KEY = "radar.favoriteSpot";
const CHECKLIST_KEY = "radar.checklist";
const SETTINGS_KEY = "radar.settings";
const LAST_DATA_KEY = "radar.lastDataset";

const DEFAULT_SETTINGS = {
    defaultCity: "Jeddah",
    windAlertThreshold: 28,
    waveAlertThreshold: 1.8
};

const WEATHER_CODES = {
    0: "صحو",
    1: "غائم جزئيًا",
    2: "غيوم متفرقة",
    3: "غائم",
    45: "ضباب",
    48: "ضباب كثيف",
    51: "رذاذ خفيف",
    53: "رذاذ متوسط",
    55: "رذاذ كثيف",
    56: "مطر متجمد خفيف",
    57: "مطر متجمد كثيف",
    61: "مطر خفيف",
    63: "مطر متوسط",
    65: "مطر غزير",
    66: "مطر بارد خفيف",
    67: "مطر بارد غزير",
    71: "ثلوج خفيفة",
    73: "ثلوج متوسطة",
    75: "ثلوج كثيفة",
    80: "زخات خفيفة",
    81: "زخات متوسطة",
    82: "زخات قوية",
    95: "عاصفة رعدية",
    96: "عاصفة رعدية مع برد",
    99: "عاصفة قوية جدًا"
};

const CHECKLIST_ITEMS = [
    { id: "life_jacket", label: "سترة نجاة" },
    { id: "bait", label: "الطُّعم أو السنّارة" },
    { id: "ice_box", label: "صندوق حفظ وثلج" },
    { id: "water", label: "ماء وشحن للهاتف" },
    { id: "permits", label: "التأكد من التصاريح والسلامة" }
];

const elements = {
    searchForm: document.getElementById("searchForm"),
    cityInput: document.getElementById("cityInput"),
    locateBtn: document.getElementById("locateBtn"),
    demoBtn: document.getElementById("demoBtn"),
    saveSpotBtn: document.getElementById("saveSpotBtn"),
    shareBtn: document.getElementById("shareBtn"),
    installBtn: document.getElementById("installBtn"),
    openMapLink: document.getElementById("openMapLink"),
    statusText: document.getElementById("statusText"),
    savedSpotText: document.getElementById("savedSpotText"),
    todayInfoText: document.getElementById("todayInfoText"),
    locationName: document.getElementById("locationName"),
    currentTime: document.getElementById("currentTime"),
    tempValue: document.getElementById("tempValue"),
    windValue: document.getElementById("windValue"),
    windDirValue: document.getElementById("windDirValue"),
    waveValue: document.getElementById("waveValue"),
    seaValue: document.getElementById("seaValue"),
    wavePeriodValue: document.getElementById("wavePeriodValue"),
    sunriseValue: document.getElementById("sunriseValue"),
    sunsetValue: document.getElementById("sunsetValue"),
    tideValue: document.getElementById("tideValue"),
    scoreRing: document.getElementById("scoreRing"),
    scoreValue: document.getElementById("scoreValue"),
    scoreLabel: document.getElementById("scoreLabel"),
    scoreSummary: document.getElementById("scoreSummary"),
    scorePanel: document.querySelector(".score-panel"),
    reasonsList: document.getElementById("reasonsList"),
    alertsList: document.getElementById("alertsList"),
    bestTimesList: document.getElementById("bestTimesList"),
    forecastScrollWrap: document.getElementById("forecastScrollWrap"),
    forecastGrid: document.getElementById("forecastGrid"),
    hourlyScrollWrap: document.getElementById("hourlyScrollWrap"),
    hourlyForecastGrid: document.getElementById("hourlyForecastGrid"),
    forecastSummaryText: document.getElementById("forecastSummaryText"),
    forecastPrevBtn: document.getElementById("forecastPrevBtn"),
    forecastNextBtn: document.getElementById("forecastNextBtn"),
    checklistGrid: document.getElementById("checklistGrid"),
    mapFrame: document.getElementById("mapFrame"),
    coordsText: document.getElementById("coordsText"),
    marineStateText: document.getElementById("marineStateText"),
    settingsForm: document.getElementById("settingsForm"),
    defaultCityInput: document.getElementById("defaultCityInput"),
    windThresholdInput: document.getElementById("windThresholdInput"),
    waveThresholdInput: document.getElementById("waveThresholdInput"),
    resetSettingsBtn: document.getElementById("resetSettingsBtn")
};

const appState = {
    location: null,
    dataset: null,
    deferredPrompt: null
};

function setStatus(message, type = "info") {
    elements.statusText.textContent = message;
    elements.statusText.className = "status-chip";

    if (type === "error") elements.statusText.classList.add("is-error");
    if (type === "warning") elements.statusText.classList.add("is-warning");
    if (type === "success") elements.statusText.classList.add("is-success");
}

function syncPanelWidths() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const width = `${Math.round(hero.getBoundingClientRect().width)}px`;
    document.documentElement.style.setProperty("--hero-panel-width", width);
}

function formatNumber(value, fractionDigits = 0) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";

    return new Intl.NumberFormat("ar", {
        maximumFractionDigits: fractionDigits,
        minimumFractionDigits: fractionDigits
    }).format(Number(value));
}

function formatDateTime(value) {
    if (!value) return "--";
    return new Intl.DateTimeFormat("ar", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(value));
}

function formatTimeOnly(value) {
    if (!value) return "--";
    return new Intl.DateTimeFormat("ar", {
        hour: "numeric",
        minute: "2-digit"
    }).format(new Date(value));
}

function formatClockTime(value = new Date()) {
    const formatted = new Intl.DateTimeFormat("ar", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    }).format(new Date(value));

    return formatted.replace("AM", "ص").replace("PM", "م");
}

function finalizeDashboardStatus(dataset, successMessage) {
    if (dataset.isCoastal === false) {
        setStatus("الموقع غير ساحلي. مؤشر الصيد يظهر فقط للمناطق الساحلية القريبة من البحر.", "warning");
        return;
    }

    setStatus(successMessage, "success");
}

function formatDay(value) {
    return new Intl.DateTimeFormat("ar", { weekday: "long" }).format(new Date(value));
}

function formatGregorianDate(value) {
    if (!value) return "--";
    return new Intl.DateTimeFormat("ar", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(new Date(value));
}

function formatHijriDate(value) {
    if (!value) return "--";

    const date = new Date(value);
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    try {
        return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", options).format(date);
    } catch {
        try {
            return new Intl.DateTimeFormat("ar-u-ca-islamic", options).format(date);
        } catch {
            return formatGregorianDate(date);
        }
    }
}

function updateLiveDateTime(referenceValue) {
    const now = new Date();
    const gregorianText = formatGregorianDate(now);
    const hijriText = formatHijriDate(now);
    const clockText = formatClockTime(now);

    if (elements.todayInfoText) {
        elements.todayInfoText.textContent = `اليوم: ${gregorianText} • هجري: ${hijriText} • الوقت الآن: ${clockText}`;
    }

    if (elements.currentTime) {
        elements.currentTime.textContent = referenceValue
            ? `آخر تحديث: ${formatDateTime(referenceValue)} • الآن ${clockText}`
            : `الآن ${clockText}`;
    }
}

function getWeatherLabel(code) {
    return WEATHER_CODES[code] || "حالة غير معروفة";
}

function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
}

function average(values = []) {
    const filtered = values.filter((value) => typeof value === "number" && !Number.isNaN(value));
    if (!filtered.length) return null;
    return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function degreesToDirection(degrees) {
    if (degrees === null || degrees === undefined || Number.isNaN(Number(degrees))) return "--";

    const directions = ["شمال", "شمال شرقي", "شرق", "جنوب شرقي", "جنوب", "جنوب غربي", "غرب", "شمال غربي"];
    const index = Math.round((Number(degrees) % 360) / 45) % 8;
    return directions[index];
}

function estimateTideState(dateValue) {
    const date = new Date(dateValue || Date.now());
    const hours = date.getHours() + (date.getMinutes() / 60);
    const phase = (hours / 6.2) % 4;

    if (phase < 1) return "مدّ صاعد";
    if (phase < 2) return "ذروة المدّ";
    if (phase < 3) return "جزر هابط";
    return "أدنى جزر";
}

function estimateFishActivity(dateValue, weatherCode, windSpeed, waveHeight) {
    const date = new Date(dateValue || Date.now());
    const hour = date.getHours();
    let score = 50;

    if ((hour >= 4 && hour <= 7) || (hour >= 16 && hour <= 19)) score += 22;
    if (hour >= 11 && hour <= 14) score -= 10;
    if ([0, 1, 2].includes(weatherCode)) score += 10;
    if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode)) score -= 16;
    if ((windSpeed ?? 0) <= 18) score += 8;
    if ((windSpeed ?? 0) > 28) score -= 12;
    if ((waveHeight ?? 0) <= 1.2) score += 8;
    if ((waveHeight ?? 0) > 2) score -= 12;

    if (score >= 75) return "نشاط ممتاز";
    if (score >= 60) return "نشاط جيد";
    if (score >= 45) return "نشاط متوسط";
    return "نشاط ضعيف";
}

function getMoonPhaseInfo(dateValue) {
    const date = new Date(dateValue || Date.now());
    const synodicMonth = 29.53058867;
    const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
    const daysSince = (date.getTime() - knownNewMoon) / 86400000;
    const age = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;

    if (age < 1.8) return "محاق";
    if (age < 7.4) return "هلال متزايد";
    if (age < 9.2) return "التربيع الأول";
    if (age < 14.8) return "أحدب متزايد";
    if (age < 16.5) return "بدر";
    if (age < 22.1) return "أحدب متناقص";
    if (age < 23.9) return "التربيع الأخير";
    return "هلال متناقص";
}

function buildHourlyEntries(dataset) {
    const hourly = dataset.forecast.hourly || {};
    const marineHourly = dataset.marine.hourly || {};
    const current = dataset.forecast.current || {};
    const times = (hourly.time || []).slice(0, 24);

    if (times.length) {
        return times.map((time, index) => {
            const weatherCode = hourly.weather_code?.[index] ?? current.weather_code ?? 0;
            const wind = hourly.wind_speed_10m?.[index] ?? current.wind_speed_10m ?? 12;
            const wave = marineHourly.wave_height?.[index] ?? estimateWaveHeightFromWind(wind, weatherCode);
            const temp = hourly.temperature_2m?.[index] ?? current.temperature_2m ?? 26;

            return {
                time,
                weatherCode,
                wind,
                wave,
                temp,
                tide: estimateTideState(time),
                fish: estimateFishActivity(time, weatherCode, wind, wave),
                moon: getMoonPhaseInfo(time)
            };
        });
    }

    const now = new Date();
    return Array.from({ length: 24 }, (_, index) => {
        const time = new Date(now);
        time.setHours(now.getHours() + index, 0, 0, 0);

        const weatherCode = current.weather_code ?? 1;
        const wind = (current.wind_speed_10m ?? 12) + ((index % 5) - 2);
        const wave = estimateWaveHeightFromWind(wind, weatherCode);
        const temp = (current.temperature_2m ?? 26) + Math.sin(index / 3) * 2;

        return {
            time: time.toISOString(),
            weatherCode,
            wind,
            wave,
            temp,
            tide: estimateTideState(time),
            fish: estimateFishActivity(time, weatherCode, wind, wave),
            moon: getMoonPhaseInfo(time)
        };
    });
}

function getMarineState(marineCurrent = {}) {
    const wave = marineCurrent.wave_height ?? null;
    const wavePeriod = marineCurrent.wind_wave_period ?? marineCurrent.swell_wave_period ?? null;

    if (wave === null) return "بيانات البحر قيد التحديث";
    if (wave <= 0.8 && (wavePeriod ?? 0) <= 5) return "بحر هادئ نسبيًا";
    if (wave <= 1.6) return "بحر متوسط مع حاجة للانتباه";
    return "بحر مضطرب ويتطلب حذرًا";
}

function estimateSeaSurfaceTemperature(airTemp, latitude) {
    return clamp((Number(airTemp) || 26) + 1.2 - Math.min(Math.abs(Number(latitude) || 0) / 40, 1.5), 15, 33);
}

function estimateWaveHeightFromWind(windSpeed, weatherCode) {
    let base = 0.35 + ((Number(windSpeed) || 14) / 26);
    if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
        base += 0.35;
    }
    return clamp(base, 0.2, 3.8);
}

function estimateWavePeriodFromWeather(waveHeight, windSpeed) {
    return clamp(3 + (Number(waveHeight) || 0.8) * 2.2 - (Number(windSpeed) || 14) / 35, 2.5, 10);
}

function estimateWaveDirectionFromWind(windDirection, longitude) {
    return ((Number(windDirection) || 270) + 12 + Math.round(Math.abs(Number(longitude) || 0) % 18)) % 360;
}

function normalizeMarineData(location, forecast, marine = {}) {
    const forecastCurrent = forecast.current || {};
    const defaultWind = forecastCurrent.wind_speed_10m ?? average(forecast.hourly?.wind_speed_10m?.slice(0, 6) || []) ?? 14;
    const defaultDirection = forecastCurrent.wind_direction_10m ?? average(forecast.hourly?.wind_direction_10m?.slice(0, 6) || []) ?? 300;
    const defaultCode = forecastCurrent.weather_code ?? 0;

    const current = {
        ...(marine.current || {})
    };

    current.wave_height ??= estimateWaveHeightFromWind(defaultWind, defaultCode);
    current.sea_surface_temperature ??= estimateSeaSurfaceTemperature(forecastCurrent.temperature_2m, location.latitude);
    current.wind_wave_period ??= estimateWavePeriodFromWeather(current.wave_height, defaultWind);
    current.wind_wave_direction ??= estimateWaveDirectionFromWind(defaultDirection, location.longitude);
    current.swell_wave_height ??= clamp(current.wave_height * 0.78, 0.1, 3.1);
    current.swell_wave_period ??= clamp(current.wind_wave_period + 1.2, 3, 11);
    current.swell_wave_direction ??= (current.wind_wave_direction + 8) % 360;

    const hourlyTime = forecast.hourly?.time || marine.hourly?.time || [];
    const hourly = {
        ...(marine.hourly || {}),
        time: hourlyTime,
        wave_height: hourlyTime.map((_, index) => marine.hourly?.wave_height?.[index] ?? estimateWaveHeightFromWind(forecast.hourly?.wind_speed_10m?.[index], forecast.hourly?.weather_code?.[index])),
        sea_surface_temperature: hourlyTime.map((_, index) => marine.hourly?.sea_surface_temperature?.[index] ?? estimateSeaSurfaceTemperature(forecast.hourly?.temperature_2m?.[index], location.latitude)),
        wind_wave_period: hourlyTime.map((_, index) => marine.hourly?.wind_wave_period?.[index] ?? estimateWavePeriodFromWeather(marine.hourly?.wave_height?.[index] ?? estimateWaveHeightFromWind(forecast.hourly?.wind_speed_10m?.[index], forecast.hourly?.weather_code?.[index]), forecast.hourly?.wind_speed_10m?.[index])),
        wind_wave_direction: hourlyTime.map((_, index) => marine.hourly?.wind_wave_direction?.[index] ?? estimateWaveDirectionFromWind(forecast.hourly?.wind_direction_10m?.[index], location.longitude))
    };

    const dailyTime = forecast.daily?.time || marine.daily?.time || [];
    const daily = {
        ...(marine.daily || {}),
        time: dailyTime,
        wave_height_max: dailyTime.map((_, index) => {
            const liveValue = marine.daily?.wave_height_max?.[index];
            if (liveValue !== undefined && liveValue !== null) return liveValue;
            return clamp(
                estimateWaveHeightFromWind(
                    average((forecast.hourly?.wind_speed_10m || []).slice(index * 3, index * 3 + 3)) ?? defaultWind,
                    forecast.daily?.weather_code?.[index]
                ) + (((forecast.daily?.temperature_2m_max?.[index] ?? 28) - 24) * 0.02),
                0.2,
                4
            );
        })
    };

    return { current, hourly, daily };
}

function getSettings() {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null") || {};
    return {
        defaultCity: stored.defaultCity || DEFAULT_SETTINGS.defaultCity,
        windAlertThreshold: Number(stored.windAlertThreshold || DEFAULT_SETTINGS.windAlertThreshold),
        waveAlertThreshold: Number(stored.waveAlertThreshold || DEFAULT_SETTINGS.waveAlertThreshold)
    };
}

function populateSettingsForm() {
    const settings = getSettings();
    elements.defaultCityInput.value = settings.defaultCity;
    elements.windThresholdInput.value = settings.windAlertThreshold;
    elements.waveThresholdInput.value = settings.waveAlertThreshold;
}

function getCachedSnapshot() {
    try {
        return JSON.parse(localStorage.getItem(LAST_DATA_KEY) || "null");
    } catch {
        return null;
    }
}

function saveCachedSnapshot(dataset) {
    try {
        localStorage.setItem(LAST_DATA_KEY, JSON.stringify({
            savedAt: new Date().toISOString(),
            dataset
        }));
    } catch {
        // تجاهل مشاكل التخزين المحلية إن حدثت
    }
}

function restoreCachedSnapshot() {
    const snapshot = getCachedSnapshot();
    if (!snapshot?.dataset) return false;

    renderDashboard(snapshot.dataset);
    const savedAt = snapshot.savedAt ? formatDateTime(snapshot.savedAt) : "آخر مزامنة";
    setStatus(`وضع دون اتصال — عرض آخر بيانات محفوظة (${savedAt}).`, "warning");
    return true;
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`فشل الاتصال (${response.status})`);
    }
    return response.json();
}

async function geocodeLocation(query) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=ar&format=json`;
    const data = await fetchJson(url);

    if (!data.results || !data.results.length) {
        throw new Error("لم يتم العثور على الموقع المطلوب.");
    }

    const match = data.results[0];
    return {
        name: [match.name, match.country].filter(Boolean).join("، "),
        latitude: match.latitude,
        longitude: match.longitude
    };
}

async function fetchLocationDataset(location) {
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=16`;
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${location.latitude}&longitude=${location.longitude}&current=wave_height,sea_surface_temperature,wind_wave_height,wind_wave_direction,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&hourly=wave_height,sea_surface_temperature,wind_wave_height,wind_wave_direction,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&daily=wave_height_max&timezone=auto&forecast_days=16`;

    const [forecastResult, marineResult] = await Promise.allSettled([
        fetchJson(forecastUrl),
        fetchJson(marineUrl)
    ]);

    if (forecastResult.status !== "fulfilled") {
        throw forecastResult.reason instanceof Error ? forecastResult.reason : new Error("تعذر جلب توقعات الطقس.");
    }

    const forecast = forecastResult.value;
    const marineSource = marineResult.status === "fulfilled"
        ? marineResult.value
        : { current: {}, hourly: {}, daily: {} };

    const marine = normalizeMarineData(location, forecast, marineSource);
    const hasCoastalMarineData = marineResult.status === "fulfilled" && marineSource.current?.wave_height != null;
    return { location, forecast, marine, isCoastal: Boolean(hasCoastalMarineData) };
}

function calculateFishingScore(dataset) {
    const current = dataset.forecast.current || {};
    const marineCurrent = dataset.marine.current || {};

    const wind = current.wind_speed_10m ?? average(dataset.forecast.hourly?.wind_speed_10m?.slice(0, 6) || []);
    const temp = current.temperature_2m ?? average(dataset.forecast.hourly?.temperature_2m?.slice(0, 6) || []);
    const humidity = current.relative_humidity_2m ?? null;
    const waveHeight = marineCurrent.wave_height ?? average(dataset.marine.hourly?.wave_height?.slice(0, 6) || []);
    const code = current.weather_code ?? 0;

    let score = 52;
    const reasons = [];

    if (wind !== null) {
        if (wind <= 18) {
            score += 16;
            reasons.push("الرياح هادئة نسبيًا ومناسبة للصيد.");
        } else if (wind <= 28) {
            score += 7;
            reasons.push("الرياح مقبولة لكن تحتاج انتباهًا.");
        } else {
            score -= 18;
            reasons.push("الرياح قوية وقد تؤثر على ثبات القارب.");
        }
    }

    if (waveHeight !== null) {
        if (waveHeight <= 1.2) {
            score += 14;
            reasons.push("ارتفاع الموج منخفض ومريح نسبيًا.");
        } else if (waveHeight <= 2) {
            score += 6;
            reasons.push("الموج متوسط ويمكن التعامل معه بحذر.");
        } else {
            score -= 16;
            reasons.push("الموج مرتفع ويستدعي الحذر الشديد.");
        }
    }

    if ([0, 1, 2, 3].includes(code)) {
        score += 10;
        reasons.push("الطقس مستقر دون مؤشرات عواصف قوية.");
    } else if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) {
        score -= 18;
        reasons.push("هناك أمطار أو اضطرابات قد تقلل جودة الرحلة.");
    }

    if (temp !== null && temp >= 20 && temp <= 31) {
        score += 8;
        reasons.push("درجة الحرارة مناسبة للخروج لفترة متوسطة.");
    }

    if (humidity !== null && humidity > 85) {
        score -= 4;
        reasons.push("الرطوبة مرتفعة نسبيًا؛ خذ ماءً كافيًا.");
    }

    score = clamp(Math.round(score), 0, 100);

    let label = "متوسط";
    if (score >= 80) label = "ممتاز";
    else if (score >= 65) label = "جيد";
    else if (score < 45) label = "ضعيف";

    return {
        score,
        label,
        reasons: reasons.slice(0, 4)
    };
}

function buildBestTimes(dataset) {
    const hourlyTimes = dataset.forecast.hourly?.time || [];
    const hourlyWind = dataset.forecast.hourly?.wind_speed_10m || [];
    const hourlyWeather = dataset.forecast.hourly?.weather_code || [];
    const hourlyWaves = dataset.marine.hourly?.wave_height || [];

    const windows = hourlyTimes.slice(0, 24).map((time, index) => {
        const hour = new Date(time).getHours();
        const wind = hourlyWind[index] ?? 20;
        const wave = hourlyWaves[index] ?? 1.2;
        const code = hourlyWeather[index] ?? 1;

        let score = 50;
        if (hour >= 4 && hour <= 8) score += 18;
        if (hour >= 16 && hour <= 19) score += 14;
        if (wind <= 18) score += 12;
        if (wind > 28) score -= 18;
        if (wave <= 1.2) score += 10;
        if (wave > 2) score -= 14;
        if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) score -= 18;

        return { time, wind, wave, score };
    });

    return windows
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .sort((a, b) => new Date(a.time) - new Date(b.time));
}

function calculateDailyFishingScore(dataset, index) {
    const weatherCode = dataset.forecast.daily?.weather_code?.[index] ?? 0;
    const tempMax = dataset.forecast.daily?.temperature_2m_max?.[index] ?? 28;
    const tempMin = dataset.forecast.daily?.temperature_2m_min?.[index] ?? 22;
    const waveMax = dataset.marine.daily?.wave_height_max?.[index] ?? 1.2;

    let score = 58;

    if ([0, 1, 2, 3].includes(weatherCode)) score += 14;
    if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode)) score -= 18;
    if (tempMax >= 22 && tempMax <= 31) score += 8;
    if (tempMin < 15 || tempMax > 36) score -= 8;
    if (waveMax <= 1.1) score += 12;
    else if (waveMax <= 1.8) score += 5;
    else score -= 14;

    return clamp(Math.round(score), 0, 100);
}

function generateAlerts(dataset, settings) {
    const current = dataset.forecast.current || {};
    const marineCurrent = dataset.marine.current || {};
    const alerts = [];
    const score = calculateFishingScore(dataset);

    if ((current.wind_speed_10m ?? 0) >= settings.windAlertThreshold) {
        alerts.push({
            level: "danger",
            title: "تحذير رياح قوية",
            text: `سرعة الرياح الحالية ${formatNumber(current.wind_speed_10m, 0)} كم/س وتتجاوز حد التنبيه المحدد.`
        });
    }

    if ((marineCurrent.wave_height ?? 0) >= settings.waveAlertThreshold) {
        alerts.push({
            level: "warning",
            title: "تنبيه موج مرتفع",
            text: `ارتفاع الموج الحالي ${formatNumber(marineCurrent.wave_height, 1)} م وقد يحتاج إلى تأجيل أو حذر إضافي.`
        });
    }

    if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(current.weather_code)) {
        alerts.push({
            level: "danger",
            title: "اضطراب جوي",
            text: `الحالة الحالية ${getWeatherLabel(current.weather_code)}، تابع التحديثات قبل الخروج.`
        });
    }

    if (score.score >= 75) {
        alerts.push({
            level: "safe",
            title: "جاهزية جيدة",
            text: "الوضع الحالي مناسب نسبيًا للعرض والخروج مع الالتزام بإجراءات السلامة."
        });
    }

    if (!alerts.length) {
        alerts.push({
            level: "safe",
            title: "لا توجد تحذيرات عالية الآن",
            text: "البيانات الحالية مستقرة نسبيًا، ومع ذلك يبقى القرار النهائي حسب الموقع الفعلي والاحتياطات."
        });
    }

    return alerts.slice(0, 4);
}

function renderReasons(reasons) {
    elements.reasonsList.innerHTML = "";
    reasons.forEach((reason) => {
        const item = document.createElement("li");
        item.textContent = reason;
        elements.reasonsList.appendChild(item);
    });
}

function renderAlerts(alerts) {
    elements.alertsList.innerHTML = "";

    alerts.forEach((alert) => {
        const card = document.createElement("article");
        card.className = `alert-card is-${alert.level}`;

        const title = document.createElement("h4");
        title.textContent = alert.title;

        const text = document.createElement("p");
        text.textContent = alert.text;

        card.append(title, text);
        elements.alertsList.appendChild(card);
    });
}

function renderBestTimes(bestTimes) {
    elements.bestTimesList.innerHTML = "";

    bestTimes.forEach((slot) => {
        const item = document.createElement("li");
        const timeText = new Intl.DateTimeFormat("ar", {
            hour: "numeric",
            minute: "2-digit"
        }).format(new Date(slot.time));

        item.textContent = `${timeText} — رياح ${formatNumber(slot.wind, 0)} كم/س وموج ${formatNumber(slot.wave, 1)} م`;
        elements.bestTimesList.appendChild(item);
    });
}

function renderHourlyForecast(dataset) {
    if (!elements.hourlyForecastGrid) return;

    const entries = buildHourlyEntries(dataset);
    elements.hourlyForecastGrid.innerHTML = "";

    entries.forEach((entry) => {
        const card = document.createElement("article");
        card.className = "hourly-card";

        const timeEl = document.createElement("p");
        timeEl.className = "hourly-time";
        timeEl.textContent = formatTimeOnly(entry.time);

        const weatherEl = document.createElement("p");
        weatherEl.className = "hourly-desc";
        weatherEl.textContent = `${getWeatherLabel(entry.weatherCode)} • ${formatNumber(entry.temp, 0)}°م`;

        const windEl = document.createElement("p");
        windEl.className = "hourly-extra";
        windEl.textContent = `رياح ${formatNumber(entry.wind, 0)} كم/س • موج ${formatNumber(entry.wave, 1)} م`;

        const tideEl = document.createElement("p");
        tideEl.className = "hourly-extra";
        tideEl.textContent = `المد والجزر: ${entry.tide}`;

        const moonEl = document.createElement("p");
        moonEl.className = "hourly-moon";
        moonEl.textContent = `حركة القمر: ${entry.moon}`;

        const fishEl = document.createElement("p");
        fishEl.className = "hourly-fish";
        fishEl.textContent = entry.fish;

        card.append(timeEl, weatherEl, windEl, tideEl, moonEl, fishEl);
        elements.hourlyForecastGrid.appendChild(card);
    });
}

function renderForecast(dataset) {
    const daily = dataset.forecast.daily || {};
    const marineDaily = dataset.marine.daily || {};
    const days = daily.time || [];

    elements.forecastGrid.innerHTML = "";

    let bestDay = null;

    days.forEach((day, index) => {
        const score = calculateDailyFishingScore(dataset, index);
        const card = document.createElement("article");
        card.className = "forecast-card";

        const title = document.createElement("p");
        title.className = "forecast-day";
        title.textContent = `${formatDay(day)} ${index === 0 ? "• اليوم" : ""}`;

        const gregorian = document.createElement("p");
        gregorian.className = "forecast-desc";
        gregorian.textContent = formatGregorianDate(day);

        const hijri = document.createElement("p");
        hijri.className = "forecast-desc";
        hijri.textContent = formatHijriDate(day);

        const desc = document.createElement("p");
        desc.className = "forecast-desc";
        desc.textContent = getWeatherLabel(daily.weather_code?.[index]);

        const scoreText = document.createElement("p");
        scoreText.className = "forecast-score";
        scoreText.textContent = `${score}/100`;

        const temp = document.createElement("p");
        temp.className = "forecast-temp";
        temp.textContent = `${formatNumber(daily.temperature_2m_max?.[index], 0)}° / ${formatNumber(daily.temperature_2m_min?.[index], 0)}°`;

        const wave = document.createElement("p");
        wave.className = "forecast-desc";
        wave.textContent = `أقصى موج ${formatNumber(marineDaily.wave_height_max?.[index], 1)} م`;

        const sun = document.createElement("p");
        sun.className = "forecast-desc";
        sun.textContent = `شروق ${formatTimeOnly(daily.sunrise?.[index])} • غروب ${formatTimeOnly(daily.sunset?.[index])}`;

        card.append(title, gregorian, hijri, desc, scoreText, temp, wave, sun);
        elements.forecastGrid.appendChild(card);

        if (!bestDay || score > bestDay.score) {
            bestDay = { day, score, wave: marineDaily.wave_height_max?.[index], weatherCode: daily.weather_code?.[index] };
        }
    });

    if (elements.forecastSummaryText) {
        elements.forecastSummaryText.textContent = bestDay
            ? `أفضل يوم متوقع: ${formatGregorianDate(bestDay.day)} • ${formatHijriDate(bestDay.day)} • ${bestDay.score}/100 • ${getWeatherLabel(bestDay.weatherCode)} • موج ${formatNumber(bestDay.wave, 1)} م`
            : "لا توجد بيانات كافية لعرض أفضل يوم حاليًا.";
    }
}

function renderChecklist() {
    const savedState = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || "{}");
    elements.checklistGrid.innerHTML = "";

    CHECKLIST_ITEMS.forEach((entry) => {
        const label = document.createElement("label");
        label.className = "checklist-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(savedState[entry.id]);
        checkbox.addEventListener("change", () => {
            savedState[entry.id] = checkbox.checked;
            localStorage.setItem(CHECKLIST_KEY, JSON.stringify(savedState));
        });

        const text = document.createElement("span");
        text.textContent = entry.label;

        label.append(checkbox, text);
        elements.checklistGrid.appendChild(label);
    });
}

function updateSavedSpotText() {
    const favorite = JSON.parse(localStorage.getItem(FAVORITE_KEY) || "null");
    elements.savedSpotText.textContent = favorite
        ? `الموقع المفضل: ${favorite.name}`
        : "لم يتم حفظ موقع مفضل بعد.";
}

function renderMap(location, marineCurrent = {}) {
    if (!location) return;

    const lat = Number(location.latitude);
    const lon = Number(location.longitude);
    const latOffset = 0.2;
    const lonOffset = 0.2;
    const bbox = [lon - lonOffset, lat - latOffset, lon + lonOffset, lat + latOffset]
        .map((value) => value.toFixed(4))
        .join("%2C");

    elements.mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(4)}%2C${lon.toFixed(4)}`;
    elements.openMapLink.href = `https://www.openstreetmap.org/?mlat=${lat.toFixed(4)}&mlon=${lon.toFixed(4)}#map=9/${lat.toFixed(4)}/${lon.toFixed(4)}`;
    elements.coordsText.textContent = `الإحداثيات: ${formatNumber(lat, 2)} ، ${formatNumber(lon, 2)}`;
    elements.marineStateText.textContent = `${getMarineState(marineCurrent)} • اتجاه الموج ${degreesToDirection(marineCurrent.wind_wave_direction)}`;
}

function renderDashboard(dataset) {
    const current = dataset.forecast.current || {};
    const daily = dataset.forecast.daily || {};
    const marineCurrent = dataset.marine.current || {};
    const score = calculateFishingScore(dataset);
    const bestTimes = buildBestTimes(dataset);
    const settings = getSettings();
    const referenceDate = current.time || daily.time?.[0] || new Date().toISOString();

    appState.location = dataset.location;
    appState.dataset = dataset;

    // إخفاء مؤشر الصيد إذا لم تكن المدينة ساحلية
    const isCoastal = dataset.isCoastal ?? true;
    if (elements.scorePanel) {
        elements.scorePanel.style.display = isCoastal ? "block" : "none";
    }

    elements.locationName.textContent = `${dataset.location.name} (${formatNumber(dataset.location.latitude, 2)}, ${formatNumber(dataset.location.longitude, 2)})`;
    updateLiveDateTime(referenceDate);
    elements.tempValue.textContent = `${formatNumber(current.temperature_2m, 1)}°م`;
    elements.windValue.textContent = `${formatNumber(current.wind_speed_10m, 0)} كم/س`;
    elements.windDirValue.textContent = `${degreesToDirection(current.wind_direction_10m)} · ${formatNumber(current.wind_direction_10m, 0)}°`;
    elements.waveValue.textContent = `${formatNumber(marineCurrent.wave_height, 1)} م`;
    elements.seaValue.textContent = `${formatNumber(marineCurrent.sea_surface_temperature, 1)}°م`;
    elements.wavePeriodValue.textContent = `${formatNumber(marineCurrent.wind_wave_period ?? marineCurrent.swell_wave_period, 1)} ث`;
    elements.sunriseValue.textContent = formatTimeOnly(daily.sunrise?.[0]);
    elements.sunsetValue.textContent = formatTimeOnly(daily.sunset?.[0]);
    elements.tideValue.textContent = estimateTideState(referenceDate);

    elements.scoreRing.style.setProperty("--score", score.score);
    elements.scoreValue.textContent = score.score;
    elements.scoreLabel.textContent = `المؤشر اليوم: ${score.label}`;
    elements.scoreSummary.textContent = score.score >= 65
        ? "الظروف الحالية مناسبة نسبيًا للانطلاق مع متابعة السلامة وتحديثات البحر."
        : "الأفضل تقليل المخاطرة أو اختيار وقت أكثر هدوءًا خلال اليوم.";

    renderReasons(score.reasons);
    renderAlerts(generateAlerts(dataset, settings));
    renderBestTimes(bestTimes);
    renderHourlyForecast(dataset);
    renderForecast(dataset);
    renderMap(dataset.location, marineCurrent);
}

function buildDemoDataset(name = "الوضع التجريبي") {
    const now = new Date();
    const hourlyTimes = Array.from({ length: 24 }, (_, index) => {
        const d = new Date(now);
        d.setHours(now.getHours() + index, 0, 0, 0);
        return d.toISOString();
    });

    const dailyTimes = Array.from({ length: 5 }, (_, index) => {
        const d = new Date(now);
        d.setDate(now.getDate() + index);
        d.setHours(12, 0, 0, 0);
        return d.toISOString();
    });

    return {
        location: { name, latitude: 21.54, longitude: 39.17 },
        forecast: {
            current: {
                time: now.toISOString(),
                temperature_2m: 27,
                relative_humidity_2m: 62,
                weather_code: 1,
                wind_speed_10m: 16,
                wind_direction_10m: 310
            },
            hourly: {
                time: hourlyTimes,
                temperature_2m: hourlyTimes.map((_, i) => 25 + Math.sin(i / 3) * 3),
                weather_code: hourlyTimes.map((_, i) => (i > 16 ? 1 : 0)),
                wind_speed_10m: hourlyTimes.map((_, i) => 12 + (i % 6)),
                wind_direction_10m: hourlyTimes.map((_, i) => 280 + (i % 5) * 8)
            },
            daily: {
                time: dailyTimes,
                weather_code: [1, 0, 2, 3, 1],
                temperature_2m_max: [29, 30, 28, 27, 29],
                temperature_2m_min: [23, 22, 22, 21, 23],
                sunrise: dailyTimes.map((day) => {
                    const d = new Date(day);
                    d.setHours(5, 42, 0, 0);
                    return d.toISOString();
                }),
                sunset: dailyTimes.map((day) => {
                    const d = new Date(day);
                    d.setHours(18, 22, 0, 0);
                    return d.toISOString();
                })
            }
        },
        marine: {
            current: {
                wave_height: 0.9,
                sea_surface_temperature: 28,
                wind_wave_height: 0.6,
                wind_wave_direction: 300,
                wind_wave_period: 4.2,
                swell_wave_height: 0.7,
                swell_wave_direction: 290,
                swell_wave_period: 6.3
            },
            hourly: {
                time: hourlyTimes,
                wave_height: hourlyTimes.map((_, i) => 0.7 + (i % 5) * 0.12),
                sea_surface_temperature: hourlyTimes.map(() => 28),
                wind_wave_period: hourlyTimes.map((_, i) => 4 + (i % 3) * 0.4),
                wind_wave_direction: hourlyTimes.map((_, i) => 285 + (i % 4) * 6)
            }
        },
        isCoastal: true
    };
}

async function loadByQuery(query) {
    setStatus("جاري البحث عن الموقع وتحميل البيانات...", "info");

    try {
        const location = await geocodeLocation(query);
        const dataset = await fetchLocationDataset(location);
        elements.cityInput.value = query;
        renderDashboard(dataset);
        saveCachedSnapshot(dataset);
        finalizeDashboardStatus(dataset, "تم تحديث البيانات بنجاح.");
    } catch (error) {
        if (restoreCachedSnapshot()) {
            return;
        }
        throw error;
    }
}

async function useMyLocation() {
    if (!navigator.geolocation) {
        setStatus("المتصفح لا يدعم تحديد الموقع.", "warning");
        return;
    }

    setStatus("جاري تحديد موقعك الحالي...", "info");

    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const location = {
                name: "موقعي الحالي",
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            const dataset = await fetchLocationDataset(location);
            renderDashboard(dataset);
            saveCachedSnapshot(dataset);
            finalizeDashboardStatus(dataset, "تم تحميل بيانات موقعك الحالي.");
        } catch (error) {
            if (!restoreCachedSnapshot()) {
                setStatus(error.message || "تعذر تحميل بيانات الموقع الحالي.", "error");
            }
        }
    }, () => {
        if (!restoreCachedSnapshot()) {
            setStatus("تعذر الوصول إلى موقعك. تحقق من الصلاحيات.", "warning");
        }
    }, {
        enableHighAccuracy: true,
        timeout: 10000
    });
}

function saveCurrentSpot() {
    if (!appState.location) {
        setStatus("لا يوجد موقع حالي لحفظه بعد.", "warning");
        return;
    }

    localStorage.setItem(FAVORITE_KEY, JSON.stringify(appState.location));
    updateSavedSpotText();
    setStatus("تم حفظ الموقع المفضل بنجاح.", "success");
}

async function shareApp() {
    const shareData = {
        title: "رادار الحوات",
        text: appState.location ? `تابع حالة الصيد في ${appState.location.name}` : "تابع حالة الصيد والبحر",
        url: window.location.href
    };

    if (navigator.share) {
        await navigator.share(shareData);
        return;
    }

    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        setStatus("تم نسخ رابط التطبيق إلى الحافظة.", "success");
        return;
    }

    window.prompt("انسخ الرابط التالي:", shareData.url);
}

function saveSettings(event) {
    event.preventDefault();

    const updatedSettings = {
        defaultCity: elements.defaultCityInput.value.trim() || DEFAULT_SETTINGS.defaultCity,
        windAlertThreshold: clamp(Number(elements.windThresholdInput.value) || DEFAULT_SETTINGS.windAlertThreshold, 10, 80),
        waveAlertThreshold: clamp(Number(elements.waveThresholdInput.value) || DEFAULT_SETTINGS.waveAlertThreshold, 0.5, 5)
    };

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    populateSettingsForm();

    if (appState.dataset) {
        renderAlerts(generateAlerts(appState.dataset, updatedSettings));
    }

    setStatus("تم حفظ الإعدادات بنجاح.", "success");
}

function resetSettings() {
    localStorage.removeItem(SETTINGS_KEY);
    populateSettingsForm();

    if (appState.dataset) {
        renderAlerts(generateAlerts(appState.dataset, getSettings()));
    }

    setStatus("تمت إعادة الإعدادات الافتراضية.", "success");
}

function setupPwa() {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("service-worker.js?v=7").catch(() => {
                setStatus("التطبيق يعمل، لكن تعذر تفعيل التخزين المؤقت حاليًا.", "warning");
            });
        });
    }

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        appState.deferredPrompt = event;
        elements.installBtn.hidden = false;
    });

    window.addEventListener("appinstalled", () => {
        elements.installBtn.hidden = true;
        setStatus("تم تثبيت التطبيق على جهازك بنجاح.", "success");
    });
}

function attachEvents() {
    elements.searchForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const query = elements.cityInput.value.trim();

        if (!query) {
            setStatus("اكتب اسم مدينة أو منطقة ساحلية أولًا.", "warning");
            return;
        }

        try {
            await loadByQuery(query);
        } catch (error) {
            setStatus(error.message || "تعذر تحديث البيانات الحية.", "error");
        }
    });

    elements.locateBtn.addEventListener("click", useMyLocation);
    elements.demoBtn.addEventListener("click", () => {
        renderDashboard(buildDemoDataset());
        setStatus("تم تشغيل الوضع التجريبي المحلي.", "success");
    });

    elements.saveSpotBtn.addEventListener("click", saveCurrentSpot);
    elements.shareBtn.addEventListener("click", () => {
        shareApp().catch(() => setStatus("تعذر مشاركة الرابط حاليًا.", "warning"));
    });

    elements.settingsForm.addEventListener("submit", saveSettings);
    elements.resetSettingsBtn.addEventListener("click", resetSettings);

    elements.forecastPrevBtn?.addEventListener("click", () => {
        elements.forecastScrollWrap?.scrollBy({ left: -240, behavior: "smooth" });
    });

    elements.forecastNextBtn?.addEventListener("click", () => {
        elements.forecastScrollWrap?.scrollBy({ left: 240, behavior: "smooth" });
    });

    elements.installBtn.addEventListener("click", async () => {
        if (!appState.deferredPrompt) {
            setStatus("يمكنك تثبيت التطبيق من قائمة المتصفح إذا لم يظهر الزر تلقائيًا.", "warning");
            return;
        }

        appState.deferredPrompt.prompt();
        await appState.deferredPrompt.userChoice;
        appState.deferredPrompt = null;
        elements.installBtn.hidden = true;
    });

    window.addEventListener("offline", () => setStatus("أنت الآن دون اتصال. ستبقى الواجهة الأساسية متاحة.", "warning"));
    window.addEventListener("online", () => setStatus("عاد الاتصال بالإنترنت ويمكن تحديث البيانات الآن.", "success"));
}

async function bootstrap() {
    renderChecklist();
    updateSavedSpotText();
    populateSettingsForm();
    syncPanelWidths();
    updateLiveDateTime();
    window.setInterval(() => updateLiveDateTime(appState.dataset?.forecast?.current?.time), 1000);
    window.addEventListener("resize", syncPanelWidths);
    attachEvents();
    setupPwa();

    const favorite = JSON.parse(localStorage.getItem(FAVORITE_KEY) || "null");
    const settings = getSettings();

    if (!navigator.onLine && restoreCachedSnapshot()) {
        return;
    }

    try {
        if (favorite?.latitude && favorite?.longitude) {
            const dataset = await fetchLocationDataset(favorite);
            renderDashboard(dataset);
            saveCachedSnapshot(dataset);
            finalizeDashboardStatus(dataset, "تم تحميل موقعك المفضل تلقائيًا.");
        } else {
            await loadByQuery(settings.defaultCity);
        }
    } catch (error) {
        if (!restoreCachedSnapshot()) {
            renderDashboard(buildDemoDataset());
            setStatus("تعذر جلب البيانات الحية، تم تشغيل الوضع التجريبي المحلي.", "warning");
        }
    }
}

bootstrap();
