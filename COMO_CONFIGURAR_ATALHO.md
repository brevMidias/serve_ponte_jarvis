# 🎯 GUIA PASSO-A-PASSO: Configurar Atalho no Ubuntu

## 📍 IMPORTANTE: Execute no SERVIDOR UBUNTU (não no Windows!)

---

## 🚀 Passo 1: Conectar ao Servidor

No seu terminal/PowerShell do Windows:

```bash
ssh ubuntu@SEU-IP-DO-SERVIDOR
```

Ou use PuTTY se preferir.

---

## 📂 Passo 2: Ir para o Diretório

Depois de conectado ao servidor Ubuntu, execute:

```bash
cd ~/serve_ponte_jarvis
```

Você deve estar em: `/home/ubuntu/serve_ponte_jarvis`

---

## ⬇️ Passo 3: Atualizar do GitHub

```bash
git pull origin main
```

Isso vai baixar todos os novos scripts que criamos.

---

## 🔑 Passo 4: Dar Permissão ao Script

```bash
chmod +x scripts/install-alias.sh
```

Isso torna o script executável.

---

## ⚙️ Passo 5: Executar o Instalador de Atalho

```bash
bash scripts/install-alias.sh
```

**O que aparecerá:**

```
📦 Criando atalho 'update-jarvis'...
✅ Atalho adicionado ao ~/.bashrc

✅ Instalação concluída!

Agora você pode atualizar o servidor de qualquer lugar com:
  update-jarvis

Para ativar agora, execute:
  source ~/.bashrc
```

---

## 🔄 Passo 6: Ativar o Atalho

```bash
source ~/.bashrc
```

Isso recarrega as configurações do bash e ativa o atalho.

---

## ✅ Passo 7: Testar o Atalho

Agora você pode usar o comando de qualquer lugar:

```bash
update-jarvis
```

**Pronto!** O atalho está funcionando! 🎉

---

## 📋 RESUMO COMPLETO (Copie e Cole)

Execute estes comandos **NO SERVIDOR UBUNTU** em sequência:

```bash
# 1. Conectar ao servidor (do Windows)
ssh ubuntu@SEU-IP

# 2. Ir para o diretório (no servidor)
cd ~/serve_ponte_jarvis

# 3. Atualizar do GitHub
git pull origin main

# 4. Dar permissão
chmod +x scripts/install-alias.sh

# 5. Instalar atalho
bash scripts/install-alias.sh

# 6. Ativar
source ~/.bashrc

# 7. Testar
update-jarvis
```

---

## 🎯 Como Funciona o Atalho?

### Antes (Método Longo):
```bash
cd ~/serve_ponte_jarvis
bash scripts/update-server.sh
```

### Depois (Método Rápido):
```bash
update-jarvis
```

**De qualquer diretório!** Você pode estar em `/home`, `/var/log`, ou onde quiser, e o comando `update-jarvis` funcionará!

---

## 🔍 Verificar Se Foi Instalado

Para verificar se o atalho está ativo, execute:

```bash
type update-jarvis
```

**Resultado esperado:**
```
update-jarvis is aliased to `cd /home/ubuntu/serve_ponte_jarvis && bash scripts/update-server.sh'
```

Ou simplesmente teste:
```bash
update-jarvis
```

---

## 💡 Dicas

### 1. O atalho é permanente
Uma vez instalado, funcionará sempre, mesmo após reiniciar o servidor.

### 2. Pode usar de qualquer lugar
Não importa em qual diretório você está:

```bash
cd /
update-jarvis  # ✅ Funciona!

cd /var/log
update-jarvis  # ✅ Funciona!

cd ~
update-jarvis  # ✅ Funciona!
```

### 3. Se não funcionar
Execute novamente:
```bash
source ~/.bashrc
```

---

## 🎬 Exemplo Visual

```
┌─────────────────────────────────────────┐
│ Seu Computador (Windows)                │
│                                         │
│ > ssh ubuntu@servidor                   │
│   Conectando...                         │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Servidor Ubuntu                         │
│                                         │
│ ubuntu@servidor:~$ cd ~/serve_ponte_jarvis
│ ubuntu@servidor:~/serve_ponte_jarvis$ git pull
│ ubuntu@servidor:~/serve_ponte_jarvis$ chmod +x scripts/install-alias.sh
│ ubuntu@servidor:~/serve_ponte_jarvis$ bash scripts/install-alias.sh
│ ✅ Atalho adicionado!                   │
│                                         │
│ ubuntu@servidor:~/serve_ponte_jarvis$ source ~/.bashrc
│                                         │
│ ubuntu@servidor:~/serve_ponte_jarvis$ update-jarvis
│ 🚀 ATUALIZAÇÃO AUTOMÁTICA...            │
│ ✅ CONCLUÍDA COM SUCESSO!               │
└─────────────────────────────────────────┘
```

---

## ❓ Perguntas Frequentes

### Q: Preciso fazer isso toda vez?
**R:** Não! Apenas uma vez. Depois use apenas `update-jarvis`.

### Q: Funciona após reiniciar o servidor?
**R:** Sim! O atalho fica salvo no `.bashrc`.

### Q: E se eu trocar de usuário?
**R:** Cada usuário precisa instalar o atalho separadamente.

### Q: Posso desinstalar?
**R:** Sim, basta editar `~/.bashrc` e remover as linhas do Jarvis.

---

## ✅ Checklist Final

- [ ] Conectado ao servidor Ubuntu via SSH
- [ ] `cd ~/serve_ponte_jarvis`
- [ ] `git pull origin main`
- [ ] `chmod +x scripts/install-alias.sh`
- [ ] `bash scripts/install-alias.sh`
- [ ] `source ~/.bashrc`
- [ ] `update-jarvis` funcionando ✅

---

**Pronto! Agora você tem o comando mais fácil do mundo!** 🎉

Apenas digite `update-jarvis` sempre que fizer push no GitHub! 🚀
