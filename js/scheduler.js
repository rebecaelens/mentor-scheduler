const STORAGE_KEY = "mentor_scheduler_bookings";

const DAYS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira"
];

const TIMES = ["09:00", "12:00", "15:00"];

function createSlots() {
  const slots = [];
  let id = 1;

  for (const day of DAYS) {
    for (const time of TIMES) {
      slots.push({
        id: `slot-${id++}`,
        day,
        time,
        title: "Mentoria Individual",
        description: "Sessão de mentoria personalizada.",
        duration: "2h"
      });
    }
  }

  return slots;
}

function getStoredBookings() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  window.dispatchEvent(new Event("ms:bookings-changed"));
}

export async function getSlots() {
  const slots = createSlots();
  const bookings = getStoredBookings();

  return slots.map(slot => ({
    ...slot,
    booking: bookings.find(b => b.slotId === slot.id) || null
  }));
}

export async function getBookings() {
  return getStoredBookings();
}

export async function reserveSlot(slotId, user) {
  const bookings = getStoredBookings();

  const existing = bookings.find(b => b.slotId === slotId);

  if (existing) {
    throw new Error("Este horário já foi reservado.");
  }

  const slot = createSlots().find(s => s.id === slotId);

  bookings.push({
    slotId,
    userId: user.id,
    userName: user.name,
    day: slot.day,
    time: slot.time,
    title: slot.title,
    duration: slot.duration,
    createdAt: new Date().toISOString()
  });

  saveBookings(bookings);
}

export async function cancelReservation(slotId, user) {
  const bookings = getStoredBookings();

  const filtered = bookings.filter(
    booking =>
      !(booking.slotId === slotId && booking.userId === user?.id)
  );

  saveBookings(filtered);
}

export async function getBookingStats() {
  const slots = await getSlots();

  const total = slots.filter(slot => slot.booking).length;
  const available = slots.filter(slot => !slot.booking).length;

  const nextBooking = slots.find(slot => slot.booking);

  return {
    total,
    available,
    nextBooking: nextBooking
      ? {
          day: nextBooking.day,
          time: nextBooking.time,
          userName: nextBooking.booking.userName
        }
      : null
  };
}