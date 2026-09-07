const photos = [
  "assets/photo-1.jpg?v=20260907-3",
  "assets/photo-2.jpg?v=20260907-3",
  "assets/photo-3.jpg?v=20260907-3",
];

const opening = document.querySelector("#opening");
const openButton = document.querySelector("#openInvitation");
const flowerConfetti = document.querySelector("#flowerConfetti");
const music = document.querySelector("#music");
const musicButton = document.querySelector("#musicButton");
const musicTip = document.querySelector("#musicTip");

let activeSlide = 0;
let lightboxSlide = 0;
let musicPlaying = false;
let autoScrollFrame;
let autoScrollLastTime;
let autoScrollController;
let autoScrollPosition;

function setMusicState(playing) {
  musicPlaying = playing;
  musicButton.classList.toggle("playing", playing);
  musicButton.setAttribute("aria-pressed", String(playing));
  musicButton.setAttribute("aria-label", playing ? "Хөгжмийг түр зогсоох" : "Хөгжим тоглуулах");
}

async function playMusic() {
  try {
    await music.play();
    setMusicState(true);
  } catch {
    setMusicState(false);
    musicTip.classList.add("visible");
    window.setTimeout(() => musicTip.classList.remove("visible"), 2600);
  }
}

function releaseFlowerConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const symbols = ["✿", "❀", "❁", "✦"];
  const colors = ["#858a74", "#ebe2d8", "#c3908a", "#e3c5a0", "#bd9360", "#bda99b"];
  const origin = openButton.getBoundingClientRect();
  const originX = origin.left + origin.width / 2;
  const originY = origin.top + origin.height / 2;

  flowerConfetti.replaceChildren();
  for (let index = 0; index < 30; index += 1) {
    const piece = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 30 + (Math.random() - 0.5) * 0.35;
    const distance = 170 + Math.random() * Math.min(window.innerWidth * 0.28, 390);

    piece.className = "confetti-piece";
    piece.textContent = symbols[index % symbols.length];
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.color = colors[index % colors.length];
    piece.style.setProperty("--confetti-x", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--confetti-y", `${Math.sin(angle) * distance - 65}px`);
    piece.style.setProperty("--confetti-rotation", `${180 + Math.random() * 540}deg`);
    piece.style.setProperty("--confetti-scale", String(0.75 + Math.random() * 0.75));
    piece.style.animationDelay = `${Math.random() * 120}ms`;
    flowerConfetti.append(piece);
  }
}

function stopAutoScroll() {
  if (autoScrollFrame) window.cancelAnimationFrame(autoScrollFrame);
  autoScrollFrame = undefined;
  autoScrollLastTime = undefined;
  autoScrollPosition = undefined;
  autoScrollController?.abort();
  autoScrollController = undefined;
}

function startAutoScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  stopAutoScroll();
  autoScrollController = new AbortController();
  const { signal } = autoScrollController;
  const interactionEvents = ["wheel", "touchstart", "pointerdown"];
  interactionEvents.forEach((eventName) => {
    window.addEventListener(eventName, stopAutoScroll, { passive: true, signal });
  });
  window.addEventListener("keydown", stopAutoScroll, { signal });

  const scrollSpeed = 48;
  autoScrollPosition = window.scrollY;
  const scrollStep = (time) => {
    if (autoScrollLastTime === undefined) autoScrollLastTime = time;
    const elapsed = Math.min(time - autoScrollLastTime, 50);
    autoScrollLastTime = time;
    autoScrollPosition += (scrollSpeed * elapsed) / 1000;
    window.scrollTo(0, autoScrollPosition);

    const pageBottom = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY < pageBottom - 1) {
      autoScrollFrame = window.requestAnimationFrame(scrollStep);
    } else {
      stopAutoScroll();
    }
  };

  autoScrollFrame = window.requestAnimationFrame(scrollStep);
}

function openInvitation() {
  if (opening.classList.contains("is-opening")) return;

  openButton.disabled = true;
  opening.classList.add("is-opening");
  releaseFlowerConfetti();
  playMusic();

  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 950;
  window.setTimeout(() => {
    opening.classList.add("hidden");
    document.body.classList.add("opened");
    window.setTimeout(() => flowerConfetti.replaceChildren(), 500);
    window.setTimeout(startAutoScroll, 900);
  }, delay);
}

openButton.addEventListener("click", openInvitation);

if (new URLSearchParams(window.location.search).has("open")) {
  opening.classList.add("hidden");
  window.setTimeout(() => musicTip.classList.add("visible"), 700);
  window.setTimeout(() => musicTip.classList.remove("visible"), 3400);
}

musicButton.addEventListener("click", async () => {
  if (musicPlaying) {
    music.pause();
    setMusicState(false);
  } else {
    await playMusic();
  }
});

music.addEventListener("pause", () => setMusicState(false));
music.addEventListener("play", () => setMusicState(true));

const calendarGrid = document.querySelector("#calendarGrid");
const leadingBlanks = 1;
for (let index = 0; index < leadingBlanks; index += 1) {
  calendarGrid.append(document.createElement("span"));
}
for (let day = 1; day <= 30; day += 1) {
  const cell = document.createElement("span");
  cell.textContent = String(day);
  if (day === 23) {
    cell.className = "wedding-day";
    cell.setAttribute("aria-label", "Хуримын өдөр, есдүгээр сарын 23");
  }
  calendarGrid.append(cell);
}

const countdown = document.querySelector("#countdown");
const countdownDays = document.querySelector("#countdownDays");
const countdownHours = document.querySelector("#countdownHours");
const countdownMinutes = document.querySelector("#countdownMinutes");
const countdownSeconds = document.querySelector("#countdownSeconds");
const weddingTime = new Date("2026-09-23T17:00:00+08:00").getTime();
let countdownTimer;

function updateCountdown() {
  const remainingSeconds = Math.max(0, Math.floor((weddingTime - Date.now()) / 1000));
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  countdownDays.textContent = String(days);
  countdownHours.textContent = String(hours).padStart(2, "0");
  countdownMinutes.textContent = String(minutes).padStart(2, "0");
  countdownSeconds.textContent = String(seconds).padStart(2, "0");
  countdown.setAttribute(
    "aria-label",
    `Хурим болоход ${days} өдөр ${hours} цаг ${minutes} минут ${seconds} секунд`,
  );

  if (remainingSeconds === 0) window.clearInterval(countdownTimer);
}

updateCountdown();
if (weddingTime > Date.now()) {
  countdownTimer = window.setInterval(updateCountdown, 1000);
}

const photoCards = [...document.querySelectorAll(".photo-card")];
const dots = [...document.querySelectorAll(".carousel-dots button")];
const carousel = document.querySelector("#carousel");
let autoplayTimer;

function updateCarousel() {
  photoCards.forEach((card, index) => {
    const relative = (index - activeSlide + photoCards.length) % photoCards.length;
    const position = relative === 0 ? "active" : relative === 1 ? "right" : "left";
    card.dataset.position = position;
    card.setAttribute("aria-current", position === "active" ? "true" : "false");
  });
  dots.forEach((dot, index) => dot.classList.toggle("active", index === activeSlide));
}

function stepCarousel(direction) {
  activeSlide = (activeSlide + direction + photos.length) % photos.length;
  updateCarousel();
}

function startCarouselAutoplay() {
  window.clearInterval(autoplayTimer);
  autoplayTimer = window.setInterval(() => {
    if (!document.hidden && !lightbox.open) stepCarousel(1);
  }, 1500);
}

function restartCarouselAutoplay() {
  startCarouselAutoplay();
}

document.querySelector(".carousel-arrow.prev").addEventListener("click", () => {
  stepCarousel(-1);
  restartCarouselAutoplay();
});
document.querySelector(".carousel-arrow.next").addEventListener("click", () => {
  stepCarousel(1);
  restartCarouselAutoplay();
});
dots.forEach((dot) => dot.addEventListener("click", () => {
  activeSlide = Number(dot.dataset.slide);
  updateCarousel();
  restartCarouselAutoplay();
}));

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");

function setLightboxPhoto(index) {
  lightboxSlide = (index + photos.length) % photos.length;
  lightboxImage.src = photos[lightboxSlide];
  lightboxImage.alt = `Хуримын зураг ${lightboxSlide + 1}`;
}

photoCards.forEach((card) => card.addEventListener("click", () => {
  const index = Number(card.dataset.index);
  if (index !== activeSlide) {
    activeSlide = index;
    updateCarousel();
    return;
  }
  setLightboxPhoto(index);
  lightbox.showModal();
}));

document.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
document.querySelector(".lightbox-prev").addEventListener("click", () => setLightboxPhoto(lightboxSlide - 1));
document.querySelector(".lightbox-next").addEventListener("click", () => setLightboxPhoto(lightboxSlide + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
carousel.addEventListener("mouseenter", () => window.clearInterval(autoplayTimer));
carousel.addEventListener("mouseleave", startCarouselAutoplay);
carousel.addEventListener("focusin", () => window.clearInterval(autoplayTimer));
carousel.addEventListener("focusout", startCarouselAutoplay);

const rsvpForm = document.querySelector("#rsvpForm");
const formMessage = document.querySelector("#formMessage");
const confirmRsvp = document.querySelector("#confirmRsvp");

function getSupabaseConfig() {
  const config = window.SUPABASE_CONFIG || {};
  const url = String(config.url || "").trim().replace(/\/+$/, "");
  const publishableKey = String(config.publishableKey || "").trim();

  if (!/^https?:\/\//.test(url) || !publishableKey || publishableKey.startsWith("YOUR_")) {
    throw new Error("Supabase is not configured");
  }

  return { url, publishableKey };
}

async function saveRsvp(guestName, attending) {
  const { url, publishableKey } = getSupabaseConfig();
  const headers = {
    apikey: publishableKey,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };

  // Legacy anon keys are JWTs and remain compatible with Bearer authentication.
  if (publishableKey.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${publishableKey}`;
  }

  const response = await fetch(`${url}/rest/v1/wedding_rsvps`, {
    method: "POST",
    headers,
    body: JSON.stringify({ guest_name: guestName, attending }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase RSVP request failed with status ${response.status}`);
  }
}

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(rsvpForm);
  const guest = String(data.get("guestName") || "").trim();
  const attending = data.get("attending") === "yes";

  confirmRsvp.disabled = true;
  confirmRsvp.textContent = "Илгээж байна…";
  formMessage.classList.remove("error");
  formMessage.textContent = "";

  try {
    await saveRsvp(guest, attending);
    formMessage.textContent = attending
      ? `Баярлалаа, ${guest}. Тантай хамт баяраа тэмдэглэхийг тэсэн ядан хүлээж байна!`
      : `Мэдэгдсэнд баярлалаа, ${guest}.`;
    rsvpForm.reset();
  } catch (error) {
    formMessage.classList.add("error");
    formMessage.textContent = error.message === "Supabase is not configured"
      ? "RSVP тохиргоо хараахан хийгдээгүй байна."
      : "Илгээхэд алдаа гарлаа. Та дахин оролдоно уу.";
  } finally {
    confirmRsvp.disabled = false;
    confirmRsvp.textContent = "Баталгаажуулах";
  }
});

updateCarousel();
startCarouselAutoplay();
