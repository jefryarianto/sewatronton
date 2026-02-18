// ===== INISIALISASI PETA =====
// Koordinat Larantuka, Flores Timur
const LARANTUKA_COORDS = [-8.2718, 122.9643];

// Inisialisasi peta dengan zoom lebih detail
let map = L.map('map', {
    center: LARANTUKA_COORDS,
    zoom: 13,
    zoomControl: true,
    fadeAnimation: true,
    zoomAnimation: true,
    markerZoomAnimation: true
});

// ===== LAYER PETA YANG LEBIH DETAIL =====

// 1. ESRI World Imagery (Citra Satelit) - Paling Detail
const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 22,
    maxNativeZoom: 19
});

// 2. ESRI World Topo Map (Peta Topografi Detail)
const esriTopo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    maxZoom: 22,
    maxNativeZoom: 18
});

// 3. ESRI World Street Map (Jalan Raya Detail)
const esriStreet = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
    maxZoom: 22,
    maxNativeZoom: 18
});

// 4. OpenStreetMap Humanitarian (Paling Detail untuk Jalan di Indonesia)
const osmHumanitarian = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
    subdomains: 'abc',
    maxZoom: 20,
    maxNativeZoom: 19
});

// 5. OpenStreetMap Default (Alternatif)
const osmDefault = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
    maxNativeZoom: 19
});

// 6. OpenTopoMap (Peta Topografi)
const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 18,
    maxNativeZoom: 17
});

// 7. Stamen Terrain (Peta Medan)
const stamenTerrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    maxZoom: 18,
    minZoom: 0,
    ext: 'png'
});

// 8. CartoDB Voyager (Peta Bersih dan Detail)
const cartoDB = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    maxNativeZoom: 19
});

// ===== DEFAULT LAYER =====
// Menggunakan OSM Humanitarian sebagai default (paling detail untuk Indonesia)
osmHumanitarian.addTo(map);

// ===== CONTROL LAYER =====
const baseLayers = {
    "🌍 OSM Humanitarian (Paling Detail)": osmHumanitarian,
    "🗺️ OSM Default": osmDefault,
    "🛰️ ESRI Satelit": esriSatellite,
    "🏔️ ESRI Topografi": esriTopo,
    "🛣️ ESRI Street Map": esriStreet,
    "⛰️ OpenTopoMap": openTopoMap,
    "🌲 Stamen Terrain": stamenTerrain,
    "🗺️ CartoDB Voyager": cartoDB
};

// Tambahkan control layer ke peta
L.control.layers(baseLayers, null, {
    position: 'topright',
    collapsed: false
}).addTo(map);

// ===== VARIABEL GLOBAL =====
let startPoint = null;
let endPoint = null;
let routingControl = null;
let currentMarkerMode = null;

// Marker untuk start dan end
let startMarker = null;
let endMarker = null;

// ===== KONSTANTA HARGA =====
const TRONTON_RATES = {
    // Jarak dan Biaya - MINIMUM CHARGE 15KM
    MINIMUM_DISTANCE: 15,        // Minimum charge 15 km
    RATE_PER_KM: 250000,         // per km untuk 15 km pertama
    MINIMUM_CHARGE_RATE: 200000, // per km untuk kelebihan dari 15 km
    
    // Konsumsi Solar (dalam liter) untuk 1 TRIP
    SOLAR_TANPA_MUATAN: 5,       // 1 liter untuk 5 km (pergi)
    SOLAR_DENGAN_MUATAN: 1.5,    // 1 liter untuk 1.5 km (pulang)
    HARGA_SOLAR_PER_LITER: 15000, // HARGA SOLAR: Rp 15.000 per liter
    
    // Biaya Tetap
    PENGAMANAN: 250000,          // per trip
    SOPIR: 300000               // per trip
};

// ===== DAFTAR LOKASI DI FLORES TIMUR =====
const LOKASI_FLORES = [
    { name: "Larantuka", lat: -8.2718, lng: 122.9643 },
    { name: "Waiwerang", lat: -8.3548, lng: 122.9768 },
    { name: "Wolo", lat: -8.2137, lng: 122.9342 },
    { name: "Lewoleba", lat: -8.2893, lng: 122.9882 },
    { name: "Ile Boleng", lat: -8.3522, lng: 123.0164 },
    { name: "Adonara", lat: -8.3167, lng: 123.0833 },
    { name: "Solor", lat: -8.4667, lng: 123.0000 },
    { name: "Lembata", lat: -8.4139, lng: 123.4556 },
    { name: "Maumere", lat: -8.6186, lng: 122.2123 },
    { name: "Ende", lat: -8.8405, lng: 121.6523 }
];

// ===== FUNGSI PERHITUNGAN =====

/**
 * Membulatkan biaya KE ATAS ke kelipatan 500.000 dengan MINIMUM Rp 500.000
 * @param {number} amount - Biaya yang akan dibulatkan
 * @returns {number} Biaya yang sudah dibulatkan ke atas (minimal Rp 500.000)
 */
function roundUpToNearest500k(amount) {
    // Pembulatan ke atas ke kelipatan 500.000
    const roundedUp = Math.ceil(amount / 500000) * 500000;
    // Minimum Rp 500.000
    return Math.max(roundedUp, 500000);
}

/**
 * Menghitung jarak yang dikenakan biaya (minimum 15km)
 * @param {number} actualDistance - Jarak sebenarnya dalam kilometer
 * @returns {number} Jarak yang dikenakan biaya
 */
function getChargeableDistance(actualDistance) {
    return Math.max(actualDistance, TRONTON_RATES.MINIMUM_DISTANCE);
}

/**
 * Menghitung biaya jarak dengan minimum charge 15km
 * @param {number} actualDistance - Jarak sebenarnya dalam kilometer
 * @returns {object} Detail biaya jarak
 */
function calculateDistanceCost(actualDistance) {
    const chargeableDistance = getChargeableDistance(actualDistance);
    let biaya15KmPertama = 0;
    let biayaKelebihan = 0;
    
    if (chargeableDistance <= TRONTON_RATES.MINIMUM_DISTANCE) {
        biaya15KmPertama = chargeableDistance * TRONTON_RATES.RATE_PER_KM;
        biayaKelebihan = 0;
    } else {
        biaya15KmPertama = TRONTON_RATES.MINIMUM_DISTANCE * TRONTON_RATES.RATE_PER_KM;
        biayaKelebihan = (chargeableDistance - TRONTON_RATES.MINIMUM_DISTANCE) * TRONTON_RATES.MINIMUM_CHARGE_RATE;
    }
    
    return {
        jarakSebenarnya: actualDistance,
        jarakDikenakanBiaya: chargeableDistance,
        jarak15KmPertama: Math.min(chargeableDistance, TRONTON_RATES.MINIMUM_DISTANCE),
        jarakKelebihan: Math.max(0, chargeableDistance - TRONTON_RATES.MINIMUM_DISTANCE),
        biaya15KmPertama: biaya15KmPertama,
        biayaKelebihan: biayaKelebihan,
        totalBiayaJarak: biaya15KmPertama + biayaKelebihan
    };
}

/**
 * Menghitung kebutuhan solar untuk perjalanan PERGI (tanpa muatan)
 * @param {number} distanceKm - Jarak sebenarnya dalam kilometer
 * @returns {number} Kebutuhan solar dalam liter untuk pergi
 */
function calculateSolarPergi(distanceKm) {
    return distanceKm / TRONTON_RATES.SOLAR_TANPA_MUATAN;
}

/**
 * Menghitung kebutuhan solar untuk perjalanan PULANG (dengan muatan)
 * @param {number} distanceKm - Jarak sebenarnya dalam kilometer
 * @returns {number} Kebutuhan solar dalam liter untuk pulang
 */
function calculateSolarPulang(distanceKm) {
    return distanceKm / TRONTON_RATES.SOLAR_DENGAN_MUATAN;
}

/**
 * Menghitung total kebutuhan solar untuk 1 TRIP (pergi + pulang)
 * @param {number} distanceKm - Jarak sebenarnya dalam kilometer
 * @returns {object} Detail kebutuhan solar
 */
function calculateSolarConsumption(distanceKm) {
    const solarPergi = calculateSolarPergi(distanceKm);
    const solarPulang = calculateSolarPulang(distanceKm);
    const totalSolar = solarPergi + solarPulang;
    
    // Hitung biaya sebelum pembulatan dengan HARGA SOLAR Rp 15.000
    const biayaPergiSebelum = solarPergi * TRONTON_RATES.HARGA_SOLAR_PER_LITER;
    const biayaPulangSebelum = solarPulang * TRONTON_RATES.HARGA_SOLAR_PER_LITER;
    const totalBiayaSebelum = totalSolar * TRONTON_RATES.HARGA_SOLAR_PER_LITER;
    
    // TERAPKAN PEMBULATAN KE ATAS ke 500.000 terdekat dengan MINIMUM Rp 500.000
    const biayaPergi = roundUpToNearest500k(biayaPergiSebelum);
    const biayaPulang = roundUpToNearest500k(biayaPulangSebelum);
    const totalBiaya = roundUpToNearest500k(totalBiayaSebelum);
    
    // Cek apakah terkena minimum Rp 500.000
    const isMinimumPergi = biayaPergiSebelum < 500000 && biayaPergi === 500000;
    const isMinimumPulang = biayaPulangSebelum < 500000 && biayaPulang === 500000;
    const isMinimumTotal = totalBiayaSebelum < 500000 && totalBiaya === 500000;
    
    return {
        pergi: solarPergi,
        pulang: solarPulang,
        total: totalSolar,
        biayaPergiSebelum: biayaPergiSebelum,
        biayaPulangSebelum: biayaPulangSebelum,
        totalBiayaSebelum: totalBiayaSebelum,
        biayaPergi: biayaPergi,
        biayaPulang: biayaPulang,
        totalBiaya: totalBiaya,
        pembulatanPergi: biayaPergi - biayaPergiSebelum,
        pembulatanPulang: biayaPulang - biayaPulangSebelum,
        totalPembulatan: totalBiaya - totalBiayaSebelum,
        isMinimumPergi: isMinimumPergi,
        isMinimumPulang: isMinimumPulang,
        isMinimumTotal: isMinimumTotal
    };
}

/**
 * Menghitung total biaya sewa tronton untuk 1 TRIP
 * @param {number} actualDistance - Jarak sebenarnya dalam kilometer
 * @returns {object} Detail biaya
 */
function calculateTrontonCost(actualDistance) {
    const distanceCost = calculateDistanceCost(actualDistance);
    const solarDetails = calculateSolarConsumption(actualDistance);
    
    return {
        // Jarak
        jarakSebenarnya: actualDistance,
        jarakDikenakanBiaya: distanceCost.jarakDikenakanBiaya,
        jarak15KmPertama: distanceCost.jarak15KmPertama,
        jarakKelebihan: distanceCost.jarakKelebihan,
        biaya15KmPertama: distanceCost.biaya15KmPertama,
        biayaKelebihan: distanceCost.biayaKelebihan,
        totalBiayaJarak: distanceCost.totalBiayaJarak,
        
        // Detail solar - dengan informasi pembulatan
        solarPergi: solarDetails.pergi,
        solarPulang: solarDetails.pulang,
        totalSolar: solarDetails.total,
        biayaSolarPergiSebelum: solarDetails.biayaPergiSebelum,
        biayaSolarPulangSebelum: solarDetails.biayaPulangSebelum,
        totalBiayaSolarSebelum: solarDetails.totalBiayaSebelum,
        biayaSolarPergi: solarDetails.biayaPergi,
        biayaSolarPulang: solarDetails.biayaPulang,
        totalBiayaSolar: solarDetails.totalBiaya,
        pembulatanPergi: solarDetails.pembulatanPergi,
        pembulatanPulang: solarDetails.pembulatanPulang,
        totalPembulatan: solarDetails.totalPembulatan,
        isMinimumPergi: solarDetails.isMinimumPergi,
        isMinimumPulang: solarDetails.isMinimumPulang,
        isMinimumTotal: solarDetails.isMinimumTotal,
        
        // Biaya tetap
        pengamanan: TRONTON_RATES.PENGAMANAN,
        sopir: TRONTON_RATES.SOPIR,
        
        // Total keseluruhan (menggunakan biaya solar yang sudah dibulatkan)
        total: distanceCost.totalBiayaJarak + solarDetails.totalBiaya + 
               TRONTON_RATES.PENGAMANAN + TRONTON_RATES.SOPIR
    };
}

/**
 * Format angka ke format mata uang Rupiah
 * @param {number} amount - Angka yang akan diformat
 * @returns {string} Angka dalam format Rupiah
 */
function formatCurrency(amount) {
    return 'Rp ' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Format angka desimal
 * @param {number} number - Angka yang akan diformat
 * @returns {string} Angka dalam format desimal
 */
function formatDecimal(number) {
    return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

/**
 * Menghitung estimasi waktu tempuh (1 kali jalan)
 * @param {number} distanceKm - Jarak dalam kilometer
 * @returns {string} Estimasi waktu tempuh
 */
function calculateTravelTime(distanceKm) {
    const speedKmph = 40; // Kecepatan rata-rata tronton
    const timeHours = distanceKm / speedKmph;
    const hours = Math.floor(timeHours);
    const minutes = Math.round((timeHours - hours) * 60);
    
    if (hours > 0) {
        return `${hours} jam ${minutes} menit`;
    } else {
        return `${minutes} menit`;
    }
}

/**
 * Mendapatkan nama lokasi dari koordinat
 * @param {object} latlng - Koordinat latitude dan longitude
 * @returns {string} Nama lokasi
 */
function getLokasiName(latlng) {
    const lat = latlng.lat;
    const lng = latlng.lng;
    
    // Jika koordinat sama dengan Larantuka
    if (Math.abs(lat - LARANTUKA_COORDS[0]) < 0.01 && Math.abs(lng - LARANTUKA_COORDS[1]) < 0.01) {
        return "Larantuka";
    }
    
    // Cari lokasi terdekat dari daftar
    let closestLokasi = null;
    let minDistance = Infinity;
    
    for (let lokasi of LOKASI_FLORES) {
        const distance = Math.sqrt(
            Math.pow(lat - lokasi.lat, 2) + 
            Math.pow(lng - lokasi.lng, 2)
        );
        
        if (distance < minDistance && distance < 0.05) {
            minDistance = distance;
            closestLokasi = lokasi.name;
        }
    }
    
    return closestLokasi || `Titik ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// ===== FUNGSI MARKER DAN MAP =====

/**
 * Set mode untuk mengambil titik start dari map
 */
function setStartPoint() {
    currentMarkerMode = 'start';
    showNotification('📍 Klik pada peta untuk memilih TITIK AWAL', 'info');
}

/**
 * Set mode untuk mengambil titik end dari map
 */
function setEndPoint() {
    currentMarkerMode = 'end';
    showNotification('🎯 Klik pada peta untuk memilih TITIK AKHIR', 'info');
}

// Event listener untuk klik pada peta
map.on('click', function(e) {
    if (currentMarkerMode === 'start') {
        setStartMarker(e.latlng);
        currentMarkerMode = null;
    } else if (currentMarkerMode === 'end') {
        setEndMarker(e.latlng);
        currentMarkerMode = null;
    }
});

/**
 * Set marker untuk titik start
 * @param {object} latlng - Koordinat marker
 */
function setStartMarker(latlng) {
    if (startMarker) {
        map.removeLayer(startMarker);
    }
    
    startMarker = L.marker(latlng, {
        draggable: true,
        icon: L.divIcon({
            className: 'custom-div-icon',
            html: '<div style="background-color: #4CAF50; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4);"></div>',
            iconSize: [28, 28],
            popupAnchor: [0, -14]
        })
    }).addTo(map);
    
    startMarker.bindPopup(`
        <b>📍 TITIK AWAL</b><br>
        ${getLokasiName(latlng)}<br>
        Lat: ${latlng.lat.toFixed(4)}<br>
        Lng: ${latlng.lng.toFixed(4)}
    `).openPopup();
    
    startPoint = latlng;
    
    const lokasiName = getLokasiName(latlng);
    document.getElementById('startCoords').innerHTML = 
        `<span class="coordinates-location">${lokasiName}</span>
         <span class="coordinates-numeric">${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}</span>`;
    
    startMarker.on('dragend', function(e) {
        startPoint = e.target.getLatLng();
        const lokasiDrag = getLokasiName(startPoint);
        document.getElementById('startCoords').innerHTML = 
            `<span class="coordinates-location">${lokasiDrag}</span>
             <span class="coordinates-numeric">${startPoint.lat.toFixed(4)}, ${startPoint.lng.toFixed(4)}</span>`;
        
        startMarker.bindPopup(`
            <b>📍 TITIK AWAL</b><br>
            ${lokasiDrag}<br>
            Lat: ${startPoint.lat.toFixed(4)}<br>
            Lng: ${startPoint.lng.toFixed(4)}
        `).openPopup();
        
        if (startPoint && endPoint) {
            calculateDistance();
        }
    });
}

/**
 * Set marker untuk titik akhir
 * @param {object} latlng - Koordinat marker
 */
function setEndMarker(latlng) {
    if (endMarker) {
        map.removeLayer(endMarker);
    }
    
    endMarker = L.marker(latlng, {
        draggable: true,
        icon: L.divIcon({
            className: 'custom-div-icon',
            html: '<div style="background-color: #f44336; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4);"></div>',
            iconSize: [28, 28],
            popupAnchor: [0, -14]
        })
    }).addTo(map);
    
    endMarker.bindPopup(`
        <b>🎯 TITIK AKHIR</b><br>
        ${getLokasiName(latlng)}<br>
        Lat: ${latlng.lat.toFixed(4)}<br>
        Lng: ${latlng.lng.toFixed(4)}
    `).openPopup();
    
    endPoint = latlng;
    
    const lokasiName = getLokasiName(latlng);
    document.getElementById('endCoords').innerHTML = 
        `<span class="coordinates-location">${lokasiName}</span>
         <span class="coordinates-numeric">${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}</span>`;
    
    endMarker.on('dragend', function(e) {
        endPoint = e.target.getLatLng();
        const lokasiDrag = getLokasiName(endPoint);
        document.getElementById('endCoords').innerHTML = 
            `<span class="coordinates-location">${lokasiDrag}</span>
             <span class="coordinates-numeric">${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}</span>`;
        
        endMarker.bindPopup(`
            <b>🎯 TITIK AKHIR</b><br>
            ${lokasiDrag}<br>
            Lat: ${endPoint.lat.toFixed(4)}<br>
            Lng: ${endPoint.lng.toFixed(4)}
        `).openPopup();
        
        if (startPoint && endPoint) {
            calculateDistance();
        }
    });
}

/**
 * Menampilkan tabel biaya
 * @param {number} actualDistance - Jarak sebenarnya dalam kilometer
 * @param {object} costDetails - Detail biaya
 * @param {string} lokasiAwal - Nama lokasi awal
 * @param {string} lokasiAkhir - Nama lokasi akhir
 */
function displayCostTable(actualDistance, costDetails, lokasiAwal, lokasiAkhir) {
    const namaLokasiAwal = lokasiAwal || "Larantuka";
    const namaLokasiAkhir = lokasiAkhir || "Tujuan";
    const isMinimumCharge = actualDistance < TRONTON_RATES.MINIMUM_DISTANCE;
    
    const tableHTML = `
        <div class="cost-table-container">
            <div class="cost-header">
                <h3>📋 RINCIAN BIAYA SEWA TRONTON UNTUK 1 TRIP (PERGI-PULANG)</h3>
                <div class="route-info">
                    <span class="route-badge">📍 Rute: ${namaLokasiAwal} → ${namaLokasiAkhir}</span>
                    <span class="distance-badge">📏 Jarak: ${actualDistance.toFixed(2)} km</span>
                    ${isMinimumCharge ? 
                        '<span class="minimum-badge">⚠️ MINIMUM CHARGE 15KM</span>' : 
                        '<span class="muatan-badge">🔄 1 TRIP (Pergi-Pulang)</span>'
                    }
                </div>
                ${isMinimumCharge ? 
                    `<div class="minimum-charge-info">
                        <strong>⚠️ PEMBERITAHUAN:</strong> Jarak sebenarnya ${actualDistance.toFixed(2)} km < 15 km, 
                        dikenakan MINIMUM CHARGE 15 km untuk biaya jarak!
                    </div>` : ''
                }
                <div class="rounding-info">
                    <strong>💰 INFORMASI HARGA & PEMBULATAN:</strong><br>
                    • Harga Solar: Rp 15.000 / liter<br>
                    • Biaya solar DIBULATKAN KE ATAS ke kelipatan Rp 500.000 terdekat<br>
                    • <strong>MINIMUM BIAYA SOLAR: Rp 500.000</strong> (jika hasil perhitungan kurang dari Rp 500.000)
                </div>
            </div>
            
            <table class="cost-table">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Uraian</th>
                        <th>Vol.</th>
                        <th>Sat.</th>
                        <th>Harga Satuan</th>
                        <th>Jumlah Harga</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- BIAYA JARAK -->
                    <tr class="section-header">
                        <td rowspan="3">I</td>
                        <td colspan="5"><strong>🚛 BIAYA JARAK TEMPUH ${isMinimumCharge ? '(MINIMUM CHARGE 15KM)' : ''}</strong></td>
                    </tr>
                    <tr>
                        <td>${namaLokasiAwal} - ${namaLokasiAkhir.split(' ')[0]}</td>
                        <td>${formatDecimal(costDetails.jarak15KmPertama)}</td>
                        <td>Km</td>
                        <td>${formatCurrency(TRONTON_RATES.RATE_PER_KM)}</td>
                        <td>${formatCurrency(costDetails.biaya15KmPertama)}</td>
                    </tr>
                    <tr>
                        <td>Minimum Charge (Kelebihan dari 15 Km)</td>
                        <td>${formatDecimal(costDetails.jarakKelebihan)}</td>
                        <td>Km</td>
                        <td>${formatCurrency(TRONTON_RATES.MINIMUM_CHARGE_RATE)}</td>
                        <td>${formatCurrency(costDetails.biayaKelebihan)}</td>
                    </tr>
                    
                    <!-- BIAYA SOLAR -->
                    <tr class="solar-row">
                        <td rowspan="4">II</td>
                        <td colspan="5"><strong>⛽ BAHAN BAKAR SOLAR (Rp 15.000/Liter - Min. Rp 500.000, Dibulatkan Ke Atas)</strong></td>
                    </tr>
                    <tr class="solar-row">
                        <td>Pergi (Tanpa Muatan) - 1/5 × Jarak</td>
                        <td>${formatDecimal(costDetails.solarPergi)}</td>
                        <td>Liter</td>
                        <td>${formatCurrency(TRONTON_RATES.HARGA_SOLAR_PER_LITER)}</td>
                        <td>
                            ${formatCurrency(costDetails.biayaSolarPergi)}
                            ${costDetails.isMinimumPergi ? 
                                `<br><small class="minimum-tag">MINIMUM Rp 500.000</small>` : 
                                (costDetails.pembulatanPergi > 0 ? 
                                `<br><small>(dibulatkan ke atas dari ${formatCurrency(costDetails.biayaSolarPergiSebelum)})</small>` : '')
                            }
                        </td>
                    </tr>
                    <tr class="solar-row">
                        <td>Pulang (Dengan Muatan) - 1/1.5 × Jarak</td>
                        <td>${formatDecimal(costDetails.solarPulang)}</td>
                        <td>Liter</td>
                        <td>${formatCurrency(TRONTON_RATES.HARGA_SOLAR_PER_LITER)}</td>
                        <td>
                            ${formatCurrency(costDetails.biayaSolarPulang)}
                            ${costDetails.isMinimumPulang ? 
                                `<br><small class="minimum-tag">MINIMUM Rp 500.000</small>` : 
                                (costDetails.pembulatanPulang > 0 ? 
                                `<br><small>(dibulatkan ke atas dari ${formatCurrency(costDetails.biayaSolarPulangSebelum)})</small>` : '')
                            }
                        </td>
                    </tr>
                    <tr class="solar-row total-row">
                        <td colspan="4"><strong>Total Biaya Solar (Dibulatkan Ke Atas)</strong></td>
                        <td>
                            <strong>${formatCurrency(costDetails.totalBiayaSolar)}</strong>
                            ${costDetails.isMinimumTotal ? 
                                `<br><small class="minimum-tag">MINIMUM Rp 500.000</small>` : 
                                (costDetails.totalPembulatan > 0 ? 
                                `<br><small>(dibulatkan ke atas dari ${formatCurrency(costDetails.totalBiayaSebelum)})</small>` : '')
                            }
                        </td>
                    </tr>
                    
                    <!-- BIAYA TETAP -->
                    <tr>
                        <td>III</td>
                        <td>👮 PENGAMANAN LALU-LINTAS</td>
                        <td>1.00</td>
                        <td>Trip</td>
                        <td>${formatCurrency(TRONTON_RATES.PENGAMANAN)}</td>
                        <td>${formatCurrency(TRONTON_RATES.PENGAMANAN)}</td>
                    </tr>
                    <tr>
                        <td>IV</td>
                        <td>👨‍✈️ SOPIR DAN PEMBANTU</td>
                        <td>1.00</td>
                        <td>Trip</td>
                        <td>${formatCurrency(TRONTON_RATES.SOPIR)}</td>
                        <td>${formatCurrency(TRONTON_RATES.SOPIR)}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5" style="text-align: right;"><strong>TOTAL BIAYA MOBILISASI (1 TRIP):</strong></td>
                        <td><strong class="total-amount">${formatCurrency(costDetails.total)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="cost-summary">
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">📏 Jarak Sebenarnya</span>
                        <span class="summary-value">${actualDistance.toFixed(2)} km</span>
                    </div>
                    <div class="summary-item ${isMinimumCharge ? 'highlight' : ''}">
                        <span class="summary-label">📏 Jarak Dikenakan Biaya</span>
                        <span class="summary-value">${formatDecimal(costDetails.jarakDikenakanBiaya)} km</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">💰 Biaya Jarak</span>
                        <span class="summary-value">${formatCurrency(costDetails.totalBiayaJarak)}</span>
                    </div>
                    <div class="summary-item solar-pergi">
                        <span class="summary-label">⛽ Solar Pergi</span>
                        <span class="summary-value">${formatDecimal(costDetails.solarPergi)} L</span>
                    </div>
                    <div class="summary-item solar-pulang">
                        <span class="summary-label">⛽ Solar Pulang</span>
                        <span class="summary-value">${formatDecimal(costDetails.solarPulang)} L</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">⛽ Total Solar</span>
                        <span class="summary-value">${formatDecimal(costDetails.totalSolar)} L</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">💰 Biaya Solar (Sebelum)</span>
                        <span class="summary-value">${formatCurrency(costDetails.totalBiayaSebelum)}</span>
                    </div>
                    <div class="summary-item highlight">
                        <span class="summary-label">💰 Biaya Solar (Dibulatkan)</span>
                        <span class="summary-value">${formatCurrency(costDetails.totalBiayaSolar)}</span>
                        ${costDetails.isMinimumTotal ? 
                            `<span class="minimum-badge-small">MIN Rp 500rb</span>` : 
                            (costDetails.totalPembulatan > 0 ? 
                            `<span class="round-up-badge">⬆️ +${formatCurrency(costDetails.totalPembulatan)}</span>` : '')
                        }
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">📋 Biaya Tetap</span>
                        <span class="summary-value">${formatCurrency(TRONTON_RATES.PENGAMANAN + TRONTON_RATES.SOPIR)}</span>
                    </div>
                    <div class="summary-item highlight">
                        <span class="summary-label">💰 TOTAL BIAYA 1 TRIP</span>
                        <span class="summary-value">${formatCurrency(costDetails.total)}</span>
                    </div>
                </div>
                
                <div class="fuel-info">
                    <span class="fuel-icon">⛽</span>
                    <span class="fuel-text">
                        <strong>Rincian Biaya Solar (Rp 15.000/Liter - Dibulatkan KE ATAS ke Rp 500rb):</strong><br>
                        • Pergi: ${formatDecimal(costDetails.solarPergi)} L × Rp 15.000 = ${formatCurrency(costDetails.biayaSolarPergiSebelum)}<br>
                        • Dibulatkan KE ATAS menjadi: ${formatCurrency(costDetails.biayaSolarPergi)} ${costDetails.isMinimumPergi ? '(MINIMUM)' : ''}<br>
                        • Pulang: ${formatDecimal(costDetails.solarPulang)} L × Rp 15.000 = ${formatCurrency(costDetails.biayaSolarPulangSebelum)}<br>
                        • Dibulatkan KE ATAS menjadi: ${formatCurrency(costDetails.biayaSolarPulang)} ${costDetails.isMinimumPulang ? '(MINIMUM)' : ''}<br>
                        <strong>• Total Solar: ${formatCurrency(costDetails.totalBiayaSolar)} ${costDetails.isMinimumTotal ? '(MINIMUM Rp 500.000)' : ''}</strong>
                    </span>
                </div>
                
                <div class="rounding-explanation">
                    <span class="rounding-icon">⬆️</span>
                    <span class="rounding-text">
                        <strong>Pembulatan Ke Atas Kelipatan Rp 500.000:</strong><br>
                        • Rp 1 - Rp 500.000 → Rp 500.000 (minimum)<br>
                        • Rp 500.001 - Rp 1.000.000 → Rp 1.000.000<br>
                        • Rp 1.000.001 - Rp 1.500.000 → Rp 1.500.000<br>
                        • Rp 1.500.001 - Rp 2.000.000 → Rp 2.000.000<br>
                        • dan seterusnya...
                    </span>
                </div>
                
                <div class="minimum-charge-footer ${isMinimumCharge ? '' : 'hidden'}">
                    <span class="minimum-icon">⚠️</span>
                    <span class="minimum-text">
                        <strong>MINIMUM CHARGE 15KM:</strong> Jarak ${actualDistance.toFixed(2)} km dihitung 15 km
                    </span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('costTable').innerHTML = tableHTML;
}

/**
 * Menghitung jarak dan biaya untuk 1 TRIP (pergi-pulang)
 */
function calculateDistance() {
    if (!startPoint && !startMarker) {
        setStartMarker({ lat: LARANTUKA_COORDS[0], lng: LARANTUKA_COORDS[1] });
    }
    
    if (!endPoint && !endMarker) {
        showNotification('❌ Pilih titik akhir terlebih dahulu!', 'error');
        return;
    }
    
    if (!startPoint || !endPoint) {
        showNotification('❌ Pilih kedua titik terlebih dahulu!', 'error');
        return;
    }
    
    // Hapus routing control yang lama
    if (routingControl) {
        map.removeControl(routingControl);
    }
    
    // Buat routing control baru dengan opsi lebih detail
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(startPoint.lat, startPoint.lng),
            L.latLng(endPoint.lat, endPoint.lng)
        ],
        routeWhileDragging: true,
        showAlternatives: true,
        fitSelectedRoutes: true,
        show: false,
        lineOptions: {
            styles: [
                {color: '#2196F3', weight: 8, opacity: 0.8},
                {color: '#ffffff', weight: 4, opacity: 0.3}
            ]
        },
        altLineOptions: {
            styles: [
                {color: '#666', weight: 6, opacity: 0.5},
                {color: '#ffffff', weight: 3, opacity: 0.2}
            ]
        },
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving',
            alternatives: true,
            steps: true
        })
    }).addTo(map);
    
    // Event listener ketika route ditemukan
    routingControl.on('routesfound', function(e) {
        const routes = e.routes;
        // Ambil route terbaik (jarak terpendek)
        const bestRoute = routes.reduce((prev, current) => {
            return (prev.summary.totalDistance < current.summary.totalDistance) ? prev : current;
        });
        
        const summary = bestRoute.summary;
        const jarakSebenarnya = summary.totalDistance / 1000;
        const costDetails = calculateTrontonCost(jarakSebenarnya);
        const namaAwal = getLokasiName(startPoint);
        const namaAkhir = getLokasiName(endPoint);
        
        displayCostTable(jarakSebenarnya, costDetails, namaAwal, namaAkhir);
        
        const minimumChargeMsg = jarakSebenarnya < TRONTON_RATES.MINIMUM_DISTANCE ? 
            `⚠️ MINIMUM CHARGE 15KM` : '';
        
        showNotification(
            `✅ 1 TRIP | Jarak: ${jarakSebenarnya.toFixed(2)} km | ⛽ Solar: ${formatDecimal(costDetails.totalSolar)} L | 💰 Total: ${formatCurrency(costDetails.total)} ${minimumChargeMsg}`,
            jarakSebenarnya < TRONTON_RATES.MINIMUM_DISTANCE ? 'warning' : 'success'
        );
    });
    
    // Event listener ketika routing error
    routingControl.on('routingerror', function(e) {
        showNotification('❌ Tidak dapat menghitung rute. Coba titik lain.', 'error');
    });
}

/**
 * Reset peta ke kondisi awal
 */
function resetMap() {
    // Hapus marker
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    
    // Reset variabel
    startPoint = null;
    endPoint = null;
    
    // Reset UI
    document.getElementById('startCoords').innerHTML = 
        `<span class="coordinates-location">Larantuka</span>
         <span class="coordinates-numeric">-8.2718, 122.9643</span>`;
    document.getElementById('endCoords').innerHTML = 
        `<span style="color: #999; font-style: italic;">Belum dipilih</span>`;
    
    document.getElementById('costTable').innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">🚛</div>
            <h2>Kalkulator Biaya Sewa Tronton</h2>
            <p class="welcome-subtitle">Pilih titik tujuan pada peta untuk menghitung biaya mobilisasi 1 trip (pergi-pulang)</p>
            
            <div class="info-cards">
                <div class="info-card minimum-charge-card">
                    <div class="info-card-header">
                        <span class="info-card-icon">⚠️</span>
                        <h3>Minimum Charge 15KM</h3>
                    </div>
                    <div class="info-card-body">
                        <p>• Jarak <strong>&lt; 15km</strong> → Biaya jarak dihitung <strong>15km × Rp 250.000 = Rp 3.750.000</strong></p>
                        <p>• Jarak <strong>≥ 15km</strong> → Biaya jarak dihitung sesuai jarak sebenarnya</p>
                        <p class="example">📌 Contoh: Jarak 5km → Dibayar 15km (Rp 3.750.000)</p>
                        <p class="note">⚠️ Minimum charge HANYA untuk biaya jarak, TIDAK untuk konsumsi solar</p>
                    </div>
                </div>
                
                <div class="info-card solar-card">
                    <div class="info-card-header">
                        <span class="info-card-icon">⛽</span>
                        <h3>Konsumsi Solar 1 TRIP</h3>
                    </div>
                    <div class="info-card-body">
                        <div class="solar-rumus-item">
                            <span class="solar-badge pergi">🟢 PERGI</span>
                            <span class="solar-rumus">1/5 × Jarak</span>
                            <span class="solar-desc">(1 liter / 5 km)</span>
                        </div>
                        <div class="solar-rumus-item">
                            <span class="solar-badge pulang">🔴 PULANG</span>
                            <span class="solar-rumus">1/1.5 × Jarak</span>
                            <span class="solar-desc">(1 liter / 1.5 km)</span>
                        </div>
                        <div class="solar-total">
                            <strong>TOTAL = (1/5 + 1/1.5) × Jarak = 0.867 × Jarak Liter</strong>
                        </div>
                        
                        <div class="solar-price" style="background: #ff9800; color: white; font-weight: bold; margin-top: 15px;">
                            💰 HARGA SOLAR: Rp 15.000 / liter
                        </div>
                        
                        <div style="margin-top: 15px; padding: 12px; background: #e8f5e9; border-radius: 5px; border-left: 4px solid #4CAF50;">
                            <p style="color: #2e7d32; font-weight: bold; margin-bottom: 8px; font-size: 1.1em;">💰 PEMBULATAN KE ATAS:</p>
                            <p style="color: #333; margin-bottom: 5px;">• Biaya solar DIBULATKAN KE ATAS ke kelipatan <strong>Rp 500.000</strong></p>
                            <p style="color: #333; margin-bottom: 5px;">• <strong>MINIMUM Rp 500.000</strong> (jika hasil < 500rb)</p>
                            <p style="color: #333; margin-bottom: 5px;">• Contoh: Rp 433.333 → Rp 500.000</p>
                            <p style="color: #333; margin-bottom: 5px;">• Contoh: Rp 650.000 → Rp 1.000.000</p>
                            <p style="color: #333; margin-bottom: 5px;">• Contoh: Rp 1.001.000 → Rp 1.500.000</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="quick-guide">
                <h4>📋 Cara Penggunaan:</h4>
                <ol>
                    <li>Klik tombol <strong>"Ambil dari Map"</strong> pada titik yang ingin dipilih</li>
                    <li>Klik lokasi pada peta untuk menandai titik</li>
                    <li>Marker bisa digeser untuk penyesuaian</li>
                    <li>Klik <strong>"Hitung Biaya 1 TRIP"</strong> untuk melihat perhitungan</li>
                </ol>
            </div>
        </div>
    `;
    
    // Reset view ke Larantuka dengan zoom lebih detail
    map.setView(LARANTUKA_COORDS, 13);
    showNotification('🔄 Peta telah direset ke Larantuka', 'info');
}

/**
 * Tukar posisi titik start dan end
 */
function swapPoints() {
    if (startPoint && endPoint) {
        const temp = {
            lat: startPoint.lat,
            lng: startPoint.lng
        };
        
        startPoint = {
            lat: endPoint.lat,
            lng: endPoint.lng
        };
        
        endPoint = {
            lat: temp.lat,
            lng: temp.lng
        };
        
        setStartMarker(startPoint);
        setEndMarker(endPoint);
        calculateDistance();
        showNotification('🔄 Titik berhasil ditukar', 'success');
    } else {
        showNotification('❌ Pilih kedua titik terlebih dahulu!', 'error');
    }
}

/**
 * Menampilkan notifikasi
 * @param {string} message - Pesan notifikasi
 * @param {string} type - Tipe notifikasi
 */
function showNotification(message, type) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 6000);
}

// ===== SERVICE WORKER (PWA) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('✅ ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('❌ ServiceWorker registration failed:', error);
            });
    });
}

// ===== INISIALISASI AWAL =====
setStartMarker({ lat: LARANTUKA_COORDS[0], lng: LARANTUKA_COORDS[1] });

// ===== RESPONSIVE MAP =====
// Pastikan peta menyesuaikan ukuran saat window di-resize
window.addEventListener('resize', function() {
    map.invalidateSize();
});