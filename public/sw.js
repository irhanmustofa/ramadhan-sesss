// public/sw.js

self.addEventListener("install", (event) => {
    console.log("Service Worker installing...");
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker activated");
    event.waitUntil(clients.claim());
});

// Prayer times storage
let prayerTimes = {};

// Listen for messages from main app
self.addEventListener("message", (event) => {
    if (event.data.type === "SET_PRAYER_TIMES") {
        prayerTimes = event.data.prayerTimes;
        scheduleNotifications(prayerTimes);
    }
});

// Schedule notifications for all prayers
function scheduleNotifications(times) {
    const prayers = [
        { name: "Subuh", time: times.Fajr },
        { name: "Dzuhur", time: times.Dhuhr },
        { name: "Ashar", time: times.Asr },
        { name: "Maghrib", time: times.Maghrib },
        { name: "Isya", time: times.Isha },
    ];

    prayers.forEach((prayer) => {
        schedulePrayerNotification(prayer.name, prayer.time);
    });
}

// Schedule single prayer notification
function schedulePrayerNotification(prayerName, prayerTime) {
    const [hours, minutes] = prayerTime.split(":");
    const now = new Date();
    const prayerDate = new Date();
    prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (prayerDate < now) {
        prayerDate.setDate(prayerDate.getDate() + 1);
    }

    const delay = prayerDate.getTime() - now.getTime();

    setTimeout(() => {
        showNotification(prayerName);
        // Reschedule for next day
        schedulePrayerNotification(prayerName, prayerTime);
    }, delay);
}

// Show notification
function showNotification(prayerName) {
    self.registration.showNotification(`Waktu Sholat ${prayerName}`, {
        body: `Sudah masuk waktu sholat ${prayerName}. Segeralah melaksanakan sholat.`,
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        actions: [
            { action: "snooze", title: "Snooze 5 menit" },
            { action: "dismiss", title: "Tutup" },
        ],
        tag: `prayer-${prayerName}`,
        renotify: true,
    });
}

// Handle notification click
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "snooze") {
        // Snooze for 5 minutes
        setTimeout(() => {
            showNotification(event.notification.title.replace("Waktu Sholat ", ""));
        }, 5 * 60 * 1000);
    } else {
        // Open app
        event.waitUntil(
            clients.matchAll({ type: "window" }).then((clientList) => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return clients.openWindow("/");
            })
        );
    }
});