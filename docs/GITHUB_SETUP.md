# 🚀 Configuração do GitHub Pages

## 📋 Pré-requisitos

- Conta no GitHub
- Repositório público (para GitHub Pages gratuito)
- Conhecimento básico de Git

## 🔧 Passos para Configuração

### 1. Criar Repositório no GitHub

1. Acesse [GitHub.com](https://github.com)
2. Clique em "New repository"
3. Nome sugerido: `banco-de-horas`
4. Marque como **Público**
5. Não inicialize com README (já temos um)
6. Clique em "Create repository"

### 2. Fazer Upload dos Arquivos

#### Opção A: Via Interface Web
1. Na página do repositório, clique em "uploading an existing file"
2. Arraste todos os arquivos da pasta `banco-de-horas-github`
3. Adicione uma mensagem de commit: "Initial commit - Sistema de Banco de Horas"
4. Clique em "Commit changes"

#### Opção B: Via Git (Linha de Comando)
```bash
git init
git add .
git commit -m "Initial commit - Sistema de Banco de Horas"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/banco-de-horas.git
git push -u origin main
```

### 3. Ativar GitHub Pages

1. No repositório, vá em **Settings**
2. Role até a seção **Pages**
3. Em **Source**, selecione **Deploy from a branch**
4. Em **Branch**, selecione **main**
5. Em **Folder**, selecione **/ (root)**
6. Clique em **Save**

### 4. Acessar o Site

- URL será: `https://SEU_USUARIO.github.io/banco-de-horas`
- Pode levar alguns minutos para ficar disponível
- Verifique o status na aba **Actions**

## 🎨 Personalização

### Alterar Título e Descrição
Edite o arquivo `_config.yml`:
```yaml
title: "Seu Título Personalizado"
description: "Sua descrição personalizada"
```

### Configurar URL Personalizada
No arquivo `_config.yml`:
```yaml
url: "https://SEU_USUARIO.github.io"
baseurl: "/SEU_REPOSITORIO"
```

## 📱 Funcionalidades Incluídas

### ✨ Sistema Unificado (Recomendado)
- **Dark Mode** com efeitos laser
- **Relatórios detalhados** por funcionário
- **Atualizações automáticas** semanais
- **Controle de pontualidade**
- **Cálculo automático** de horas extras
- **Exportação CSV**
- **Banco de dados local** (LocalStorage)

### 🔧 Outros Sistemas
- **Sistema Automático**: Cálculo automático básico
- **Sistema Completo**: Funcionalidades avançadas
- **Sistema Simples**: Interface simplificada

## 💾 Banco de Dados

### Estrutura
- **LocalStorage**: Armazenamento local no navegador
- **JSON**: Formato de dados estruturado
- **Backup/Restore**: Funcionalidade de backup automático

### Dados Incluídos
- Funcionários e cargos
- Registros de ponto
- Relatórios e estatísticas
- Configurações do sistema

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura moderna
- **CSS3**: Animações e gradientes
- **JavaScript**: Lógica e interatividade
- **LocalStorage**: Persistência de dados
- **GitHub Pages**: Hospedagem gratuita

## 🔒 Segurança

- Dados armazenados localmente
- Sem envio para servidores externos
- Backup manual disponível
- Código aberto e auditável

## 📞 Suporte

### Problemas Comuns

1. **Site não carrega**
   - Verifique se o repositório é público
   - Aguarde alguns minutos após ativação
   - Verifique a aba Actions para erros

2. **Dados não salvam**
   - Verifique se JavaScript está habilitado
   - Limpe o cache do navegador
   - Teste em modo privado/incógnito

3. **Layout quebrado**
   - Verifique se todos os arquivos foram enviados
   - Confirme a estrutura de pastas
   - Teste em diferentes navegadores

### Melhorias Futuras

- [ ] Integração com APIs de folha de pagamento
- [ ] Relatórios em PDF
- [ ] Notificações de atraso
- [ ] Backup em nuvem
- [ ] App mobile nativo
- [ ] Integração com sistemas de RH

## 📄 Licença

Este projeto é de código aberto. Você pode:
- ✅ Usar comercialmente
- ✅ Modificar o código
- ✅ Distribuir
- ✅ Usar privadamente

## 🎯 Próximos Passos

1. **Teste o sistema** com dados reais
2. **Personalize** cores e layout
3. **Configure backup** automático
4. **Treine usuários** no sistema
5. **Monitore** o uso e performance

---

**💡 Dica**: Mantenha sempre um backup dos dados importantes antes de fazer atualizações no sistema!