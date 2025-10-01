# Launcher - Links Rápidos

Um launcher simples e elegante para criar atalhos de acesso rápido que podem ser usados como página inicial do navegador.

## 🚀 Funcionalidades

- ✅ Interface limpa e responsiva
- ✅ Adicionar atalhos com título, descrição, cor e link
- ✅ Campo de descrição opcional para cada atalho
- ✅ Persistência em arquivo JSON local
- ✅ Remoção de atalhos com confirmação
- ✅ Navegação para links em nova aba
- ✅ Atalhos de teclado (Ctrl+N para novo atalho, ESC para fechar modal)
- ✅ Sistema de notificações
- ✅ Backup e restore de dados
- ✅ Funciona 100% no navegador (sem servidor)
- ✅ Fallback para localStorage quando File System Access API não está disponível

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura da página
- **CSS3** - Estilização (com Tailwind CSS)
- **JavaScript** - Lógica da aplicação
- **jQuery** - Manipulação do DOM
- **Tailwind CSS** - Framework CSS utilitário
- **Font Awesome** - Ícones
- **File System Access API** - Para salvar arquivos no disco
- **localStorage** - Fallback para navegadores sem File System Access API

## 📁 Estrutura do Projeto

```
qLauncher/
├── index.html          # Página principal
├── script.js           # Lógica da aplicação
├── data.json           # Banco de dados dos atalhos (opcional)
└── README.md           # Documentação
```

## 🚀 Como Usar

### Pré-requisitos
- Navegador web moderno (Chrome, Edge, Firefox)
- **Importante**: File System Access API funciona melhor no Chrome/Edge

### Execução

1. **Abrir a aplicação**:
   - Simplesmente abra o arquivo `index.html` no navegador
   - Ou sirva via servidor local (opcional): `python -m http.server 8000`

2. **Configurar arquivos (opcional)**:
   - Clique no botão "Arquivos" no cabeçalho
   - Selecione um arquivo `data.json` existente ou crie um novo

## 🎯 Como Usar

1. **Adicionar Atalho**: Clique no botão "+" no canto superior direito
2. **Preencher Dados**: 
   - Título do atalho
   - Cor de fundo (selecione uma cor)
   - Descrição (opcional - texto explicativo)
   - Link (URL completa)
3. **Salvar**: Clique em "Salvar" para adicionar o atalho
4. **Usar**: Clique em qualquer atalho para abrir o link em nova aba
5. **Remover**: Passe o mouse sobre um atalho e clique no "X" vermelho

## ⌨️ Atalhos de Teclado

- `Ctrl + N` - Abrir modal para novo atalho
- `ESC` - Fechar modal

## 💾 Armazenamento de Dados

O sistema oferece duas opções de armazenamento:

### **Modo Arquivo (Recomendado)**
- **data.json** - Arquivo JSON no disco contendo todos os atalhos
- **Persistente** - Dados ficam salvos mesmo fechando o navegador
- **Portável** - Pode mover os arquivos para outro computador

### **Modo Navegador (Fallback)**
- **localStorage** - Dados salvos no navegador
- **Limitado** - Dados podem ser perdidos se limpar o navegador
- **Compatível** - Funciona em todos os navegadores

## 🔧 Funcionalidades Avançadas

### Backup e Restore
Você pode fazer backup dos seus atalhos usando o console do navegador:

```javascript
// Exportar dados (download automático)
LauncherApp.exportData();

// Importar dados (via input file)
// Use LauncherApp.importData(file) no console

// Ver todos os atalhos
LauncherApp.shortcuts();

// Limpar todos os atalhos
LauncherApp.clearAll();
```

### Menu de Arquivos
O botão "Arquivos" no cabeçalho oferece:

- **Selecionar data.json** - Carregar arquivo existente
- **Criar novo data.json** - Criar novo arquivo de dados
- **Exportar Backup** - Download do arquivo de backup
- **Importar Backup** - Restaurar dados de backup

## 🎨 Personalização

O projeto usa Tailwind CSS, então você pode facilmente personalizar:
- Cores do tema
- Layout e espaçamentos
- Animações e transições
- Responsividade

## 🌐 Como Usar como Página Inicial

### **Opção 1: Arquivo Local**
1. Salve o arquivo `index.html` em uma pasta acessível
2. No seu navegador, vá em Configurações > Página inicial
3. Defina o caminho para o arquivo `index.html`
4. Agora toda vez que abrir uma nova aba, verá seus atalhos!

### **Opção 2: Servidor Local (Opcional)**
1. Sirva os arquivos via servidor local: `python -m http.server 8000`
2. No seu navegador, vá em Configurações > Página inicial
3. Defina a URL: `http://localhost:8000`
4. Agora toda vez que abrir uma nova aba, verá seus atalhos!

## 📱 Responsividade

O launcher é totalmente responsivo e funciona bem em:
- Desktop
- Tablet
- Mobile

## 🔒 Privacidade

- Todos os dados ficam armazenados localmente no seu computador
- Nenhuma informação é enviada para servidores externos
- Você tem controle total sobre seus dados
- Funciona completamente offline

## 🚀 Melhorias Futuras

- [ ] Categorias para organizar atalhos
- [ ] Busca/filtro de atalhos
- [ ] Temas personalizáveis
- [ ] Importação de bookmarks do navegador
- [ ] Sincronização entre dispositivos
- [ ] Widgets adicionais (clima, notícias, etc.)

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins pessoais e comerciais.
