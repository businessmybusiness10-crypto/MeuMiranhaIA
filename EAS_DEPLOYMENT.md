# Acesso online sem manter o desktop ligado

O GitHub Pages hospeda a página e o QR Code, mas não executa o Metro/Expo Go. Um QR apontando para `localhost`, LAN ou túnel Ngrok deixa de funcionar quando o computador é desligado.

Para manter o app disponível, publique uma atualização no EAS Update:

```powershell
corepack pnpm dlx eas-cli login
corepack pnpm dlx eas-cli init
corepack pnpm dlx eas-cli update --branch production --message "Atualizacao online"
```

O comando `eas init` vincula o app a um projeto Expo e grava o `projectId` no `app.json`. Depois disso, use o link/QR do canal `production` no site, em vez de uma URL `exp://` do computador.

Para publicação automática pelo GitHub Actions:

1. Crie um token em `expo.dev`.
2. No GitHub, abra `Settings > Secrets and variables > Actions > Secrets`.
3. Crie o segredo `EXPO_TOKEN`.
4. Execute o comando EAS Update no workflow de deploy.

O conteúdo salvo no app ainda usa AsyncStorage local. EAS mantém o código online, mas não sincroniza mensagens ou configurações entre dispositivos; essa sincronização exige uma API autenticada e banco persistente.