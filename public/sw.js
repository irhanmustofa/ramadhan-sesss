// public/sw.js

// Simpan jadwal di IndexedDB atau cache
self.addEventListener("message", (event) => {
    if (event.data.type === "SET_PRAYER_TIMES") {
        self.prayerSchedule = event.data.payload;
        schedulePrayerNotifications(self.prayerSchedule);
    }
});

function schedulePrayerNotifications(schedule) {
    if (!schedule?.jadwal) return;

    const prayers = [
        { name: "Subuh", key: "subuh" },
        { name: "Dzuhur", key: "dzuhur" },
        { name: "Ashar", key: "ashar" },
        { name: "Maghrib", key: "maghrib" },
        { name: "Isya", key: "isya" },
    ];

    prayers.forEach(({ name, key }) => {
        if (schedule.jadwal[key]) {
            scheduleNotificationInSW(name, schedule.jadwal[key]);
        }
    });
}

function scheduleNotificationInSW(prayerName, timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    const prayerTime = new Date(now);
    prayerTime.setHours(hours, minutes, 0, 0);

    if (prayerTime <= now) {
        prayerTime.setDate(prayerTime.getDate() + 1);
    }

    const delay = prayerTime.getTime() - now.getTime();

    // ⚠️ setTimeout di SW juga tidak 100% reliable (SW bisa dimatikan OS)
    // Gunakan Background Sync API jika tersedia
    if ("BackgroundSyncManager" in self.registration) {
        self.registration.sync.register(`prayer-${prayerName}`);
    } else {
        // Fallback: setTimeout (tidak reliable tapi better than nothing)
        setTimeout(() => {
            showPrayerNotificationInSW(prayerName);
            // Reschedule untuk besok
            scheduleNotificationInSW(prayerName, timeStr);
        }, delay);
    }
}

function showPrayerNotificationInSW(prayerName) {
    self.registration.showNotification(`Waktu Sholat ${prayerName}`, {
        body: `Sudah masuk waktu sholat ${prayerName}.`,
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        vibrate: [200, 100, 200, 100, 200],
        tag: `prayer-${prayerName}`,
        // ❌ TIDAK BISA mainkan audio di sini
    });
}

// Handle background sync
self.addEventListener("sync", (event) => {
    if (event.tag.startsWith("prayer-")) {
        const prayerName = event.tag.replace("prayer-", "");
        showPrayerNotificationInSW(prayerName);
    }
});