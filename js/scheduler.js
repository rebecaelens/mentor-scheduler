import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

export async function getBookings() {
  try {
    console.log("[Mentor Scheduler] Buscando bookings do Firebase...");
    const snapshot = await getDocs(collection(db, "bookings"));
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log("[Mentor Scheduler] Bookings obtidos:", bookings.length);
    return bookings;
  } catch (error) {
    console.error("[Mentor Scheduler] ERRO ao buscar bookings do Firebase:", error);
    console.error("[Mentor Scheduler] Verifique a configuração do Firebase e as permissões do Firestore");
    throw error;
  }
}

export async function getSlots() {
  try {
    const slots = createSlots();
    console.log("[Mentor Scheduler] Slots criados, total:", slots.length);
    
    const bookings = await getBookings();
    console.log("[Mentor Scheduler] Bookings carregados do Firebase, total:", bookings.length);

    const enrichedSlots = slots.map(slot => ({
      ...slot,
      booking:
        bookings.find(
          booking => booking.slotId === slot.id
        ) || null
    }));
    
    console.log("[Mentor Scheduler] Slots enriquecidos com bookings:", enrichedSlots.length);
    return enrichedSlots;
  } catch (error) {
    console.error("[Mentor Scheduler] ERRO em getSlots:", error);
    throw error;
  }
}

export async function reserveSlot(slotId, user) {
  const bookings = await getBookings();

  const existing = bookings.find(
    booking => booking.slotId === slotId
  );

  if (existing) {
    throw new Error("Este horário já foi reservado.");
  }

  await addDoc(collection(db, "bookings"), {
    slotId,
    userId: user.id,
    userName: user.name,
    createdAt: serverTimestamp()
  });

  window.dispatchEvent(
    new Event("ms:bookings-changed")
  );
}

export async function cancelReservation(slotId, user) {
  const bookings = await getBookings();

  const booking = bookings.find(
    booking =>
      booking.slotId === slotId &&
      booking.userId === user.id
  );

  if (!booking) {
    return;
  }

  await deleteDoc(
    doc(db, "bookings", booking.id)
  );

  window.dispatchEvent(
    new Event("ms:bookings-changed")
  );
}

export async function getBookingStats() {
  const slots = await getSlots();

  const total = slots.filter(
    slot => slot.booking
  ).length;

  const available = slots.filter(
    slot => !slot.booking
  ).length;

  const nextBooking = slots.find(
    slot => slot.booking
  );

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