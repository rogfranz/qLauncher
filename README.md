# qLauncher - Sistema de Atalhos e Diário

Um launcher moderno e completo para gerenciar atalhos de acesso rápido e manter um diário de anotações, desenvolvido especificamente para ambientes de desenvolvimento e produtividade.

## 🚀 Funcionalidades Principais

### 📌 Sistema de Atalhos

- ✅ **Atalhos Dinâmicos** - Adicionar, editar e remover atalhos personalizados
- ✅ **Atalhos Fixos** - Sistema pré-configurado para versões 8.24 e 8.20
- ✅ **Favicons Automáticos** - Busca automática de ícones dos sites
- ✅ **Configuração de Hosts** - Personalizar URLs base para diferentes versões
- ✅ **Comportamento de Links** - Configurar abertura em mesma aba ou nova aba
- ✅ **Interface Responsiva** - Funciona perfeitamente em desktop, tablet e mobile

### 📝 Sistema de Diário

- ✅ **Anotações Diárias** - Permite registrar a atividades do dia pra não se perder no daily do dia seguinte
- ✅ **Sistema de Cores** - Visual diferenciado por prioridade (hoje, último dia, demais)
- ✅ **Edição e Exclusão** - Gerencie suas anotações facilmente
- ✅ **Backup e Restore** - Exporte e importe seu diário

### 🔧 Funcionalidades Avançadas

- ✅ **IndexedDB** - Armazenamento robusto no navegador
- ✅ **Backup Completo** - Exportar/importar atalhos e diário
- ✅ **Configurações Persistentes** - Salva preferências do usuário
- ✅ **Notificações** - Feedback visual para todas as ações

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3 + Tailwind CSS** - Estilização moderna e responsiva
- **JavaScript ES6+** - Lógica da aplicação
- **jQuery** - Manipulação do DOM
- **IndexedDB** - Banco de dados no navegador
- **Font Awesome** - Ícones
- **Google Favicons API** - Busca automática de favicons

## 📁 Estrutura do Projeto

```
qLauncher/
├── index.html          # Página principal da aplicação
├── script.js           # Lógica principal e gerenciamento de atalhos
├── diary.js            # Sistema de diário com IndexedDB
└── README.md           # Esta documentação
```

## 🚀 Como Usar

### Instalação

1. **Clone ou baixe** os arquivos do projeto
2. **Abra** o arquivo `index.html` no navegador
3. **Pronto!** A aplicação está funcionando

### Uso Básico

#### 📌 Gerenciando Atalhos

1. **Adicionar Atalho**: Clique no botão "+" na área de atalhos
2. **Preencher Dados**: Título, cor, URL
3. **Salvar**: Clique em "Salvar" para adicionar
4. **Usar**: Clique em qualquer atalho para abrir o link
5. **Editar/Remover**: Passe o mouse sobre um atalho e use os botões de ação

#### 📝 Usando o Diário

1. **Nova Anotação**: Clique no botão "+" no painel do diário
2. **Escrever**: Digite sua anotação no campo de texto
3. **Salvar**: Clique no botão de salvar (✓)
4. **Editar**: Clique no ícone de edição em uma anotação existente
5. **Excluir**: Clique no ícone de lixeira para remover

#### ⚙️ Configurações

1. **Abrir Configurações**: Clique no ícone de engrenagem (⚙️)
2. **Configurar Hosts**: Defina URLs base para versões 8.24 e 8.20
3. **Comportamento de Links**: Escolha abrir em mesma aba ou nova aba
4. **Backup**: Exporte/importe seus dados

## 💾 Armazenamento de Dados

### IndexedDB (Atual)

- **Atalhos** - Armazenados em `qLauncherDB.shortcuts`
- **Atalhos Fixos** - Armazenados em `qLauncherDB.fixedShortcuts`
- **Configurações** - Armazenadas em `qLauncherDB.config`
- **Diário** - Armazenado em `LauncherDiary.entries`

### Backup e Restore

- **Exportar Atalhos** - Download em formato JSON
- **Importar Atalhos** - Restaurar de arquivo JSON
- **Exportar Diário** - Backup do diário em JSON
- **Importar Diário** - Restaurar diário de backup

## 🎨 Personalização

### Cores e Temas

- Interface escura com tons de cinza
- Cores personalizáveis para cada atalho
- Sistema de cores do diário baseado em prioridade

### Layout

- Design responsivo com Tailwind CSS
- Grid adaptativo para diferentes tamanhos de tela
- Animações suaves e transições

## 🔧 Funcionalidades Técnicas

### Sistema de Atalhos Fixos

- **Versão 8.24**: Atendente e Solicitante
- **Versão 8.20**: Atendente e Solicitante
- **URLs Configuráveis**: Personalize hosts base
- **Cores Diferenciadas**: Visual distinto por versão

### Sistema de Diário

- **Indexação por Data**: Busca eficiente por período
- **Sistema de Tags**: Organização por categorias
- **Timestamps**: Controle de criação e atualização
- **Interface Intuitiva**: Edição inline e ações rápidas

## 🌐 Como Usar como Página Inicial

### Configuração no Navegador

1. **Chrome/Edge**: Configurações → Página inicial → Adicionar URL
2. **Firefox**: Preferências → Geral → Página inicial
3. **URL**: `file:///caminho/para/qLauncher/index.html`

## 📱 Compatibilidade

- ✅ **Chrome** 80+ (recomendado)
- ✅ **Edge** 80+
- ✅ **Firefox** 75+
- ✅ **Safari** 13+
- ✅ **Mobile** (iOS/Android)

## 🔒 Privacidade e Segurança

- **100% Local** - Todos os dados ficam no seu navegador
- **Sem Servidores** - Nenhuma informação é enviada externamente
- **Offline** - Funciona completamente sem internet
- **Controle Total** - Você possui todos os seus dados

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins pessoais e comerciais.

---

**Desenvolvido com ❤️ para produtividade e organização dos colegas da Qualitor**
