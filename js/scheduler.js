import { db } from "./firebase.js";
import { MENTORS, BOOKING_STATUS, BOOKING_STATUS_LABELS } from "./data.js";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  query,
  where
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

export function getMentor(mentorId) {
  return MENTORS.find(m => m.id === mentorId);
}

export function getAllMentors() {
  return MENTORS;
}

export async function reserveSlot(slotId, user) {
  const bookings = await getBookings();

  const existing = bookings.find(
    booking => booking.slotId === slotId && booking.status !== BOOKING_STATUS.CANCELLED
  );

  if (existing) {
    throw new Error("Este horário já foi reservado.");
  }

  const randomMentor = MENTORS[Math.floor(Math.random() * MENTORS.length)];

  await addDoc(collection(db, "bookings"), {
    slotId,
    userId: user.id,
    userName: user.name,
    mentorId: randomMentor.id,
    mentorName: randomMentor.name,
    mentorSpecialty: randomMentor.specialty,
    status: BOOKING_STATUS.CONFIRMED,
    createdAt: serverTimestamp(),
    scheduledAt: null,
    completedAt: null
  });

  window.dispatchEvent(
    new Event("ms:bookings-changed")
  );
}

export async function updateBookingStatus(bookingId, newStatus) {
  if (!Object.values(BOOKING_STATUS).includes(newStatus)) {
    throw new Error("Status inválido.");
  }

  const bookingRef = doc(db, "bookings", bookingId);
  const updateData = { status: newStatus };

  if (newStatus === BOOKING_STATUS.COMPLETED) {
    updateData.completedAt = serverTimestamp();
  }

  await updateDoc(bookingRef, updateData);

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
  const bookings = await getBookings();

  const total = bookings.length;
  const available = slots.filter(slot => !slot.booking).length;
  
  const byStatus = {
    confirmed: bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length,
    completed: bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length,
    cancelled: bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED).length,
    no_show: bookings.filter(b => b.status === BOOKING_STATUS.NO_SHOW).length,
    pending: bookings.filter(b => b.status === BOOKING_STATUS.PENDING).length
  };

  const nextBooking = bookings
    .filter(b => b.status === BOOKING_STATUS.CONFIRMED)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];

  const activeMentors = new Set(bookings.map(b => b.mentorId)).size;

  return {
    total,
    available,
    byStatus,
    activeMentors,
    nextBooking: nextBooking
      ? {
          day: slots.find(s => s.id === nextBooking.slotId)?.day || "N/A",
          time: slots.find(s => s.id === nextBooking.slotId)?.time || "N/A",
          userName: nextBooking.userName,
          mentorName: nextBooking.mentorName,
          mentorSpecialty: nextBooking.mentorSpecialty
        }
      : null
  };
}
