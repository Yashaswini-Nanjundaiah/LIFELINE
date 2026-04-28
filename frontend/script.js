// LifeLine — Project Disaster Management
// script.js — Shared utility functions

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "" || password === "") {
    showToast("Please enter your User ID and Password.");
    return;
  }
  showToast("Authentication successful. Redirecting...");
  setTimeout(() => { window.location.href = "dashboard.html"; }, 1200);
}

function requestSupplies() {
  const type = document.getElementById("supplyType") ? document.getElementById("supplyType").value : "";
  const qty = document.getElementById("quantity") ? document.getElementById("quantity").value : "";

  if (type === "" || qty === "") {
    showToast("Please fill in all required fields.");
    return;
  }
  showToast(`Requisition for ${qty} unit(s) of ${type} submitted successfully.`);
}

function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Mark active nav link based on current page
document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-item").forEach(link => {
    if (link.getAttribute("href") === page) {
      link.classList.add("active");
    }
  });
});