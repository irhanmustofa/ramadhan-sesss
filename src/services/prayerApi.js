// services/prayerApi.js

/**
 * Format tanggal ke format YYYY/MM/DD untuk API MyQuran
 */
function formatDateForMyQuran(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

/**
 * Reverse geocoding: lat/lng → nama kota via Nominatim OSM
 */
export async function getCityNameFromCoords(lat, lng) {
    try {
        // ✅ FIX: HAPUS SPASI setelah lat= dan lon=
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=id`
        );

        if (!res.ok) throw new Error("Gagal menghubungi layanan peta");

        const data = await res.json();
        const address = data.address || {};

        console.log("🗺️ Reverse geocoding data:", {
            city: address.city,
            town: address.town,
            regency: address.regency,
            county: address.county,
            state: address.state
        });

        // ✅ FIX: Prioritas lokasi + fallback lengkap
        const location =
            address.regency ||  // "Kabupaten Bekasi"
            address.city ||     // "Bekasi"
            address.town ||     // "Cikarang"
            address.county ||   // "Kab. Bekasi"
            address.state ||    // Fallback: "Jawa Barat"
            null;

        if (!location) return null;

        // Bersihkan prefix agar match dengan database MyQuran
        const cleanName = location
            .replace(/^(Kabupaten |Kab\.? |Kota )/i, '')
            .replace(/\s+/g, ' ')
            .trim();

        console.log(`📍 Detected: "${location}" → cleaned: "${cleanName}"`);
        return cleanName;

    } catch (error) {
        console.error("❌ Reverse geocoding error:", error);
        return null;
    }
}

/**
 * Cari kota di MyQuran berdasarkan nama
 */
export async function searchCityInMyQuran(cityName) {
    if (!cityName) return [];

    try {
        // ✅ FIX: HAPUS SPASI setelah /cari/
        const encoded = encodeURIComponent(cityName);
        const res = await fetch(
            `https://api.myquran.com/v2/sholat/kota/cari/${encoded}`
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log(`🔍 Search "${cityName}" result:`, data);

        if (data.status === 200 && Array.isArray(data.data)) {
            return data.data; // [{ id: "1203", lokasi: "KAB. BEKASI" }, ...]
        }
        return [];

    } catch (error) {
        console.error("❌ Search city error:", error);
        return [];
    }
}

/**
 * Ambil jadwal sholat berdasarkan ID kota
 * ✅ FIX: Format response pakai UPPERCASE keys agar cocok dengan component
 */
export async function getPrayerTimesByCityId(cityId, date = new Date()) {
    const dateStr = formatDateForMyQuran(date);
    console.log(`📅 Fetching prayer times for cityId=${cityId} on ${dateStr}`);
    // ✅ FIX: HAPUS SPASI setelah /jadwal/
    const res = await fetch(
        `https://api.myquran.com/v2/sholat/jadwal/${cityId}/${dateStr}`
    );

    if (!res.ok) throw new Error(`Gagal mengambil jadwal: HTTP ${res.status}`);

    const data = await res.json();

    if (data.status !== 200) {
        throw new Error(data.message || "Data jadwal tidak ditemukan");
    }

    const jadwal = data.data.jadwal;

    // ✅ FIX: Gunakan UPPERCASE keys agar cocok dengan component PrayerTimes.jsx
    return {
        success: true,
        data: {
            Imsak: jadwal.imsak,      // ✅ Uppercase
            Fajr: jadwal.subuh,       // ✅ Uppercase (subuh → Fajr)
            Dhuhr: jadwal.dzuhur,     // ✅ Uppercase
            Asr: jadwal.ashar,        // ✅ Uppercase
            Maghrib: jadwal.maghrib,  // ✅ Uppercase
            Isha: jadwal.isya,        // ✅ Uppercase (isya → Isha)
        },
        meta: {
            kota: data.data.lokasi,
            kotaId: cityId,           // ✅ Tambahkan kotaId agar component bisa akses
            tanggal: jadwal.tanggal
        }
    };
}

/**
 * ✅ MAIN: Ambil jadwal + opsi kota untuk dropdown
 */
export async function getPrayerTimesWithCityOptions(cityName) {
    if (!cityName) throw new Error("City name required");

    const cities = await searchCityInMyQuran(cityName);
    console.log(`🔍cities`, cities);
    if (cities.length === 0) {
        throw new Error(`Kota "${cityName}" tidak ditemukan`);
    }

    // Auto-pilih index 0
    const selectedCity = cities[0];
    console.log(`✅ Auto-selected: ${selectedCity.lokasi} (ID: ${selectedCity.id})`);

    const prayerTimes = await getPrayerTimesByCityId(selectedCity.id);

    return {
        success: true,
        prayerTimes,
        cityOptions: cities,
        selectedCityId: selectedCity.id
    };
}

/**
 * ✅ MAIN FLOW: Lat/Lng dari localStorage → Jadwal
 */
export async function getPrayerTimesFromLocation() {
    try {
        const saved = localStorage.getItem("prayer_location");
        if (!saved) throw new Error("LOCATION_NOT_SAVED");

        const { latitude, longitude } = JSON.parse(saved);
        console.log(`🔍 Using coords: (${latitude}, ${longitude})`);

        const cityName = await getCityNameFromCoords(latitude, longitude);
        if (!cityName) throw new Error("CITY_NAME_NOT_FOUND");

        const cities = await searchCityInMyQuran(cityName);
        if (cities.length === 0) throw new Error("CITY_NOT_IN_MYQURAN");

        console.log(`✅ Found ${cities.length} city(ies):`, cities);

        return {
            success: true,
            cities,
            coordinates: { latitude, longitude },
            detectedCityName: cityName
        };

    } catch (error) {
        console.error("❌ getPrayerTimesFromLocation error:", error.message);
        throw error;
    }
}

/**
 * ✅ EXPORT: Ambil semua kota untuk dropdown manual
 */
export async function getAllCities() {
    try {
        // ✅ FIX: HAPUS SPASI sebelum tutup string
        const res = await fetch("https://api.myquran.com/v2/sholat/kota");
        const data = await res.json();

        if (data.status === 200 && Array.isArray(data.data)) {
            return data.data.sort((a, b) => a.lokasi.localeCompare(b.lokasi));
        }
        return [];
    } catch (error) {
        console.error("Error fetching all cities:", error);
        return [];
    }
}