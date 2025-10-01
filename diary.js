// Sistema de Diário com IndexedDB
class DiaryManager {
	constructor() {
	    this.dbName = 'LauncherDiary';
	    this.dbVersion = 1;
	    this.db = null;
	    this.storeName = 'entries';
	}

	// Inicializar IndexedDB
	async init() {
	    return new Promise((resolve, reject) => {
	        const request = indexedDB.open(this.dbName, this.dbVersion);
	        
	        request.onerror = () => {
	            console.error('Erro ao abrir IndexedDB:', request.error);
	            reject(request.error);
	        };
	        
	        request.onsuccess = () => {
	            this.db = request.result;
	            console.log('IndexedDB inicializado com sucesso');
	            resolve();
	        };
	        
	        request.onupgradeneeded = (event) => {
	            const db = event.target.result;
	            
	            // Criar store para entradas do diário
	            if (!db.objectStoreNames.contains(this.storeName)) {
	                const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
	                
	                // Criar índices para busca eficiente
	                store.createIndex('date', 'date', { unique: false });
	                store.createIndex('createdAt', 'createdAt', { unique: false });
	                store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
	            }
	        };
	    });
	}

	// Adicionar entrada no diário
	async addEntry(content, tags = []) {
	    if (!this.db) await this.init();
	    
	    const entry = {
	        id: Date.now(),
	        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
	        content: content.trim(),
	        tags: tags,
	        createdAt: new Date().toISOString(),
	        updatedAt: new Date().toISOString()
	    };

	    return new Promise((resolve, reject) => {
	        const transaction = this.db.transaction([this.storeName], 'readwrite');
	        const store = transaction.objectStore(this.storeName);
	        const request = store.add(entry);

	        request.onsuccess = () => {
	            console.log('Entrada adicionada:', entry);
	            resolve(entry);
	        };

	        request.onerror = () => {
	            console.error('Erro ao adicionar entrada:', request.error);
	            reject(request.error);
	        };
	    });
	}

	// Buscar entradas por data
	async getEntriesByDate(date) {
	    if (!this.db) await this.init();
	    
	    return new Promise((resolve, reject) => {
	        const transaction = this.db.transaction([this.storeName], 'readonly');
	        const store = transaction.objectStore(this.storeName);
	        const index = store.index('date');
	        const request = index.getAll(date);

	        request.onsuccess = () => {
	            resolve(request.result);
	        };

	        request.onerror = () => {
	            reject(request.error);
	        };
	    });
	}

	// Buscar entradas por período
	async getEntriesByRange(startDate, endDate) {
	    if (!this.db) await this.init();
	    
	    return new Promise((resolve, reject) => {
	        const transaction = this.db.transaction([this.storeName], 'readonly');
	        const store = transaction.objectStore(this.storeName);
	        const index = store.index('date');
	        const range = IDBKeyRange.bound(startDate, endDate);
	        const request = index.getAll(range);

	        request.onsuccess = () => {
	            resolve(request.result);
	        };

	        request.onerror = () => {
	            reject(request.error);
	        };
	    });
	}

	// Buscar todas as entradas
	async getAllEntries() {
	    if (!this.db) await this.init();
	    
	    return new Promise((resolve, reject) => {
	        const transaction = this.db.transaction([this.storeName], 'readonly');
	        const store = transaction.objectStore(this.storeName);
	        const request = store.getAll();

	        request.onsuccess = () => {
	            resolve(request.result);
	        };

	        request.onerror = () => {
	            reject(request.error);
	        };
	    });
	}

	// Atualizar entrada
	async updateEntry(id, content, tags = []) {
	    if (!this.db) await this.init();
	    
	    return new Promise((resolve, reject) => {
	        const transaction = this.db.transaction([this.storeName], 'readwrite');
	        const store = transaction.objectStore(this.storeName);
	        const getRequest = store.get(id);

	        getRequest.onsuccess = () => {
	            const entry = getRequest.result;
	            if (entry) {
	                entry.content = content.trim();
	                entry.tags = tags;
	                entry.updatedAt = new Date().toISOString();
	                
	                const updateRequest = store.put(entry);
	                updateRequest.onsuccess = () => resolve(entry);
	                updateRequest.onerror = () => reject(updateRequest.error);
	            } else {
	                reject(new Error('Entrada não encontrada'));
	            }
	        };

	        getRequest.onerror = () => reject(getRequest.error);
	    });
	}

	// Deletar entrada
	async deleteEntry(id) {
	    if (!this.db) await this.init();
	    
	    return new Promise((resolve, reject) => {
	        const transaction = this.db.transaction([this.storeName], 'readwrite');
	        const store = transaction.objectStore(this.storeName);
	        const request = store.delete(id);

	        request.onsuccess = () => {
	            console.log('Entrada deletada:', id);
	            resolve();
	        };

	        request.onerror = () => {
	            reject(request.error);
	        };
	    });
	}

	// Exportar dados do diário
	async exportDiary() {
	    const entries = await this.getAllEntries();
	    const dataStr = JSON.stringify(entries, null, 2);
	    const dataBlob = new Blob([dataStr], { type: 'application/json' });
	    const url = URL.createObjectURL(dataBlob);
	    const link = document.createElement('a');
	    link.href = url;
	    link.download = `diario-backup-${new Date().toISOString().split('T')[0]}.json`;
	    link.click();
	    URL.revokeObjectURL(url);
	}

	// Importar dados do diário
	async importDiary(file) {
	    return new Promise((resolve, reject) => {
	        const reader = new FileReader();
	        reader.onload = async (e) => {
	            try {
	                const imported = JSON.parse(e.target.result);
	                if (Array.isArray(imported)) {
	                    // Limpar dados existentes
	                    const transaction = this.db.transaction([this.storeName], 'readwrite');
	                    const store = transaction.objectStore(this.storeName);
	                    await store.clear();
	                    
	                    // Adicionar dados importados
	                    for (const entry of imported) {
	                        await this.addEntry(entry.content, entry.tags);
	                    }
	                    resolve();
	                } else {
	                    throw new Error('Formato inválido');
	                }
	            } catch (error) {
	                reject(error);
	            }
	        };
	        reader.readAsText(file);
	    });
	}

	// Limpar todas as entradas
	async clearAll() {
	    if (!this.db) await this.init();
	    
	    return new Promise((resolve, reject) => {
	        const transaction = this.db.transaction([this.storeName], 'readwrite');
	        const store = transaction.objectStore(this.storeName);
	        const request = store.clear();

	        request.onsuccess = () => {
	            console.log('Todas as entradas foram removidas');
	            resolve();
	        };

	        request.onerror = () => {
	            reject(request.error);
	        };
	    });
	}
}

// Instância global do gerenciador de diário
window.diaryManager = new DiaryManager();
