class StorageService {
    constructor() {
        this.dbConfig = AppConfig.CV_DB;
        this.supabaseConfig = AppConfig.SUPABASE;
        this.supabase = null;
        this.initSupabaseClient();
    }

    initSupabaseClient() {
        try {
            if (window.supabase && this.supabaseConfig?.URL && this.supabaseConfig?.ANON_KEY) {
                this.supabase = window.supabase.createClient(
                    this.supabaseConfig.URL,
                    this.supabaseConfig.ANON_KEY,
                    {
                        auth: {
                            persistSession: true,
                            autoRefreshToken: true,
                            detectSessionInUrl: true
                        }
                    }
                );
            }
        } catch (error) {
            console.warn('No se pudo inicializar el cliente de Supabase:', error);
        }
    }

    async signInAdmin(email, password) {
        if (!this.supabase) {
            return { ok: false, error: 'Cliente Supabase no disponible' };
        }
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email.trim(),
                password
            });
            if (error) {
                return { ok: false, error: error.message };
            }
            return { ok: true, user: data.user, session: data.session };
        } catch (err) {
            return { ok: false, error: err.message || 'Error de red al autenticar' };
        }
    }

    async signOutAdmin() {
        if (!this.supabase) return;
        try {
            await this.supabase.auth.signOut();
        } catch (error) {
            console.warn('Error cerrando sesión en Supabase:', error);
        }
    }

    async hasActiveSupabaseSession() {
        if (!this.supabase) return false;
        try {
            const { data } = await this.supabase.auth.getSession();
            return Boolean(data?.session);
        } catch {
            return false;
        }
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

    setJSON(key, value, options = { syncCloud: true }) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            if (options?.syncCloud !== false && this.supabase) {
                this.syncKeyToCloud(key, value);
            }
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

    async syncFromCloud() {
        if (!this.supabase) return false;
        let updatedAny = false;

        try {
            // 1. Sincronizar proyectos desde tabla 'proyectos'
            const { data: rowsProyectos, error: errProj } = await this.supabase
                .from(this.supabaseConfig.TABLES.PROJECTS)
                .select('*')
                .eq('activo', true)
                .order('orden', { ascending: true })
                .order('created_at', { ascending: true });

            if (!errProj && Array.isArray(rowsProyectos) && rowsProyectos.length > 0) {
                const mappedProjects = rowsProyectos.map((row) => ({
                    id: row.id,
                    name: row.titulo,
                    category: row.categoria || 'otros',
                    image: row.imagen_url || '',
                    model: row.modelo_3d_url || '',
                    embedType: row.enlace_proyecto ? 'sketchfab' : '',
                    embedUrl: row.enlace_proyecto || '',
                    description: row.descripcion || ''
                }));
                this.setJSON(AppConfig.STORAGE_KEYS.PROJECTS, mappedProjects, { syncCloud: false });
                updatedAny = true;
            }

            // 2. Sincronizar textos editables desde tabla 'textos_sitio'
            const { data: rowsTextos, error: errText } = await this.supabase
                .from(this.supabaseConfig.TABLES.TEXTS)
                .select('clave, contenido');

            if (!errText && Array.isArray(rowsTextos) && rowsTextos.length > 0) {
                const currentTexts = this.getJSON(AppConfig.STORAGE_KEYS.TEXTS, {});
                let hasPageKeys = false;
                rowsTextos.forEach((row) => {
                    if (row.clave && (row.clave.startsWith('index.') || row.clave.startsWith('about.'))) {
                        currentTexts[row.clave] = row.contenido;
                        hasPageKeys = true;
                    }
                });
                if (hasPageKeys) {
                    this.setJSON(AppConfig.STORAGE_KEYS.TEXTS, currentTexts, { syncCloud: false });
                    updatedAny = true;
                }
            }

            // 3. Sincronizar enlaces y CV desde tabla 'enlaces_sitio'
            const { data: rowsEnlaces, error: errLinks } = await this.supabase
                .from(this.supabaseConfig.TABLES.LINKS)
                .select('clave, titulo, url');

            if (!errLinks && Array.isArray(rowsEnlaces) && rowsEnlaces.length > 0) {
                const linksObj = this.getJSON(AppConfig.STORAGE_KEYS.LINKS, { ...AppConfig.DEFAULT_LINKS });
                let linksChanged = false;

                rowsEnlaces.forEach((row) => {
                    if (row.clave === 'contactBtn' || row.clave === 'emailLink' || row.clave === 'instagramLink') {
                        linksObj[row.clave] = {
                            text: row.titulo || AppConfig.DEFAULT_LINKS[row.clave]?.text || '',
                            href: row.url || AppConfig.DEFAULT_LINKS[row.clave]?.href || '#'
                        };
                        linksChanged = true;
                    } else if (row.clave === 'cv_pdf' && row.url) {
                        this.setJSON(
                            AppConfig.STORAGE_KEYS.CV_META,
                            {
                                type: 'url',
                                url: row.url,
                                fileName: row.titulo || row.url.split('/').pop() || 'Hoja_de_Vida_Steban_Gomez.pdf',
                                updatedAt: new Date().toISOString()
                            },
                            { syncCloud: false }
                        );
                        updatedAny = true;
                    }
                });

                if (linksChanged) {
                    this.setJSON(AppConfig.STORAGE_KEYS.LINKS, linksObj, { syncCloud: false });
                    updatedAny = true;
                }
            }
        } catch (error) {
            console.warn('Error sincronizando datos desde Supabase:', error);
        }

        return updatedAny;
    }

    async syncKeyToCloud(key, value) {
        if (!this.supabase) return;

        try {
            if (key === AppConfig.STORAGE_KEYS.PROJECTS && Array.isArray(value)) {
                await this.syncProjectsToCloud(value);
            } else if (key === AppConfig.STORAGE_KEYS.TEXTS && value && typeof value === 'object') {
                await this.syncTextsToCloud(value);
            } else if (key === AppConfig.STORAGE_KEYS.LINKS && value && typeof value === 'object') {
                await this.syncLinksToCloud(value);
            } else if (key === AppConfig.STORAGE_KEYS.CV_META && value && value.url) {
                await this.syncCvMetaToCloud(value);
            }
        } catch (error) {
            console.warn(`Error sincronizando "${key}" hacia Supabase:`, error);
        }
    }

    async seedProjectsIfEmpty(defaultProjects) {
        if (!this.supabase || !Array.isArray(defaultProjects) || defaultProjects.length === 0) return;
        try {
            const { data, error } = await this.supabase
                .from(this.supabaseConfig.TABLES.PROJECTS)
                .select('id')
                .limit(1);
            if (!error && Array.isArray(data) && data.length === 0) {
                await this.syncProjectsToCloud(defaultProjects);
            }
        } catch (err) {
            console.warn('Error verificando semilla inicial de proyectos:', err);
        }
    }

    async syncProjectsToCloud(projects) {
        if (!this.supabase) return;
        const table = this.supabaseConfig.TABLES.PROJECTS;

        // Reemplazar proyectos activos manteniendo el orden exacto
        const { error: delError } = await this.supabase
            .from(table)
            .delete()
            .neq('titulo', '__never_match__');

        if (delError) {
            console.warn('No se pudo actualizar tabla proyectos (verifica sesión Admin en Supabase):', delError.message);
            return;
        }

        if (projects.length === 0) return;

        const payload = projects.map((proj, index) => ({
            titulo: proj.name,
            categoria: proj.category || 'otros',
            imagen_url: proj.image || '',
            modelo_3d_url: proj.model || '',
            enlace_proyecto: proj.embedUrl || '',
            descripcion: proj.description || '',
            orden: index + 1,
            activo: true
        }));

        const { error: insError } = await this.supabase.from(table).insert(payload);
        if (insError) {
            console.warn('Error insertando proyectos en Supabase:', insError.message);
        }
    }

    async syncTextsToCloud(textsMap) {
        if (!this.supabase) return;
        const table = this.supabaseConfig.TABLES.TEXTS;
        const entries = Object.entries(textsMap);

        if (entries.length === 0) return;

        const rows = entries.map(([clave, contenido]) => ({
            clave,
            contenido: String(contenido ?? ''),
            seccion: clave.startsWith('about.') ? 'sobre_mi' : 'inicio'
        }));

        const { error } = await this.supabase.from(table).upsert(rows, { onConflict: 'clave' });
        if (error) {
            console.warn('Error guardando textos en Supabase:', error.message);
        }
    }

    async syncLinksToCloud(linksObj) {
        if (!this.supabase) return;
        const table = this.supabaseConfig.TABLES.LINKS;
        const rows = [];

        ['contactBtn', 'emailLink', 'instagramLink'].forEach((clave, idx) => {
            if (linksObj[clave]) {
                rows.push({
                    clave,
                    titulo: linksObj[clave].text || '',
                    url: linksObj[clave].href || '',
                    tipo: clave === 'instagramLink' ? 'red_social' : 'contacto',
                    orden: idx + 10,
                    activo: true
                });
            }
        });

        if (rows.length === 0) return;

        const { error } = await this.supabase.from(table).upsert(rows, { onConflict: 'clave' });
        if (error) {
            console.warn('Error guardando enlaces en Supabase:', error.message);
        }
    }

    async syncCvMetaToCloud(meta) {
        if (!this.supabase || !meta?.url) return;
        const table = this.supabaseConfig.TABLES.LINKS;
        const { error } = await this.supabase.from(table).upsert(
            [
                {
                    clave: 'cv_pdf',
                    titulo: meta.fileName || 'Hoja_de_Vida_Steban_Gomez.pdf',
                    url: meta.url,
                    tipo: 'archivo',
                    orden: 1,
                    activo: true
                }
            ],
            { onConflict: 'clave' }
        );
        if (error) {
            console.warn('Error sincronizando enlace de CV en Supabase:', error.message);
        }
    }

    async uploadCvToCloud(file) {
        if (!this.supabase || !file) return null;
        const bucket = this.supabaseConfig.BUCKET;
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `cv/${Date.now()}_${safeName}`;

        const { error: uploadError } = await this.supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type || 'application/pdf'
            });

        if (uploadError) {
            console.warn('No se pudo subir el CV a Supabase Storage:', uploadError.message);
            return null;
        }

        const { data } = this.supabase.storage.from(bucket).getPublicUrl(filePath);
        const publicUrl = data?.publicUrl || null;

        if (publicUrl) {
            await this.syncCvMetaToCloud({
                fileName: file.name,
                url: publicUrl
            });
        }

        return publicUrl;
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
