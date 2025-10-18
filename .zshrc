
#### ZSHRC DA SOL - LIMPO, SIMPLES E SEM ERROS
#### Colar tudo em: ~/.zshrc
####

#### 1) PATH básico decente
# Garante que binários comuns estejam no PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

#### 2) Homebrew (Intel e Apple Silicon)
# Apple Silicon (M1/M2/M3) - Homebrew fica em /opt/homebrew
if [ -x /opt/homebrew/bin/brew ]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi
# Intel - Homebrew costuma ficar em /usr/local
if [ -x /usr/local/bin/brew ]; then
  eval "$(/usr/local/bin/brew shellenv)"
fi

#### 3) NVM (Node Version Manager) - CORRIGIDO PARA NÃO CAUSAR LENTIDÃO
# Só ativa se existir
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # export NVM_DIR="$HOME/.nvm"
  # [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

#### 4) Chaves/API Keys (NÃO QUEBRE A LINHA!)
# IMPORTANTE: Se você tem uma chave começando com sk-proj-... (OpenAI),