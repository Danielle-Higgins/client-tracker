const addClientBtn = document.getElementById("add-client-btn");
const modalContainer = document.getElementById("modal-container");
const closeIcon = document.getElementById("close-icon");
const form = document.getElementById("form");

const deleteBtn = document.getElementById("delete-btn");

addClientBtn.addEventListener("click", () => {
  modalContainer.classList.add("show");
});

closeIcon.addEventListener("click", () => {
  modalContainer.classList.remove("show");
});

form.addEventListener("submit", () => {
  modalContainer.classList.remove("show");
});

deleteBtn.addEventListener("click", () => deleteClient());

async function deleteClient() {}
