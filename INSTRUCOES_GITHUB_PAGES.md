# 🚀 Como Hospedar no GitHub Pages

## 📋 Passo a Passo Completo

### 1️⃣ **Criar Conta no GitHub**
- Acesse: https://github.com
- Clique em "Sign up" se não tiver conta
- Faça login se já tiver conta

### 2️⃣ **Criar Novo Repositório**
1. Clique no botão **"+"** no canto superior direito
2. Selecione **"New repository"**
3. Configure o repositório:
   - **Repository name**: `banco-de-horas` (ou nome de sua escolha)
   - **Description**: `Sistema de Banco de Horas com cálculo automático`
   - ✅ Marque **"Public"** (obrigatório para GitHub Pages gratuito)
   - ✅ Marque **"Add a README file"**
4. Clique em **"Create repository"**

### 3️⃣ **Upload dos Arquivos**

#### Opção A: Via Interface Web (Mais Fácil)
1. No seu repositório, clique em **"uploading an existing file"**
2. Arraste todos os arquivos da pasta `sy`:
   - `index.html` ⭐ (arquivo principal)
   - `banco_horas_automatico.html`
   - `banco_horas_completo.html`
   - `banco_horas_sistema.html`
   - `README.md`
   - Outros arquivos `.html` e `.csv`
3. Escreva uma mensagem: `"Adicionar sistema de banco de horas"`
4. Clique em **"Commit changes"**

#### Opção B: Via Git (Para usuários avançados)
```bash
git clone https://github.com/SEU-USUARIO/banco-de-horas.git
cd banco-de-horas
# Copie todos os arquivos da pasta sy para aqui
git add .
git commit -m "Adicionar sistema de banco de horas"
git push origin main
```

### 4️⃣ **Ativar GitHub Pages**
1. No seu repositório, vá em **"Settings"** (aba no topo)
2. Role para baixo até encontrar **"Pages"** no menu lateral
3. Em **"Source"**, selecione:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (ou `master`)
   - **Folder**: `/ (root)`
4. Clique em **"Save"**

### 5️⃣ **Aguardar Deploy**
- ⏱️ Aguarde 2-5 minutos para o site ficar online
- 🔄 Atualize a página de Settings > Pages
- ✅ Aparecerá uma mensagem verde com o link do seu site

## 🌐 **URL do Seu Site**
Seu site estará disponível em:
```
https://SEU-USUARIO.github.io/banco-de-horas/
```

## 📁 **Estrutura de Arquivos Necessária**
```
seu-repositorio/
├── index.html                    ⭐ (página inicial)
├── banco_horas_automatico.html   (sistema principal)
├── banco_horas_completo.html     (sistema completo)
├── banco_horas_sistema.html      (sistema simples)
├── README.md                     (documentação)
└── outros arquivos...
```

## 🔧 **Solução de Problemas**

### ❌ Site não carrega
- Verifique se o arquivo `index.html` está na raiz
- Aguarde até 10 minutos para propagação
- Verifique se o repositório é público

### ❌ Erro 404
- Confirme que GitHub Pages está ativado
- Verifique se a branch está correta (main/master)
- Certifique-se que os arquivos foram commitados

### ❌ Arquivos não funcionam
- Verifique se todos os arquivos .html foram enviados
- Confirme que não há erros nos nomes dos arquivos
- Teste localmente antes de fazer upload

## 🎯 **Dicas Importantes**

### ✅ **Faça Sempre**
- Use nomes de arquivo sem espaços ou caracteres especiais
- Mantenha o arquivo `index.html` na raiz
- Teste o site após cada atualização

### ❌ **Evite**
- Repositórios privados (GitHub Pages gratuito só funciona com públicos)
- Arquivos muito grandes (limite de 100MB por arquivo)
- Nomes de repositório com caracteres especiais

## 🔄 **Atualizações Futuras**
Para atualizar o site:
1. Edite os arquivos no GitHub (clique no arquivo > ✏️ Edit)
2. Ou faça upload de novos arquivos
3. Commit as mudanças
4. Aguarde 1-2 minutos para atualização automática

## 📞 **Suporte**
- Documentação oficial: https://docs.github.com/pages
- Status do GitHub: https://www.githubstatus.com/

---

**🎉 Parabéns! Seu sistema estará online e acessível de qualquer lugar!**