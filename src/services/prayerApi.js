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

        return data.data || [];

    } catch (error) {
        console.error("❌ Search city error:", error);
        return [];
    }
}

/**
 * Ambil jadwal sholat untuk kota dan tanggal tertentu
 */
export async function getPrayerTimes(cityId, date = new Date()) {
    try {
        const formattedDate = formatDateForMyQuran(date);
        // ✅ FIX: HAPUS SPASI setelah /jadwal/
        const res = await fetch(
            `https://api.myquran.com/v2/sholat/jadwal/${cityId}/${formattedDate}`
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log(`📅 Jadwal untuk ${cityId} pada ${formattedDate}:`, data)

        return data.data || null  // ✅ FIX: Return null jika tidak ada data
    } catch (error) {
        console.error("❌ Get prayer times error:", error);
        return null;
    }
}