class StorageService {
    constructor() {
        this.dbConfig = AppConfig.CV_DB;
    }

    getJSON(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            console.warn(`Error leyendo clave "${key}" de localStorage:`, error);
            return fallback;
        }
    }

    setJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error guardando clave "${key}" en localStorage:`, error);
            return false;
        }
    }

    getSession(key) {
        try {
            return sessionStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    setSession(key, value) {
        try {
            sessionStorage.setItem(key, value);
        } catch (error) {
            console.warn('No se pudo guardar en sessionStorage:', error);
        }
    }

    openCvDatabase() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB no soportado'));
                return;
            }
            const request = indexedDB.open(this.dbConfig.NAME, this.dbConfig.VERSION);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.dbConfig.STORE)) {
                    db.createObjectStore(this.dbConfig.STORE);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveCvFile(fileData) {
        const db = await this.openCvDatabase();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.dbConfig.STORE, 'readwrite');
            const store = tx.objectStore(this.dbConfig.STORE);
            store.put(fileData, this.dbConfig.RECORD_KEY);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async getCvFile() {
        const db = await this.openCvDatabase();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.dbConfig.STORE, 'readonly');
            const store = tx.objectStore(this.dbConfig.STORE);
            const req = store.get(this.dbConfig.RECORD_KEY);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    }
}
