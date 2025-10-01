$(document).ready(function() {
	// Variáveis globais
	let shortcuts = [];
	let fixedShortcuts = {};
	const STORAGE_KEY = 'launcher_shortcuts';
	const FIXED_STORAGE_KEY = 'launcher_fixed_shortcuts';
	const CONFIG_STORAGE_KEY = 'qLauncher_config';

	// Sistema IndexedDB unificado
	class IndexedDBManager {
	    constructor() {
	        this.dbName = 'qLauncherDB';
	        this.version = 1;
	        this.db = null;
	    }

	    async init() {
	        return new Promise((resolve, reject) => {
	            const request = indexedDB.open(this.dbName, this.version);
	            
	            request.onerror = () => reject(request.error);
	            request.onsuccess = () => {
	                this.db = request.result;
	                resolve();
	            };
	            
	            request.onupgradeneeded = (event) => {
	                const db = event.target.result;
	                
	                // Store para atalhos dinâmicos
	                if (!db.objectStoreNames.contains('shortcuts')) {
	                    db.createObjectStore('shortcuts', { keyPath: 'id', autoIncrement: true });
	                }
	                
	                // Store para atalhos fixos
	                if (!db.objectStoreNames.contains('fixedShortcuts')) {
	                    db.createObjectStore('fixedShortcuts', { keyPath: 'id' });
	                }
	                
	                // Store para configurações
	                if (!db.objectStoreNames.contains('config')) {
	                    db.createObjectStore('config', { keyPath: 'key' });
	                }
	            };
	        });
	    }

	    async saveShortcuts(shortcuts) {
	        const transaction = this.db.transaction(['shortcuts'], 'readwrite');
	        const store = transaction.objectStore('shortcuts');
	        
	        // Limpar store existente
	        await store.clear();
	        
	        // Adicionar novos atalhos
	        for (const shortcut of shortcuts) {
	            await store.add(shortcut);
	        }
	    }

	    async loadShortcuts() {
	        const transaction = this.db.transaction(['shortcuts'], 'readonly');
	        const store = transaction.objectStore('shortcuts');
	        return new Promise((resolve, reject) => {
	            const request = store.getAll();
	            request.onsuccess = () => resolve(request.result);
	            request.onerror = () => reject(request.error);
	        });
	    }

	    async saveFixedShortcuts(fixedShortcuts) {
	        const transaction = this.db.transaction(['fixedShortcuts'], 'readwrite');
	        const store = transaction.objectStore('fixedShortcuts');
	        
	        // Limpar store existente
	        await store.clear();
	        
	        // Adicionar novos atalhos fixos
	        for (const [category, types] of Object.entries(fixedShortcuts)) {
	            for (const [type, data] of Object.entries(types)) {
	                await store.add({
	                    id: `${category}_${type}`,
	                    category,
	                    type,
	                    ...data
	                });
	            }
	        }
	    }

	    async loadFixedShortcuts() {
	        const transaction = this.db.transaction(['fixedShortcuts'], 'readonly');
	        const store = transaction.objectStore('fixedShortcuts');
	        return new Promise((resolve, reject) => {
	            const request = store.getAll();
	            request.onsuccess = () => {
	                const result = {};
	                request.result.forEach(item => {
	                    if (!result[item.category]) {
	                        result[item.category] = {};
	                    }
	                    result[item.category][item.type] = {
	                        title: item.title,
	                        link: item.link,
	                        color: item.color
	                    };
	                });
	                resolve(result);
	            };
	            request.onerror = () => reject(request.error);
	        });
	    }

	    async saveConfig(config) {
	        const transaction = this.db.transaction(['config'], 'readwrite');
	        const store = transaction.objectStore('config');
	        await store.put({ key: 'hostConfig', value: config });
	    }

	    async loadConfig() {
	        const transaction = this.db.transaction(['config'], 'readonly');
	        const store = transaction.objectStore('config');
	        return new Promise((resolve, reject) => {
	            const request = store.get('hostConfig');
	            request.onsuccess = () => {
	                resolve(request.result ? request.result.value : null);
	            };
	            request.onerror = () => reject(request.error);
	        });
	    }
	}

	// Instância global do IndexedDB Manager
	const dbManager = new IndexedDBManager();

	// Inicializar aplicação
	init();

	async function init() {
	    try {
	        // Inicializar IndexedDB unificado
	        await dbManager.init();
	        console.log('IndexedDB inicializado');
	        
	        // Carregar dados do IndexedDB
	        await loadShortcuts();
	        await loadFixedShortcuts();
	        await loadConfigSettings();
	        updateFixedShortcutUrls();
	        
	        // Renderizar interface
	        renderShortcuts();
	        renderFixedShortcuts();
	        setupEventListeners();
	        
	        // Inicializar IndexedDB para diário
	        await window.diaryManager.init();
	        console.log('Sistema de diário inicializado');
	        
	    } catch (error) {
	        console.error('Erro ao inicializar aplicação:', error);
	    }
	}

	// Carregar atalhos do IndexedDB
	async function loadShortcuts() {
	    try {
	        shortcuts = await dbManager.loadShortcuts();
	    } catch (error) {
	        console.error('Erro ao carregar atalhos:', error);
	        shortcuts = [];
	    }
	}

	// Carregar atalhos fixos do IndexedDB
	async function loadFixedShortcuts() {
	    try {
	        const saved = await dbManager.loadFixedShortcuts();
	        if (saved && Object.keys(saved).length > 0) {
	            fixedShortcuts = saved;
	        } else {
	            // Inicializar com valores padrão
	            fixedShortcuts = {
	                '8.24': {
	                    'atendente': { title: 'Atendente', link: 'http://localhost/8.24/html/index.php', color: '#3B82F6' },
	                    'solicitante': { title: 'Solicitante', link: 'http://localhost/8.24/html/sys/syssolicitante9/portal/portal.php', color: '#3B82F6' }
	                },
	                '8.20': {
	                    'atendente': { title: 'Atendente', link: 'http://localhost/8.20/html/index.php', color: '#1D4ED8' },
	                    'solicitante': { title: 'Solicitante', link: 'http://localhost/8.20/html/sys/syssolicitante9/portal/portal.php', color: '#1D4ED8' }
	                }
	            };
	            // Salvar valores padrão
	            await dbManager.saveFixedShortcuts(fixedShortcuts);
	        }
	    } catch (error) {
	        console.error('Erro ao carregar atalhos fixos:', error);
	        fixedShortcuts = {};
	    }
	}

	// Salvar atalhos no IndexedDB
	async function saveShortcuts() {
	    try {
	        await dbManager.saveShortcuts(shortcuts);
	    } catch (error) {
	        console.error('Erro ao salvar dados:', error);
	        showNotification('Erro ao salvar dados!', 'error');
	    }
	}

	// Salvar atalhos fixos no IndexedDB
	async function saveFixedShortcuts() {
	    try {
	        await dbManager.saveFixedShortcuts(fixedShortcuts);
	    } catch (error) {
	        console.error('Erro ao salvar atalhos fixos:', error);
	        showNotification('Erro ao salvar atalhos fixos!', 'error');
	    }
	}


	// Renderizar atalhos fixos
	function renderFixedShortcuts() {
	    // Atualizar cards fixos com cores padrão fixas
	    Object.keys(fixedShortcuts).forEach(category => {
	        Object.keys(fixedShortcuts[category]).forEach(type => {
	            const card = $(`.fixed-shortcut-card[data-category="${category}"][data-type="${type}"]`);
	            
	            if (card.length) {
	                let defaultTitle = type === 'atendente' ? 'Atendente' : 'Solicitante';
	                card.find('h4').text(defaultTitle);
	            }
	        });
	    });
	}

	// Renderizar atalhos na tela
	function renderShortcuts() {
	    const grid = $('#shortcutsGrid');
	    grid.empty();

	    // Adicionar botão "+" primeiro
	    const addButton = $(`
	        <button id="addShortcutBtn" class="shortcut-card bg-gray-600 hover:bg-gray-500 rounded-lg p-4 cursor-pointer transition-colors duration-200 flex items-center justify-center border-2 border-dashed border-gray-400 hover:border-gray-300">
	            <i class="fas fa-plus text-2xl text-gray-300"></i>
	        </button>
	    `);
	    grid.append(addButton);

	    // Adicionar atalhos dinâmicos
	    shortcuts.forEach((shortcut, index) => {
	        const shortcutCard = createShortcutCard(shortcut, index);
	        grid.append(shortcutCard);
	    });
	    
	    console.log('Shortcuts renderizados:', shortcuts.length);
	}

	// Função para gerar URL do favicon
	function getFaviconUrl(url) {
	    try {
	        const urlObj = new URL(url);
	        const domain = urlObj.hostname;
			
	        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
	        
	    } catch (error) {
	        console.error('Erro ao extrair domínio da URL:', error);
	        // Fallback para um ícone padrão mais bonito
	        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzY2NjY2NiIvPgo8cGF0aCBkPSJNMTYgOEMxOS4zMTM3IDggMjIgMTAuNjg2MyAyMiAxNEMyMiAxNy4zMTM3IDE5LjMxMzcgMjAgMTYgMjBDMTIuNjg2MyAyMCAxMCAxNy4zMTM3IDEwIDE0QzEwIDEwLjY4NjMgMTIuNjg2MyA4IDE2IDhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=';
	    }
	}


	// Criar card de atalho
	function createShortcutCard(shortcut, index) {
	    const backgroundColor = shortcut.color || '#3B82F6';
	    
	    // Gerar favicon URL
	    const faviconUrl = getFaviconUrl(shortcut.link);

	    const targetAttr = linkBehavior === 'new' ? 'target="_blank"' : '';
	    
	    return $(`
	        <a href="${shortcut.link}" class="shortcut-card rounded-lg p-4 cursor-pointer relative block no-underline" data-index="${index}" style="background-color: ${backgroundColor}" ${targetAttr}>
	            <div class="action-buttons">
	                <button class="action-btn edit-btn bg-blue-500 hover:bg-blue-600 text-white" data-index="${index}">
	                    <i class="fas fa-edit"></i>
	                </button>
	                <button class="action-btn remove-btn bg-red-500 hover:bg-red-600 text-white" data-index="${index}">
	                    <i class="fas fa-times"></i>
	                </button>
	            </div>
	            <div class="text-center">
	                <div class="flex justify-center mb-2">
	                    <div class="favicon-container relative">
	                        <img src="${faviconUrl}" alt="Favicon" class="w-6 h-6 rounded favicon-img" 
	                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
	                        <i class="fas fa-globe text-white text-xl absolute inset-0 flex items-center justify-center" style="display: none;"></i>
	                    </div>
	                </div>
	                <h3 class="text-base font-medium text-white truncate">${shortcut.title}</h3>
	            </div>
	        </a>
	    `);
	}

	// Configurar event listeners
	function setupEventListeners() {
	    // Botão adicionar atalho
	    $('#addShortcutBtn').click(function() {
	        $('#shortcutModal').removeClass('hidden').addClass('flex');
	    });

	    // Fechar modal
	    $('#closeModal, #cancelBtn').click(function() {
	        closeModal();
	    });

	    // Fechar modal clicando fora
	    $('#shortcutModal').click(function(e) {
	        if (e.target === this) {
	            closeModal();
	        }
	    });


	    // Carregar entradas do diário automaticamente
	    loadDiaryEntries();



	    // Botões do menu de backup (agora na modal de configuração)
	    $('#exportDataBtn').click(function() {
	        window.LauncherApp.exportData();
	        $('#configModal').removeClass('flex').addClass('hidden');
	    });

	    $('#importDataBtn').click(function() {
	        $('#importFileInput').click();
	    });

	    $('#clearAllBtn').click(async function() {
	        await window.LauncherApp.clearAll();
	        $('#configModal').removeClass('flex').addClass('hidden');
	    });

	    // Importar arquivo
	    $('#importFileInput').change(async function(e) {
	        const file = e.target.files[0];
	        if (file) {
	            await window.LauncherApp.importData(file);
	            $('#configModal').removeClass('flex').addClass('hidden');
	        }
	    });

	    // Event listeners do diário
	    $('#addDiaryEntryBtn').click(function() {
	        $('#diaryEntryForm').removeClass('hidden');
	        $('#diaryContent').focus();
	        
	        // Esconder título e botão +
	        $('.diary-header').addClass('hidden');
	    });

	    $('#cancelDiaryEntry').click(function() {
	        $('#diaryEntryForm').addClass('hidden');
	        $('#diaryContent').val('');
	        
	        // Mostrar título e botão + novamente
	        $('.diary-header').removeClass('hidden');
	    });

	    $('#saveDiaryEntry').click(function() {
	        saveDiaryEntry();
	    });

	    // Event listeners da modal de configuração
	    $('#configBtn').click(function() {
	        loadConfigSettings();
	        $('#configModal').removeClass('hidden').addClass('flex');
	    });

	    $('#closeConfigModal, #closeConfigModalBtn').click(function() {
	        $('#configModal').removeClass('flex').addClass('hidden');
	    });

	    $('#saveConfigBtn').click(function() {
	        saveConfigSettings();
	    });

	    // Event listeners do backup do diário
	    $('#exportDiaryBtn').click(function() {
	        window.diaryManager.exportDiary();
	        $('#configModal').removeClass('flex').addClass('hidden');
	    });

	    $('#importDiaryBtn').click(function() {
	        $('#importDiaryInput').click();
	    });

	    $('#clearDiaryBtn').click(function() {
	        if (confirm('Tem certeza que deseja limpar todo o diário?')) {
	            window.diaryManager.clearAll().then(() => {
	                loadDiaryEntries();
	                showNotification('Diário limpo com sucesso!', 'success');
	            });
	            $('#configModal').removeClass('flex').addClass('hidden');
	        }
	    });

	    // Importar diário
	    $('#importDiaryInput').change(function(e) {
	        const file = e.target.files[0];
	        if (file) {
	            window.diaryManager.importDiary(file).then(() => {
	                loadDiaryEntries();
	                showNotification('Diário importado com sucesso!', 'success');
	            }).catch(error => {
	                showNotification('Erro ao importar diário: ' + error.message, 'error');
	            });
	            $('#configModal').removeClass('flex').addClass('hidden');
	        }
	    });

	    // Submit do formulário
	    $('#shortcutForm').submit(async function(e) {
	        e.preventDefault();
	        await saveShortcut();
	    });

	    // Event delegation para atalhos fixos
	    // O clique no link agora é direto via <a href>

	    // Event delegation para atalhos dinâmicos (remoção e edição)
	    // O clique no link agora é direto via <a href>

	    $(document).on('click', '.remove-btn', async function(e) {
	        e.preventDefault();
	        e.stopPropagation();
	        const index = $(this).data('index');
	        await removeShortcut(index);
	    });

	    $(document).on('click', '.edit-btn', function(e) {
	        e.preventDefault();
	        e.stopPropagation();
	        const index = $(this).data('index');
	        editShortcut(index);
	    });
	}

	// Variáveis para controlar modo de edição
	let editingIndex = null;
	let editingFixed = null;

	// Configurações de hosts
	let hostConfig = {
	    '8.24': 'http://localhost/8.24',
	    '8.20': 'http://localhost/8.20'
	};
	
	let linkBehavior = 'same'; // 'same' ou 'new'

	// Carregar configurações
	async function loadConfigSettings() {
	    try {
	        const savedConfig = await dbManager.loadConfig();
	        if (savedConfig) {
	            hostConfig = savedConfig;
	            if (savedConfig.linkBehavior) {
	                linkBehavior = savedConfig.linkBehavior;
	            }
	        }
	        
	        // Preencher campos da modal
	        $('#host824').val(hostConfig['8.24']);
	        $('#host820').val(hostConfig['8.20']);
	        $(`input[name="linkBehavior"][value="${linkBehavior}"]`).prop('checked', true);
	    } catch (error) {
	        console.error('Erro ao carregar configurações:', error);
	    }
	}

	// Salvar configurações
	async function saveConfigSettings() {
	    try {
	        // Atualizar configurações
	        hostConfig['8.24'] = $('#host824').val() || 'http://localhost/8.24';
	        hostConfig['8.20'] = $('#host820').val() || 'http://localhost/8.20';
	        linkBehavior = $('input[name="linkBehavior"]:checked').val() || 'same';
	        
	        const config = {
	            ...hostConfig,
	            linkBehavior: linkBehavior
	        };
	        
	        // Salvar no IndexedDB
	        await dbManager.saveConfig(config);
	        
	        // Atualizar URLs dos atalhos fixos
	        updateFixedShortcutUrls();
	        
	        // Re-renderizar atalhos dinâmicos para aplicar nova configuração
	        renderShortcuts();
	        
	        showNotification('Configurações salvas com sucesso!', 'success');
	        $('#configModal').removeClass('flex').addClass('hidden');
	    } catch (error) {
	        console.error('Erro ao salvar configurações:', error);
	        showNotification('Erro ao salvar configurações!', 'error');
	    }
	}

	// Atualizar URLs dos atalhos fixos
	function updateFixedShortcutUrls() {
	    // Atualizar 8.24
	    const card824Atendente = $('.fixed-shortcut-card[data-category="8.24"][data-type="atendente"]');
	    const card824Solicitante = $('.fixed-shortcut-card[data-category="8.24"][data-type="solicitante"]');
	    
	    card824Atendente.attr('href', hostConfig['8.24'] + '/html/index.php');
	    card824Solicitante.attr('href', hostConfig['8.24'] + '/html/sys/syssolicitante9/portal/portal.php');
	    
	    // Atualizar 8.20
	    const card820Atendente = $('.fixed-shortcut-card[data-category="8.20"][data-type="atendente"]');
	    const card820Solicitante = $('.fixed-shortcut-card[data-category="8.20"][data-type="solicitante"]');
	    
	    card820Atendente.attr('href', hostConfig['8.20'] + '/html/index.php');
	    card820Solicitante.attr('href', hostConfig['8.20'] + '/html/sys/syssolicitante9/portal/portal.php');
	    
	    // Aplicar comportamento de abertura configurado
	    $('.fixed-shortcut-card').attr('target', linkBehavior === 'new' ? '_blank' : '');
	}

	// Fechar modal
	function closeModal() {
	    $('#shortcutModal').removeClass('flex').addClass('hidden');
	    $('#shortcutForm')[0].reset();
	    $('#shortcutColor').val('#3B82F6');
	    
	    // Mostrar todos os campos novamente
	    $('#shortcutTitle').closest('.mb-4').show();
	    $('#shortcutDescription').closest('.mb-4').show();
	    $('#shortcutColor').closest('.mb-4').show();
	    
	    // Reabilitar todos os campos
	    $('#shortcutTitle').prop('disabled', false);
	    $('#shortcutDescription').prop('disabled', false);
	    $('#shortcutColor').prop('disabled', false);
	    
	    editingIndex = null;
	    editingFixed = null;
	    updateModalTitle();
	}

	// Atualizar título do modal
	function updateModalTitle() {
	    let title = 'Adicionar Atalho';
	    if (editingIndex !== null) {
	        title = 'Editar Atalho';
	    } else if (editingFixed !== null) {
	        title = `Editar ${editingFixed.category} - ${editingFixed.type}`;
	    }
	    $('#shortcutModal h2').text(title);
	}

	// Editar atalho fixo
	function editFixedShortcut(category, type) {
	    editingFixed = { category, type };
	    
	    // Definir URL padrão baseada na categoria e tipo
	    let defaultUrl = '';
	    if (category === '8.24') {
	        defaultUrl = type === 'atendente' 
	            ? 'http://localhost/8.24/login.php'
	            : 'http://localhost/8.24/loginUsuario.php';
	    } else if (category === '8.20') {
	        defaultUrl = type === 'atendente'
	            ? 'http://localhost/8.20/login.php'
	            : 'http://localhost/8.20/loginUsuario.php';
	    }
	    
	    // Limpar e definir apenas o campo URL
	    $('#shortcutForm')[0].reset();
	    $('#shortcutLink').val(defaultUrl);
	    
	    // Esconder campos que não são necessários para atalhos fixos
	    $('#shortcutTitle').closest('.mb-4').hide();
	    $('#shortcutDescription').closest('.mb-4').hide();
	    $('#shortcutColor').closest('.mb-4').hide();
	    
	    updateModalTitle();
	    $('#shortcutModal').removeClass('hidden').addClass('flex');
	}

	// Editar atalho
	function editShortcut(index) {
	    const shortcut = shortcuts[index];
	    if (!shortcut) return;

	    editingIndex = index;
	    
	    // Preencher campos com dados do atalho
	    $('#shortcutTitle').val(shortcut.title);
	    $('#shortcutColor').val(shortcut.color || '#3B82F6');
	    $('#shortcutLink').val(shortcut.link);
	    
	    updateModalTitle();
	    $('#shortcutModal').removeClass('hidden').addClass('flex');
	}

	// Salvar atalho (novo, editado ou fixo)
	async function saveShortcut() {
	    const title = $('#shortcutTitle').val().trim();
	    const color = $('#shortcutColor').val();
	    const link = $('#shortcutLink').val().trim();

	    if (!title || !link) {
	        alert('Por favor, preencha o título e o link.');
	        return;
	    }

	    // Validar URL
	    try {
	        new URL(link);
	    } catch {
	        alert('Por favor, insira uma URL válida.');
	        return;
	    }

	    if (editingFixed !== null) {
	        // Editar atalho fixo - apenas URL pode ser alterada
	        const category = editingFixed.category;
	        const type = editingFixed.type;
	        
	        // Definir valores padrão baseados na categoria e tipo
	        let defaultTitle = type === 'atendente' ? 'Atendente' : 'Solicitante';
	        let defaultColor = category === '8.24' ? '#3B82F6' : '#1D4ED8';
	        
	        fixedShortcuts[category][type] = {
	            title: defaultTitle,
	            color: defaultColor,
	            link: link, // Apenas URL pode ser alterada
	            updatedAt: new Date().toISOString()
	        };
	        
	        saveFixedShortcuts();
	        renderFixedShortcuts();
	        closeModal();
	        showNotification('URL do atalho fixo editada com sucesso!', 'success');
	    } else if (editingIndex !== null) {
	        // Editar atalho existente
	        shortcuts[editingIndex] = {
	            ...shortcuts[editingIndex],
	            title: title,
	            color: color,
	            link: link,
	            updatedAt: new Date().toISOString()
	        };
	        
	        await saveShortcuts();
	        renderShortcuts();
	        closeModal();
	        showNotification('Atalho editado com sucesso!', 'success');
	    } else {
	        // Criar novo atalho
	        const newShortcut = {
	            id: Date.now(),
	            title: title,
	            color: color,
	            link: link,
	            createdAt: new Date().toISOString()
	        };

	        shortcuts.push(newShortcut);
	        await saveShortcuts();
	        renderShortcuts();
	        closeModal();
	        showNotification('Atalho adicionado com sucesso!', 'success');
	    }
	}


	// Remover atalho
	async function removeShortcut(index) {
	    if (confirm('Tem certeza que deseja remover este atalho?')) {
	        shortcuts.splice(index, 1);
	        await saveShortcuts();
	        renderShortcuts();
	        showNotification('Atalho removido com sucesso!', 'success');
	    }
	}

	// Mostrar notificação
	function showNotification(message, type = 'info') {
	    const bgColor = type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue';
	    const notification = $(`
	        <div class="fixed top-4 right-4 bg-${bgColor}-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
	            ${message}
	        </div>
	    `);
	    
	    $('body').append(notification);
	    
	    setTimeout(() => {
	        notification.fadeOut(() => {
	            notification.remove();
	        });
	    }, 3000);
	}

	// Função para exportar dados (backup)
	function exportData() {
	    try {
	        const dataStr = JSON.stringify(shortcuts, null, 2);
	        const dataBlob = new Blob([dataStr], {type: 'application/json'});
	        const url = URL.createObjectURL(dataBlob);
	        const link = document.createElement('a');
	        link.href = url;
	        link.download = `launcher-backup-${new Date().toISOString().split('T')[0]}.json`;
	        link.click();
	        URL.revokeObjectURL(url);
	        showNotification('Backup realizado com sucesso!', 'success');
	    } catch (error) {
	        console.error('Erro no backup:', error);
	        showNotification('Erro ao fazer backup!', 'error');
	    }
	}

	// Função para importar dados (restore)
	async function importData(file) {
	    const reader = new FileReader();
	    reader.onload = async function(e) {
	        try {
	            const imported = JSON.parse(e.target.result);
	            if (Array.isArray(imported)) {
	                shortcuts = imported;
	                await saveShortcuts();
	                renderShortcuts();
	                showNotification('Dados importados com sucesso!', 'success');
	            } else {
	                throw new Error('Formato inválido');
	            }
	        } catch (error) {
	            console.error('Erro na importação:', error);
	            alert('Erro ao importar dados: ' + error.message);
	        }
	    };
	    reader.readAsText(file);
	}


	// Adicionar atalhos de teclado
	$(document).keydown(function(e) {
	    // ESC para fechar modal
	    if (e.key === 'Escape' && $('#shortcutModal').hasClass('flex')) {
	        closeModal();
	    }
	    
	    // Ctrl+N para novo atalho
	    if (e.ctrlKey && e.key === 'n') {
	        e.preventDefault();
	        $('#addShortcutBtn').click();
	    }
	});

	// Funções do diário

	async function loadDiaryEntries() {
	    try {
	        const entries = await window.diaryManager.getAllEntries();
	        renderDiaryEntries(entries);
	    } catch (error) {
	        console.error('Erro ao carregar entradas do diário:', error);
	        showNotification('Erro ao carregar diário!', 'error');
	    }
	}

	function renderDiaryEntries(entries) {
	    const container = $('#diaryEntriesList');
	    container.empty();

	    if (entries.length === 0) {
	        container.html(`
	            <div class="text-center py-8">
	                <div class="text-gray-400 mb-4">
	                    <i class="fas fa-calendar-times text-4xl mb-2"></i>
	                    <p class="text-lg font-medium">Nenhuma anotação encontrada</p>
	                    <p class="text-sm">Clique em "Nova Anotação" para começar seu diário!</p>
	                </div>
	            </div>
	        `);
	        return;
	    }

	    // Ordenar por data (mais recente primeiro)
	    entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

	    // Agrupar entradas por data
	    const entriesByDate = {};
	    entries.forEach(entry => {
	        const date = entry.date;
	        if (!entriesByDate[date]) {
	            entriesByDate[date] = [];
	        }
	        entriesByDate[date].push(entry);
	    });

	    // Obter as últimas 3 datas com entradas
	    const sortedDates = Object.keys(entriesByDate).sort((a, b) => new Date(b) - new Date(a));
	    const last3Dates = sortedDates.slice(0, 3);


	    // Obter data atual para comparação
	    const today = new Date().toISOString().split('T')[0];
	    
	    // Renderizar entradas dos últimos 3 dias
	    last3Dates.forEach((date, index) => {
	        const dayEntries = entriesByDate[date];
	        const isToday = date === today;
	        
	        // Determinar cor baseada na prioridade
	        let colorType;
	        if (isToday) {
	            colorType = 'today'; // Verde - dia atual
	        } else {
	            // Para dias que não são hoje, verificar se é o último dia com registro
	            const hasTodayEntry = last3Dates.includes(today);
	            if (hasTodayEntry) {
	                // Se há registro de hoje, o primeiro não-hoje é o último dia
	                if (index === 1) {
	                    colorType = 'latest'; // Amarelo - último dia com registro
	                } else {
	                    colorType = 'other'; // Vermelho - demais dias
	                }
	            } else {
	                // Se não há registro de hoje, o primeiro é o último dia
	                if (index === 0) {
	                    colorType = 'latest'; // Amarelo - último dia com registro
	                } else {
	                    colorType = 'other'; // Vermelho - demais dias
	                }
	            }
	        }
	        
	        // Debug: verificar lógica de cores
	        console.log(`📅 Data: ${date}, Index: ${index}, isToday: ${isToday}, colorType: ${colorType}`);
	        
	        
	        dayEntries.forEach(entry => {
	            const entryHtml = createDiaryEntryHtml(entry, colorType);
	            container.append(entryHtml);
	        });
	    });
	}


	function createDiaryEntryHtml(entry, colorType) {
	    const date = new Date(entry.createdAt);
	    const formattedDate = date.toLocaleDateString('pt-BR');
	    const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
	    
	    // Obter dia da semana em português ou "Hoje"
	    const weekDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
	    const isToday = colorType === 'today';
	    const dayOfWeek = isToday ? 'Hoje' : weekDays[date.getDay()];
	    
	    // Definir cor da borda e texto baseada no tipo
	    let borderColor, textColor;
	    if (colorType === 'today') {
	        // Dia atual sempre verde
	        borderColor = 'border-green-500';
	        textColor = 'text-green-400';
	    } else if (colorType === 'latest') {
	        // Último dia com registro sempre amarelo
	        borderColor = 'border-yellow-500';
	        textColor = 'text-yellow-400';
	    } else {
	        // Demais dias sempre vermelho
	        borderColor = 'border-red-500';
	        textColor = 'text-red-400';
	    }
	    
	    const borderClass = `border-l-4 ${borderColor}`;

	    return $(`
	        <div class="diary-entry-card bg-gray-600 rounded-lg p-4 ${borderClass}">
	            <div class="flex justify-between items-start mb-2">
	                <div class="text-sm text-gray-300">
	                    <span class="font-medium">${formattedDate}</span>
	                    <span class="${textColor} text-xs ml-1">(${dayOfWeek})</span>
	                    <span class="text-gray-400 ml-2">${formattedTime}</span>
	                </div>
	                <div class="flex space-x-2">
	                    <button class="edit-diary-entry text-blue-400 hover:text-blue-300 text-sm" data-id="${entry.id}">
	                        <i class="fas fa-edit"></i>
	                    </button>
	                    <button class="delete-diary-entry text-red-400 hover:text-red-300 text-sm" data-id="${entry.id}">
	                        <i class="fas fa-trash"></i>
	                    </button>
	                </div>
	            </div>
	            <p class="text-white mb-2">${entry.content}</p>
	        </div>
	    `);
	}

	async function saveDiaryEntry() {
	    const content = $('#diaryContent').val().trim();
	    const editingId = $('#saveDiaryEntry').data('editing-id');
	    
	    if (!content) {
	        alert('Por favor, digite uma anotação.');
	        return;
	    }

	    try {
	        if (editingId) {
	            // Modo de edição
	            await window.diaryManager.updateEntry(editingId, content, []);
	            $('#saveDiaryEntry').removeData('editing-id');
	            showNotification('Anotação atualizada com sucesso!', 'success');
	        } else {
	            // Modo de criação
	            await window.diaryManager.addEntry(content, []);
	            showNotification('Anotação salva com sucesso!', 'success');
	        }
	        
	        $('#diaryEntryForm').addClass('hidden');
	        $('#diaryContent').val('');
	        
	        // Mostrar título e botão + novamente
	        $('.diary-header').removeClass('hidden');
	        
	        loadDiaryEntries();
	    } catch (error) {
	        console.error('Erro ao salvar anotação:', error);
	        showNotification('Erro ao salvar anotação!', 'error');
	    }
	}

	// Event delegation para edição e remoção de entradas do diário
	$(document).on('click', '.edit-diary-entry', function() {
	    const id = $(this).data('id');
	    editDiaryEntry(id);
	});

	$(document).on('click', '.delete-diary-entry', function() {
	    const id = $(this).data('id');
	    if (confirm('Tem certeza que deseja remover esta anotação?')) {
	        deleteDiaryEntry(id);
	    }
	});

	async function editDiaryEntry(id) {
	    try {
	        const entries = await window.diaryManager.getAllEntries();
	        const entry = entries.find(e => e.id === id);
	        
	        if (entry) {
	            $('#diaryContent').val(entry.content);
	            $('#diaryEntryForm').removeClass('hidden');
	            $('#diaryContent').focus();
	            
	            // Marcar como modo de edição
	            $('#saveDiaryEntry').data('editing-id', id);
	        }
	    } catch (error) {
	        console.error('Erro ao carregar entrada para edição:', error);
	        showNotification('Erro ao carregar anotação!', 'error');
	    }
	}

	async function deleteDiaryEntry(id) {
	    try {
	        await window.diaryManager.deleteEntry(id);
	        loadDiaryEntries();
	        showNotification('Anotação removida com sucesso!', 'success');
	    } catch (error) {
	        console.error('Erro ao remover anotação:', error);
	        showNotification('Erro ao remover anotação!', 'error');
	    }
	}

	// Expor funções globalmente para debug/backup
	window.LauncherApp = {
	    exportData,
	    importData,
	    shortcuts: () => shortcuts,
	    clearAll: async () => {
	        if (confirm('Tem certeza que deseja remover todos os atalhos?')) {
	            shortcuts = [];
	            await saveShortcuts();
	            renderShortcuts();
	            showNotification('Todos os atalhos foram removidos!', 'success');
	        }
	    }
	};
});
