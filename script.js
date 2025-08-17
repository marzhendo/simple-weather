// API CONFIGURATION
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const apiForecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

//SELEKSI ELEMEN DOM
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');

const weatherInfoContainer = document.querySelector('.weather-info-container');
const messageContainer = document.getElementById('message-container');
const messageText = document.getElementById('message-text');

//Elemen cuaca untuk sekarang
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherIcon = document.getElementById('weather-icon');
const weatherCondition = document.getElementById('weather-condition');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');

//Elemen perkiraan cuaca
const forecastGrid = document.querySelector('.forecast-grid');

//Fungsi menampilkan pesan
function showMessage(message) {
    weatherInfoContainer.classList.add('hidden');
    messageContainer.classList.remove('hidden');
    messageText.textContent = message;
}

//Fungsi menampilkan info cuaca
function showWeatherInfo() {
    messageContainer.classList.add('hidden');
    weatherInfoContainer.classList.remove('hidden');
}

//Event Listener
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
}

searchButton.addEventListener('click', handleSearch);

cityInput.addEventListener('keypress', (event) => {
    if (event.key == 'Enter') {
        handleSearch();
    }
});

//Fungsi untuk mengambil data
async function getWeather(city) {
    showMessage('Memuat data...');

    try {
        const [currentResponse, forecastResponse] = await Promise.all ([
            fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric&lang=id`),
            fetch(`${apiForecastUrl}?q=${city}&appid=${apiKey}&units=metric&lang=id`)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Kota tidak ditemukan');
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        updateUI(currentData, forecastData);
        showWeatherInfo();

    } catch (error) {
        showMessage(error.message);
    }
 }

 // 5. FUNGSI UNTUK MEMPERBARUI TAMPILAN (UI)
function updateUI(currentWeather, forecast) {
    // --- Menata Info Cuaca Saat Ini ---
    cityName.textContent = `${currentWeather.name}, ${currentWeather.sys.country}`;
    temperature.textContent = `${Math.round(currentWeather.main.temp)}°C`;
    weatherCondition.textContent = currentWeather.weather[0].description;
    humidity.textContent = `${currentWeather.main.humidity}%`;
    windSpeed.textContent = `${currentWeather.wind.speed} km/j`;

    // Menggunakan fungsi helper (kamus) untuk dapatkan ikon yang tepat
    weatherIcon.src = `asset/${getWeatherIcon(currentWeather.weather[0].main)}`;

    // --- Menata Perkiraan Cuaca 5 Hari ---
    forecastGrid.innerHTML = ''; // Kosongkan dulu grid perkiraan cuaca sebelumnya

    // API memberikan data per 3 jam, jadi kita perlu filter untuk dapat 1 data per hari
    const dailyForecasts = forecast.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyForecasts.slice(0, 5).forEach(item => {
        const day = new Date(item.dt * 1000).toLocaleDateString('id-ID', { weekday: 'long' });
        const temp = `${Math.round(item.main.temp)}°C`;
        const icon = `asset/${getWeatherIcon(item.weather[0].main)}`;

        // Membuat kartu HTML untuk setiap hari
        const forecastCard = `
            <div class="forecast-card">
                <p class="forecast-day">${day}</p>
                <img src="${icon}" alt="Hujan" class="forecast-icon">
                <p class="forecast-temp">${temp}</p>
            </div>
        `;
        forecastGrid.innerHTML += forecastCard; // Tambahkan kartu ke grid
    });
}

// 6. FUNGSI HELPER UNTUK MENCOCOKKAN IKON
function getWeatherIcon(weatherCondition) {
    switch (weatherCondition) {
        case 'Clear':
            return 'sun.svg';
        case 'Clouds':
            return 'cloud.svg';
        case 'Rain':
            return 'cloud-rain.svg';
        case 'Drizzle':
            return 'cloud-drizzle.svg';
        case 'Thunderstorm':
            return 'cloud-lightning.svg';
        case 'Snow':
            return 'snowflake.svg'; // Jika kamu punya ikonnya
        case 'Mist':
            return 'mist.svg'
        case 'Fog':
            return 'cloud-fog.svg'
        case 'Haze':
            return 'haze.svg'; // Atau ikon kabut jika ada
        default:
            return 'cloud.svg'; // Ikon default jika kondisi tidak dikenal
    }
}

// 7. FUNGSI UNTUK MEMUAT DATA AWAL
function loadInitialData() {
    getWeather('Purwokerto'); 
}

// Panggil fungsi ini di baris paling bawah agar dieksekusi saat halaman pertama kali dibuka
loadInitialData();