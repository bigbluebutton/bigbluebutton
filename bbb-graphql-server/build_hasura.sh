#!/bin/bash

# Atualizar o sistema e instalar dependências básicas
sudo apt update && sudo apt install -y curl git

# Instalar GHC e Cabal
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:hvr/ghc
sudo apt-get update
sudo apt-get install -y ghc-9.0.1 cabal-install-3.2

# Atualizar as variáveis de ambiente
echo 'export PATH=$PATH:/opt/ghc/bin:/opt/cabal/bin' >> ~/.bashrc
source ~/.bashrc

# Instalar dependências de desenvolvimento do PostgreSQL
sudo apt-get install -y libpq-dev

# Clonar o repositório do Hasura e entrar na pasta
#git clone https://github.com/hasura/graphql-engine.git
wget https://github.com/hasura/graphql-engine/archive/refs/tags/v2.22.0.zip
unzip v2.22.0.zip
mv graphql-engine-2.22.0 graphql-engine
cd graphql-engine

# Construir o projeto com o Cabal
cabal update
cabal build --only-dependencies
cabal build

echo "Hasura compilado com sucesso. Para executar, siga as instruções fornecidas anteriormente."

