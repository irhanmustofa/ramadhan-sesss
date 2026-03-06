// utils/googleAuth.js (atau lokasi file Anda)

let initialized = false

export function initGoogleLogin(onLoginSuccess) {
    if (initialized) return

    /* global google */
    if (!window.google) {
        console.error("Google SDK belum dimuat!");
        return;
    }

    google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => {
            try {
                const payload = JSON.parse(
                    atob(response.credential.split(".")[1])
                )

                const user = {
                    uid: payload.sub,
                    name: payload.name,
                    email: payload.email,
                    photo: payload.picture,
                }

                localStorage.setItem("auth", JSON.stringify(user))

                // Panggil callback success dari React
                if (onLoginSuccess) onLoginSuccess(user)
            } catch (error) {
                console.error("Gagal parse credential:", error)
            }
        },
        // Mencegah popup otomatis saat load
        auto_select: false,
        // Mencegah One Tap UI muncul otomatis
        auto_prompt: false,
    })

    initialized = true
}

// Fungsi manual untuk trigger login saat tombol diklik
export function triggerGoogleLogin() {
    if (window.google) {
        // Ini akan memunculkan popup Google HANYA saat dipanggil
        google.accounts.id.prompt()
    } else {
        console.error("Google SDK tidak tersedia")
    }
}