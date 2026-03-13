# Gestão Pessoal iOS v3.1

Base ajustada para gerar um **IPA para usar no Sideloadly**.

## O que mudou nesta versão

- removi a dependência de assinatura no workflow principal do Codemagic
- o workflow principal agora gera um `.app` para **iphoneos** sem assinatura e depois empacota isso em um `.ipa`
- mantive um workflow separado para simulador
- README atualizado para fluxo com **Sideloadly no PC**

## Workflows incluídos

### `ios-sideloadly-ipa`
Workflow principal. Gera:
- `GestaoPessoal-sideloadly.ipa`
- `.app` gerado no build
- `dSYM`

Esse é o workflow para você usar no Codemagic e depois baixar o IPA.

### `ios-simulator-unsigned`
Workflow auxiliar para validar compilação para simulador.

## Como usar com GitHub + Codemagic + Sideloadly

1. Suba este projeto para o GitHub.
2. No Codemagic, conecte o repositório.
3. Faça o scan do `codemagic.yaml` na raiz.
4. Rode o workflow **`ios-sideloadly-ipa`**.
5. Baixe o arquivo `GestaoPessoal-sideloadly.ipa` nos artifacts.
6. Abra o Sideloadly no seu PC.
7. Selecione o IPA e instale no iPhone com seu Apple ID.

## Observações importantes

### 1. Sem assinatura no Codemagic
Este projeto está ajustado para o cenário em que **o Codemagic só compila e empacota**.
A assinatura para instalar no iPhone fica por conta do **Sideloadly**.

### 2. Atualizar sem perder o app
Quando você quiser instalar uma versão nova por cima da antiga, mantenha:
- o mesmo **bundle id**
- o mesmo **Apple ID** no Sideloadly

### 3. Limites do Sideloadly
Com conta Apple gratuita, os apps sideloaded costumam expirar em **7 dias**.

### 4. Developer Mode
No iPhone, o **Developer Mode** precisa estar ativado para instalar apps por sideload.

### 5. Backup interno do app
Como o app tem exportação/importação JSON, isso ajuda caso você reinstale o app ou precise renovar a instalação.

## Rodar localmente na web

```bash
npm install
npm run dev
```

## Preparar iOS localmente

```bash
npm install
npm run build
npm run cap:add:ios
npm run cap:sync
npm run ios
```

Se a pasta `ios/` já existir:

```bash
npm run build
npm run cap:sync
```

## Dependências principais

- `@capacitor/core`
- `@capacitor/cli`
- `@capacitor/ios`
- `@capacitor/filesystem`
- `@capacitor/share`
- `@capacitor-community/sqlite`

## Arquivos principais

- `codemagic.yaml`
- `capacitor.config.ts`
- `src/db/native-sqlite.ts`
- `src/db/storage.ts`
- `src/features/finance/finance.service.ts`
- `src/features/categories/categories.service.ts`
- `src/backup/backup.service.ts`
