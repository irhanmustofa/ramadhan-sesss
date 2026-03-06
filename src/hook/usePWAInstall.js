// hooks/usePWAInstall.js
import { useState, useEffect, useCallback } from 'react';

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS (tidak support beforeinstallprompt)
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIOSDevice);

        // Cek apakah sudah di-install (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isHWAS = window.navigator.standalone; // iOS specific
        if (isStandalone || isHWAS) {
            setIsInstalled(true);
            console.log('✅ App already installed (standalone mode)');
            return;
        }

        // Intercept browser install prompt
        const handleBeforeInstall = (e) => {
            e.preventDefault(); // ⚠️ WAJIB: Mencegah popup default browser
            setDeferredPrompt(e);
            setIsInstallable(true);
            console.log('🎯 beforeinstallprompt captured - custom prompt ready');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // Detect jika user install via cara lain
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
            console.log('✅ App installed via other method');
        };
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const install = useCallback(async () => {
        if (!deferredPrompt) {
            console.warn('❌ No deferred prompt available');
            return false;
        }

        try {
            console.log('🚀 Triggering install prompt...');
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            console.log(`📦 Install prompt outcome: ${outcome}`);

            setDeferredPrompt(null);
            setIsInstallable(false);

            return outcome === 'accepted';
        } catch (error) {
            console.error('💥 Install error:', error);
            return false;
        }
    }, [deferredPrompt]);

    return {
        isInstallable,
        isInstalled,
        isIOS,
        install,
        debug: { deferredPrompt: !!deferredPrompt }
    };
}