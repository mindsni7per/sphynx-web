
const LOGIN_URL =
  "https://discord.com/oauth2/authorize?client_id=1565830503817551923&response_type=code&redirect_uri=https%3A%2F%2Fsphynxweb.pages.dev&scope=identify+guilds";

const loginScreen = document.getElementById("loginScreen");
const appContent = document.getElementById("appContent");
const loginMessage = document.getElementById("loginMessage");

// Check whether the backend has authenticated the user.
async function checkLogin() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("error")) {
    loginMessage.textContent =
      "Discord login was cancelled or could not be completed.";
    return;
  }

  try {
    const response = await fetch("/api/me", {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) return;

    const session = await response.json();

    if (session.authenticated === true) {
      loginScreen.hidden = true;
      appContent.hidden = false;

      const userLabel = document.getElementById("userLabel");

      if (userLabel && session.username) {
        userLabel.textContent = session.username;
      }
    }
  } catch (error) {
    console.warn("Could not check login session:", error);
  }
}

document.getElementById("discordLogin").href = LOGIN_URL;
checkLogin();

// SIDEBAR MENU

const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");
const backdrop = document.getElementById("backdrop");

function toggleMenu(open) {
  sidebar.classList.toggle("open", open);
  backdrop.classList.toggle("show", open);
  menuButton.classList.toggle("active", open);

  menuButton.setAttribute("aria-expanded", String(open));
}

menuButton.addEventListener("click", () => {
  toggleMenu(!sidebar.classList.contains("open"));
});

backdrop.addEventListener("click", () => {
  toggleMenu(false);
});

// NAVIGATION

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => {
      item.classList.remove("selected");
    });

    link.classList.add("selected");
    toggleMenu(false);

    showToast(`${link.dataset.page} page is not connected yet.`);
  });
});

// SUPPORT TICKET MODAL

const ticketModal = document.getElementById("ticketModal");
const ticketForm = document.getElementById("ticketForm");

function closeTicketModal() {
  ticketModal.classList.remove("show");
}

document.getElementById("openTicket").addEventListener("click", () => {
  ticketModal.classList.add("show");
  document.getElementById("topic").focus();
});

document.getElementById("closeModal").addEventListener("click", closeTicketModal);
document.getElementById("cancelTicket").addEventListener("click", closeTicketModal);

ticketModal.addEventListener("click", (event) => {
  if (event.target === ticketModal) {
    closeTicketModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTicketModal();
    toggleMenu(false);
  }
});

// FORM SUBMISSION

ticketForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const topic = document.getElementById("topic").value;
  const details = document.getElementById("details").value.trim();

  if (!topic || !details) return;

  // Connect this to your backend to create an actual Discord ticket.
  console.log("Support request:", {
    topic: topic,
    details: details
  });

  ticketForm.reset();
  closeTicketModal();

  showToast("Form submitted. Backend connection is still needed.");
});

// TOAST NOTIFICATION

let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}
