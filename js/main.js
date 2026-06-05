import { getCurrentUser, mountGoogleButton, signOut } from "./auth.js";
import { cancelReservation, getBookingStats, getBookings, getSlots, reserveSlot } from "./scheduler.js";

const elements = {
    userInfo: document.getElementById("userInfo"),
    dashboardStats: document.getElementById("dashboardStats"),
    schedulerGrid: document.getElementById("schedulerGrid"),
    bookingsList: document.getElementById("bookingsList")
};

function formatDateTime(dateValue) {
    return new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(dateValue));
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function createLoginModal() {
    const existing = document.getElementById("loginModal");
    if (existing) {
        existing.remove();
    }

    const modal = document.createElement("div");
    modal.id = "loginModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
        <div class="modal-content">
            <button type="button" class="modal-close" data-close-modal aria-label="Fechar">&times;</button>
            <div class="modal-header">
                <h3>Faça login para continuar</h3>
                <p>Para reservar um horário de mentoria, você precisa estar logado.</p>
            </div>
            <div class="modal-body">
                <div id="modalGoogleButton" class="google-button-slot"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const buttonSlot = document.getElementById("modalGoogleButton");
    if (buttonSlot) {
        mountGoogleButton(buttonSlot, async () => {
            closeLoginModal();
            await renderApp();
        });
    }

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeLoginModal();
        }
    });

    document.addEventListener("keydown", handleEscapeKey);

    requestAnimationFrame(() => {
        modal.classList.add("is-open");
    });
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.classList.remove("is-open");
        modal.addEventListener("transitionend", () => modal.remove(), { once: true });
        document.removeEventListener("keydown", handleEscapeKey);
    }
}

function handleEscapeKey(event) {
    if (event.key === "Escape") {
        closeLoginModal();
    }
}

function renderAuth(user) {
    if (user) {
        const avatarSource = user.picture || "./assets/avatar-default.png";

        elements.userInfo.innerHTML = `
            <div class="user-chip">
                <img src="${escapeHtml(avatarSource)}" alt="Avatar do usuário" class="user-avatar user-avatar-image">
                <div>
                    <p class="user-label">Logado como</p>
                    <strong>${escapeHtml(user.name)}</strong>
                </div>
            </div>
            <button type="button" class="btn btn-soft" data-logout>Sair</button>
        `;
        return;
    }

    elements.userInfo.innerHTML = `
        <div class="auth-form">
            <div id="googleSignInButton" class="google-button-slot"></div>
            <p class="auth-hint">Use sua conta Google para entrar e reservar horários.</p>
        </div>
    `;
}

function renderDashboard(stats) {
    const nextBooking = stats.nextBooking
        ? `${stats.nextBooking.day}, ${stats.nextBooking.time}`
        : "Nenhuma agendada";

    const nextOwner = stats.nextBooking
        ? `Com ${escapeHtml(stats.nextBooking.userName)}`
        : "Reserve um horário para começar";

    elements.dashboardStats.innerHTML = `
        <article class="stat-card stat-primary">
            <p>Próxima mentoria</p>
            <h3>${escapeHtml(nextBooking)}</h3>
            <span>${nextOwner}</span>
        </article>
        <article class="stat-card">
            <p>Total de agendamentos</p>
            <h3>${stats.total}</h3>
            <span>Reservas salvas no navegador</span>
        </article>
        <article class="stat-card">
            <p>Vagas disponíveis</p>
            <h3>${stats.available}</h3>
            <span>Horários livres para reservar</span>
        </article>
    `;
}

async function renderSchedule(user) {
    try {
        const slots = await getSlots();
        
        if (!slots || slots.length === 0) {
            console.warn("[Mentor Scheduler] AVISO: Nenhum slot disponível!");
            elements.schedulerGrid.innerHTML = '<div class="empty-state"><strong>Nenhum horário disponível</strong><p>Verifique a configuração do Firebase</p></div>';
            return;
        }

        elements.schedulerGrid.innerHTML = slots.map((slot) => {
        const isBooked = Boolean(slot.booking);
        const isMine = user && slot.booking && slot.booking.userId === user.id;
        const actionLabel = isMine ? "Cancelar" : isBooked ? "Reservado" : "Reservar";
        const actionClass = isMine ? "btn btn-soft" : isBooked ? "btn btn-disabled" : "btn btn-brand";
        const actionAttribute = isMine ? `data-cancel-slot="${slot.id}"` : `data-reserve-slot="${slot.id}"`;
        const statusLabel = isBooked
            ? isMine
                ? `Reservado por você · ${escapeHtml(slot.booking.userName)}`
                : `Reservado por ${escapeHtml(slot.booking.userName)}`
            : "Disponível";

        return `
            <article class="schedule-card ${isBooked ? "is-booked" : ""}">
                <div class="schedule-card-head">
                    <div>
                        <p>${escapeHtml(slot.day)}</p>
                        <h4>${escapeHtml(slot.time)}</h4>
                    </div>

                    <span class="status-pill ${isBooked ? "status-booked" : "status-open"}">${statusLabel}</span>
                </div>

                <div class="schedule-card-body">
                    <h5>${escapeHtml(slot.title)}</h5>
                    <p>${escapeHtml(slot.description)}</p>
                </div>

                <div class="schedule-card-footer">
                    <span>${escapeHtml(slot.duration)}</span>
                    <button type="button" class="${actionClass}" ${isBooked && !isMine ? "disabled" : ""} ${actionAttribute}>${actionLabel}</button>
                </div>
            </article>
        `;
    }).join("");    } catch (error) {
        console.error("[Mentor Scheduler] ERRO ao renderizar schedule:", error);
        elements.schedulerGrid.innerHTML = '<div class="empty-state"><strong>Erro ao carregar horários</strong><p>Verifique o console para mais detalhes</p></div>';
    }}

async function renderBookings() {
    try {
        const bookings = await getBookings();
        console.log("[Mentor Scheduler] Renderizando bookings, total:", bookings.length);

        if (bookings.length === 0) {
            elements.bookingsList.innerHTML = `
                <div class="empty-state">
                    <strong>Nenhuma reserva ainda.</strong>
                    <p>Faça login, escolha um horário e a agenda aparecerá aqui.</p>
                </div>
            `;
            return;
        }

        elements.bookingsList.innerHTML = bookings.map((booking) => {
            console.log("[Mentor Scheduler] Booking processado:", booking);
            return `
                <article class="booking-item">
                    <div>
                        <p>${escapeHtml(booking.day)}, ${escapeHtml(booking.time)}</p>
                        <h4>${escapeHtml(booking.title)}</h4>
                        <span>${escapeHtml(booking.duration)} · ${escapeHtml(booking.userName)}</span>
                    </div>
                    <small>Reservado em ${escapeHtml(formatDateTime(booking.createdAt))}</small>
                </article>
            `;
        }).join("");
    } catch (error) {
        console.error("[Mentor Scheduler] ERRO ao renderizar bookings:", error);
        elements.bookingsList.innerHTML = '<div class="empty-state"><strong>Erro ao carregar reservas</strong><p>Verifique o console</p></div>';
    }
}

async function renderApp() {
    try {
        console.log("[Mentor Scheduler] renderApp iniciando...");
        
        const user = getCurrentUser();
        console.log("[Mentor Scheduler] Usuário atual:", user?.name || "não autenticado");
        
        const stats = await getBookingStats();
        console.log("[Mentor Scheduler] Estatísticas carregadas:", stats);

        renderAuth(user);
        console.log("[Mentor Scheduler] Autenticação renderizada");
        
        renderDashboard(stats);
        console.log("[Mentor Scheduler] Dashboard renderizado");
        
        await renderSchedule(user);
        console.log("[Mentor Scheduler] Horários renderizados, quantidade:", elements.schedulerGrid?.children?.length || 0);
        
        await renderBookings();
        console.log("[Mentor Scheduler] Reservas renderizadas");

        if (!user) {
            const buttonSlot = document.getElementById("googleSignInButton");

            if (buttonSlot) {
                mountGoogleButton(buttonSlot, renderApp);
            }
        }
    } catch (error) {
        console.error("[Mentor Scheduler] ERRO em renderApp:", error);
    }
}

document.addEventListener("click", async (event) => {   
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
        return;
    }

    const reserveButton = target.closest("[data-reserve-slot]");
    const cancelButton = target.closest("[data-cancel-slot]");
    const logoutButton = target.closest("[data-logout]");
    const closeModalButton = target.closest("[data-close-modal]");

    if (closeModalButton) {
        closeLoginModal();
        return;
    }

    if (logoutButton) {
        signOut();
        return;
    }

    if (reserveButton instanceof HTMLElement) {
        const user = getCurrentUser();

        // Se não estiver logado, abre o modal
        if (!user) {
            createLoginModal();
            return;
        }

        try {
            await reserveSlot(
                reserveButton.dataset.reserveSlot,
                user
            );
            await renderApp();
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Não foi possível reservar este horário.");
        }

        return;
    }

    if (cancelButton instanceof HTMLElement) {
        const user = getCurrentUser();

        try {
            await cancelReservation(
                cancelButton.dataset.cancelSlot,
                user
            );

            await renderApp();
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Não foi possível cancelar esta reserva.");
        }
    }
});

window.addEventListener("ms:auth-changed", () => renderApp());
window.addEventListener("ms:bookings-changed", () => renderApp());

console.log("[Mentor Scheduler] Inicializando aplicação...");
renderApp();
