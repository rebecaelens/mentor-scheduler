# Mentor Scheduler Demo

Pequeno projeto de demonstração de um agendador de mentorias.

Como usar
- Abra o projeto por um servidor estático local, como o Live Server do VS Code.
- Se preferir terminal, rode `python3 -m http.server 5500` na pasta do projeto e acesse `http://127.0.0.1:5500`.

Configuração do Google Login
- O projeto está configurado com o OAuth Client ID do Google.
- A origem local de teste usada aqui é `http://127.0.0.1:5500`.
- No Google Cloud Console, deixe essa origem autorizada em Authorized JavaScript origins.

Arquitetura
- `css/`: estilos
- `js/`: scripts (auth, scheduler, main)
- `assets/`: imagens e ícones

Observações
- O sistema agora funciona sem Firebase: login simulado, reservas e dashboard ficam salvos em `localStorage`.
- Se você precisar de agendamento em tempo real entre várias pessoas, aí sim vale conectar um backend compartilhado.
