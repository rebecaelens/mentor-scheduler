# 🎯 Mentor Scheduler - Quick Demo Guide

## Para Recrutador: O que Você Vai Ver

### 1. **Primeira Impressão - Hero Section**
- ✨ Layout profissional com título "Mentor Scheduler"
- 📱 Design responsivo (mobile + desktop)
- 🎨 Paleta de cores moderna

---

### 2. **Dashboard - KPIs em Tempo Real**
```
┌─────────────────┬──────────────┬──────────────────┬─────────────────┐
│ Próx. Mentoria  │ Agendamentos │ Mentores Ativos  │ Vagas Disponíveis
├─────────────────┼──────────────┼──────────────────┼─────────────────┤
│ Sex, 14:00      │ 3 confirmadas│ 2 profissionais  │ 12 horários
│ Com Ana Silva   │ 1 concluída  │ em atividade     │ livres
│ Frontend React  │              │                  │
└─────────────────┴──────────────┴──────────────────┴─────────────────┘
```

---

### 3. **Seção de Mentores - Portfolio Visual**
Cards exibindo:
- 📸 Avatar do mentor
- 👤 Nome + Especialidade
- 💻 Stack de tecnologias (3 principais)
- 🔗 Link direto para LinkedIn

**Mentores:**
1. **Ana Silva** - Frontend React
2. **Carlos Santos** - Backend Node.js
3. **Mariana Costa** - DevOps & Cloud

---

### 4. **Seção de Horários - Busca em Tempo Real**
- 🔍 Campo de busca: "Buscar por mentor, dia ou horário..."
- Teste digitando: "React", "Carlos", "09:00"
- Cards mostram:
  - 📅 Dia + Hora
  - 👥 Mentor disponível
  - 📊 Status (Disponível/Reservado)
  - ⏱️ Duração (2h)

---

### 5. **Agenda de Mentorias - Com Status Visual**
Após reservar um horário:

```
┌──────────────────────────────────────────────────────┐
│ Ana Silva                               ✅ Confirmada
│ Frontend React                                        │
│ Especialista em React e performance                  │
│ Reservado em: 5 de jun de 2026, 10:00              │
└──────────────────────────────────────────────────────┘
```

Status com cores:
- 🟢 **Confirmada** (Verde)
- 🔵 **Concluída** (Azul)
- 🔴 **Cancelada** (Vermelho)
- ⚫ **Não compareceu** (Cinza)

---

## 🧪 Como Testar (Passo a Passo)

### 1. **Abrir o Projeto**
```bash
cd /Users/rebecasales/mentor-scheduler-demo
```

Abra no VS Code: `code .`

Inicie Live Server:
- Botão direito em `index.html`
- "Open with Live Server"
- Acesse: `http://127.0.0.1:5500/index.html`

---

### 2. **Testar Dashboard**
✅ Você deve ver:
- Título "Próxima mentoria"
- 4 cards com métricas
- Nomes dos mentores em dados de exemplo

---

### 3. **Testar Seção de Mentores**
✅ Você deve ver:
- 3 cards com perfis dos mentores
- Fotos (avatares gerados automaticamente)
- Links para LinkedIn

---

### 4. **Testar Filtro de Busca**
1. Clique no campo: "🔍 Buscar por mentor..."
2. Digite: `React`
   - Apenas horários com "Ana Silva" devem aparecer
3. Limpe e digite: `09:00`
   - Apenas horários das 9h da manhã aparecem
4. Limpe para ver todos de novo

---

### 5. **Testar Autenticação**
1. Clique em "Faça login"
2. Use sua conta Google
3. Após login, você verá seu avatar no topo

---

### 6. **Testar Agendamento**
1. Após login, clique em "Reservar" em qualquer horário
2. Ele receberá um mentor atribuído aleatoriamente
3. A reserva aparecerá em "Próximas mentorias"
4. Status será "✅ Confirmada" (verde)

---

### 7. **Testar Status Visual** (Via Console)
Abra F12 (DevTools) e execute:
```javascript
// Atualizar status de uma reserva para "Concluída"
(async () => {
  const { updateBookingStatus } = await import('./js/scheduler.js');
  const { getBookings } = await import('./js/scheduler.js');
  const bookings = await getBookings();
  if (bookings.length > 0) {
    await updateBookingStatus(bookings[0].id, "completed");
  }
})()
```

Você verá a badge mudar para 🔵 **Concluída**

---

## 📊 Dados Técnicos que Impressionam

### Tech Stack
- ✅ **Frontend**: Vanilla JS (sem frameworks)
- ✅ **Backend**: Firebase Firestore
- ✅ **Autenticação**: Google Sign-In
- ✅ **Deploy**: Live Server / GitHub Pages ready

### Arquitetura
```
Mentor Scheduler
├── Módular (main.js, scheduler.js, auth.js, data.js)
├── Responsivo (mobile first)
├── Sem bibliotecas externas
├── Performance otimizada
└── Preparado para escalar
```

### Segurança
- ✅ XSS Protection (escapeHtml)
- ✅ .gitignore configurado
- ✅ Validação de inputs
- ✅ Credenciais protegidas

---

## 🎬 Roteiro para Apresentar (5 minutos)

### 1️⃣ **Visão Geral** (1 min)
_"Criei uma plataforma de agendamento de mentorias com:"_
- Dashboard com KPIs
- Perfis de mentores
- Sistema de status
- Filtro em tempo real

### 2️⃣ **Demo Visual** (2 min)
- Mostrar dashboard com métricas
- Rolar para ver mentores
- Demonstrar busca digitando "React"
- Fazer um login rápido

### 3️⃣ **Funcionalidades Técnicas** (1 min)
- "Sem bibliotecas externas - só vanilla JS"
- "Firebase para escalabilidade"
- "Sistema de status para rastreamento completo"
- "Pronto para integrar Google Calendar"

### 4️⃣ **Perguntas & Encerramento** (1 min)
- "O código está no GitHub"
- "Documentação completa em MELHORIAS.md"
- "Pronto para integrar com APIs e webhooks"

---

## 📚 Arquivos Importantes para Mostrar

Se perguntarem "cadê o código?":
- `js/scheduler.js` - Lógica de negócio (67 linhas, bem documentada)
- `js/data.js` - Dados de mentores + constantes (35 linhas)
- `js/main.js` - UI/UX (270+ linhas, bem estruturado)
- `index.html` - Template semântico
- `MELHORIAS.md` - Roadmap profissional

---

## 🎁 Extras Mencionáveis

Se tiver tempo extra:
- ✅ "Sistema pronto para Google Calendar sync"
- ✅ "Notificações por email preparadas"
- ✅ "Pronto para adicionar pagamento (Stripe)"
- ✅ "Dashboard pode integrar gráficos (Chart.js)"
- ✅ "Mobile app ready (React Native com mesmo backend)"

---

## 🚨 Se Algo Não Funcionar

### Problema: Horários vazios
**Solução**: Pressione F12, veja os logs `[Mentor Scheduler]`

### Problema: Firebase não conecta
**Solução**: Verifique internet, firewall, ou Security Rules do Firestore

### Problema: Google login não funciona
**Solução**: Verifique se o projeto Firebase tem autenticação habilitada

---

## ✨ Pontos Fortes para Destacar

1. **Profissionalismo** - Parece um produto real
2. **Escalabilidade** - Arquitetura preparada para crescer
3. **UX** - Interface limpa e intuitiva
4. **Código Limpo** - Sem spaghetti code
5. **Documentação** - Tudo explicado
6. **Segurança** - Boas práticas implementadas

---

**Status: 🟢 Pronto para apresentar!**

Boa sorte na entrevista! 🚀
