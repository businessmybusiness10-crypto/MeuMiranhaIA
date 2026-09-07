# Miranha IA

Aplicativo multiplataforma feito com Expo para iOS, iPad e Android, acompanhado de um control center web para acompanhar a disponibilidade da API.

## O que existe hoje

- App nativo com Expo Router e layout responsivo.
- Identificadores nativos configurados para iOS e Android.
- Endpoint `GET /api/healthz` para health check.
- Endpoint `GET /api/system/status` com ambiente, versão, uptime, memoria e timestamp.
- Painel web responsivo com atualizacao automatica a cada 30 segundos.

## Publicacao

Defina `APP_VERSION` no servidor e `VITE_API_URL` no painel quando a API estiver em outro dominio. Para gerar os aplicativos nativos, use o EAS Build:

```bash
pnpm --filter @workspace/miranha-ia exec eas build --platform ios
pnpm --filter @workspace/miranha-ia exec eas build --platform android
```

Antes de disponibilizar o painel publicamente, substitua o administrador local por autenticacao no servidor e conecte o conteudo a um banco persistente. O estado atual do app ainda usa armazenamento local do dispositivo.

## GitHub

O link do portfólio no painel usa `VITE_GITHUB_URL`. Configure essa variavel com a URL do repositorio antes da publicacao.