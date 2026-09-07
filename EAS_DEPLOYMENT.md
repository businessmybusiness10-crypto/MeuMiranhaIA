# Acesso online sem manter o desktop ligado

## Replit Deploy

O caminho recomendado para este projeto é o deploy do Replit. O arquivo `.replit` já está configurado para executar `build:online` no build e `start:online` no servidor. O build gera bundles e manifests do Expo Go; o servidor de produção fica ativo na URL pública do Replit.

No Replit, clique em **Deploy** e escolha **Autoscale Deployment**. Depois do primeiro deploy, use a URL pública exibida pelo Replit para abrir a página e escanear o QR Code. O desktop pode ser desligado depois que o deploy terminar.

O endereço precisa continuar o mesmo para o QR não mudar. Se o Replit fornecer um domínio personalizado, use esse domínio no deploy.

O GitHub Pages hospeda apenas a página estática. Ele não executa o Metro/Expo Go. Um QR apontando para `localhost`, LAN ou túnel Ngrok deixa de funcionar quando o computador é desligado. Para o app completo ficar online, use o Replit Deploy configurado acima ou EAS Update.

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

## Chamado Spider e segundo plano

O app agora possui o fluxo inicial de vínculo por código em **Administrador > Chamado Spider**, registro de aparelhos e envio de notificações Expo com título `CHAMADO SPIDER`, som e prioridade alta.

Para uso real em segundo plano:

- Expo Go serve para testar a interface e o fluxo local.
- Notificações push remotas confiáveis exigem um build EAS para iOS/Android e credenciais de push configuradas.
- O servidor deve definir `EXPO_PUBLIC_API_URL` no app e ter `DATABASE_URL` configurada para substituir o armazenamento temporário em memória por PostgreSQL.
- Login Google exige um OAuth Client ID/web redirect URI próprios; não coloque client secrets dentro do app.