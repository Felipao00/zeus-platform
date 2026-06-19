# ZEUS - Cofre Digital Pessoal Privado

![ZEUS Platform](https://img.shields.io/badge/ZEUS-v1.0.0-000000)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## 📋 Sobre o Projeto

ZEUS é uma plataforma web completa para armazenamento, organização e gerenciamento de arquivos pessoais, fotos, documentos, projetos e informações importantes. Funciona como um cofre digital privado com criptografia avançada e interface moderna.

### ✨ Características Principais

- 🔐 **Autenticação Segura** - Login com JWT e senhas criptografadas com bcrypt
- 📁 **Gerenciamento de Arquivos** - Upload, download, organização em pastas
- 🖼️ **Galeria de Fotos** - Visualização em grid com lightbox e favoritos
- 📋 **Gestão de Projetos** - Acompanhamento de progresso, status e prazos
- 📝 **Notas Privadas** - Editor de texto com formatação e categorização
- 🔗 **Links Importantes** - Salvar e organizar URLs favoritas
- 🛡️ **Cofre Seguro** - Criptografia AES-256 para dados sensíveis
- 🔍 **Busca Global** - Pesquisa em todos os módulos
- 💾 **Sistema de Backup** - Exportação e importação de dados
- 📊 **Dashboard** - Visão geral com estatísticas e atividades recentes
- 🏷️ **Tags e Categorias** - Organização personalizada
- 📱 **Interface Responsiva** - Design adaptável para todos os dispositivos

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **TailwindCSS** para estilização
- **React Router Dom** para navegação
- **Axios** para requisições HTTP
- **Lucide React** para ícones
- **React Dropzone** para upload de arquivos
- **React Hot Toast** para notificações
- **Vite** como bundler

### Backend
- **Node.js** com Express
- **SQLite** (preparado para PostgreSQL)
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Crypto-JS** para criptografia AES-256
- **Multer** para upload de arquivos
- **Helmet** para segurança HTTP
- **Morgan** para logging

## 📦 Instalação

### Pré-requisitos
- Node.js >= 18.0.0
- npm >= 9.0.0

### Backend

```bash
# Entrar no diretório do backend
cd backend

# Instalar dependências
npm install

# Inicializar o banco de dados
npm run db:init

# Iniciar o servidor em desenvolvimento
npm run dev

# Ou iniciar em produção
npm start