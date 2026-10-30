
const LOGIN_URL = "/oauth/login";

const loginScreen = document.getElementById("loginScreen");
const appContent = document.getElementById("appContent");
const loginError = document.getElementById("loginError");
const usernameDisplay = document.getElementById("username");

document.getElementById("discordLogin").href = LOGIN_URL;

// AUTHENTICATION
async function checkLogin() {
  try {
    const response = await fetch("/api/me", {
      method: "GET",
      credentials: "include",
      cache: "no-store"
    });

    if (!response.ok) throw new Error("Login check failed");

    const session = await response.json();

    if (session.authenticated === true) {
      loginScreen.hidden = true;
      appContent.hidden = false;
      usernameDisplay.textContent = session.username;
    } else {
      loginScreen.hidden = false;
      appContent.hidden = true;
    }
  } catch (error) {
    loginScreen.hidden = false;
    appContent.hidden = true;
    showLoginError("Unable to verify your login. Please try again.");
  }
}

function showLoginError(message) {
  loginError.textContent = message;
  loginError.hidden = false;
}

// DISCORD LOGIN ERRORS
const params = new URLSearchParams(window.location.search);
const error = params.get("error");

if (error) {
  showLoginError(error);
  window.history.replaceState({}, document.title, "/");
}

// LOGOUT
document.getElementById("logoutButton").addEventListener("click", async () => {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include"
    });

    window.location.reload();
  } catch {
    showToast("Unable to log out. Try again.");
  }
});

// SIDEBAR
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    document.querySelectorAll(".page").forEach(page => {
      page.hidden = true;
    });

    const selectedPage = document.getElementById(button.dataset.page);

    if (selectedPage) selectedPage.hidden = false;

    sidebar.classList.remove("open");
  });
});

// TICKET MODAL
const ticketModal = document.getElementById("ticketModal");

document.getElementById("openTicket").addEventListener("click", () => {
  ticketModal.hidden = false;
});

document.getElementById("closeTicketModal").addEventListener("click", () => {
  ticketModal.hidden = true;
});

ticketModal.addEventListener("click", event => {
  if (event.target === ticketModal) {
    ticketModal.hidden = true;
  }
});

// TICKET FORM
document.getElementById("ticketForm").addEventListener("submit", event => {
  event.preventDefault();

  showToast("Ticket backend is not connected yet.");
  ticketModal.hidden = true;
  event.target.reset();
});

// TOAST
function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.hidden = false;

  setTimeout(() => {
    toast.hidden = true;
  }, 3000);
}

// START
checkLogin();
