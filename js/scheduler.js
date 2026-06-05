const BOOKINGS_STORAGE_KEY = "ms_bookings";

const SLOTS = [
    {
        id: "seg-09",
        day: "Segunda",
        time: "09:00",
        title: "Planejamento de carreira",
        duration: "50 min",
        description: "Alinhe objetivos, currículo e próximos passos."
    },
    {
        id: "ter-14",
        day: "Terça",
        time: "14:00",
        title: "Portfólio e entrevistas",
        duration: "45 min",
        description: "Revise projetos, narrativa e respostas para entrevistas."
    },
    {
        id: "qua-19",
        day: "Quarta",
        time: "19:00",
        title: "Revisão técnica",
        duration: "60 min",
        description: "Tire dúvidas sobre código, arquitetura e estudos."
    },
    {
        id: "qui-10",
        day: "Quinta",
        time: "10:00",
        title: "Acompanhamento semanal",
        duration: "30 min",
        description: "Ajuste prioridades e acompanhe sua evolução."
    },
    {
        id: "sex-16",
        day: "Sexta",
        time: "16:00",
        title: "Preparação para entregas",
        duration: "45 min",
        description: "Organize tarefas, escopo e próximos entregáveis."
    }
];

function dispatchBookingsChange() {
    window.dispatchEvent(new Event("ms:bookings-changed"));
}

function readBookings() {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);

    if (!raw) {
        return [];
    }

    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function writeBookings(bookings) {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    dispatchBookingsChange();
}

function findSlot(slotId) {
    return SLOTS.find((slot) => slot.id === slotId) || null;
}

function sortBookings(bookings) {
    return [...bookings].sort((left, right) => {
        return SLOTS.findIndex((slot) => slot.id === left.slotId) - SLOTS.findIndex((slot) => slot.id === right.slotId);
    });
}

export function getSlots() {
    const bookings = readBookings();

    return SLOTS.map((slot) => {
        const booking = bookings.find((item) => item.slotId === slot.id) || null;

        return {
            ...slot,
            booking
        };
    });
}

export function getBookings() {
    return sortBookings(readBookings());
}

export function reserveSlot(slotId, user) {
    if (!user) {
        throw new Error("Faça login para reservar um horário.");
    }

    const slot = findSlot(slotId);

    if (!slot) {
        throw new Error("Horário inválido.");
    }

    const bookings = readBookings();
    const existing = bookings.find((booking) => booking.slotId === slotId);

    if (existing) {
        if (existing.userId === user.id) {
            return existing;
        }

        throw new Error("Este horário já foi reservado.");
    }

    const booking = {
        id: `${slotId}-${Date.now()}`,
        slotId,
        day: slot.day,
        time: slot.time,
        title: slot.title,
        duration: slot.duration,
        description: slot.description,
        userId: user.id,
        userName: user.name,
        createdAt: new Date().toISOString()
    };

    bookings.push(booking);
    writeBookings(bookings);

    return booking;
}

export function cancelReservation(slotId, user) {
    if (!user) {
        throw new Error("Faça login para cancelar.");
    }

    const bookings = readBookings();
    const booking = bookings.find((item) => item.slotId === slotId);

    if (!booking) {
        throw new Error("Reserva não encontrada.");
    }

    if (booking.userId !== user.id) {
        throw new Error("Você só pode cancelar reservas feitas com seu usuário.");
    }

    writeBookings(bookings.filter((item) => item.slotId !== slotId));
    return booking;
}

export function getBookingStats() {
    const bookings = getBookings();

    return {
        total: bookings.length,
        available: SLOTS.length - bookings.length,
        nextBooking: bookings[0] || null
    };
}