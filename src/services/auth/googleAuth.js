let initialized = false

export function initGoogleLogin(buttonRef) {
    if (initialized) return

    /* global google */
    google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => {
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
            window.location.href = "/"
        },
    })

    google.accounts.id.renderButton(buttonRef, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 320,
    })

    initialized = true
}