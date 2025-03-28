const addClientBtn = document.getElementById("add-client-btn");
const modalContainer = document.getElementById("modal-container");
const closeIcon = document.getElementById("close-icon");
const addForm = document.getElementById("add-form");

const deleteBtn = document.querySelectorAll("#delete-btn");

const updateBtn = document.querySelectorAll("#update-btn");
const updateModal = document.getElementById("update-modal");
const closeUpdateIcon = document.getElementById("close-update-icon");
const updateClientBtn = document.getElementById("update-client-btn");

addClientBtn.addEventListener("click", () => {
  modalContainer.classList.add("show");
});

closeIcon.addEventListener("click", () => {
  modalContainer.classList.remove("show");
});

addForm.addEventListener("submit", () => {
  modalContainer.classList.remove("show");
});

deleteBtn.forEach((button) => {
  button.addEventListener("click", (e) => deleteClient(e));
});

updateBtn.forEach((button) => {
  button.addEventListener("click", (e) => showUpdateClientModal(e));
});

closeUpdateIcon.addEventListener("click", () => {
  updateModal.classList.remove("show");
});

updateClientBtn.addEventListener("click", () => {
  updateClient();
  updateModal.classList.remove("show");
});

// delete request to the server
async function deleteClient(e) {
  // grab the client id by its data attribute
  const clientId = e.target.getAttribute("data-id");
  // console.log(clientId);

  try {
    // making a delete request to our server
    const response = await fetch("deleteClient", {
      method: "delete",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: clientId,
      }),
    });
    const data = await response.json();
    console.log(data);
    window.location.reload(); // refresh the page (get request)
  } catch (error) {
    console.error(error);
  }
}

// show update client modal and prepopulate it
function showUpdateClientModal(e) {
  const row = e.target.closest("tr"); // grab the tr element
  // console.log(row);

  const clientId = row.querySelector("td:first-child").textContent;
  const clientName = row.querySelector("td:nth-child(2)").textContent;
  const clientEmail = row.querySelector("td:nth-child(3)").textContent;
  const clientJob = row.querySelector("td:nth-child(4)").textContent;
  const clientRate = row.querySelector("td:nth-child(5)").textContent;

  // prepopulate the inputs
  document.getElementById("update-client-id").value = clientId;
  document.getElementById("update-client-name").value = clientName;
  document.getElementById("update-client-email").value = clientEmail;
  document.getElementById("update-client-job").value = clientJob;
  document.getElementById("update-client-rate").value = clientRate;

  // show the modal
  updateModal.classList.add("show");
}

// put request to the server
async function updateClient() {
  const clientData = {
    id: document.getElementById("update-client-id").value,
    clientName: document.getElementById("update-client-name").value,
    clientEmail: document.getElementById("update-client-email").value,
    clientJob: document.getElementById("update-client-job").value,
    clientRate: document.getElementById("update-client-rate").value,
  };

  try {
    const response = await fetch("updateClient", {
      method: "put",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    });

    const data = await response.json();
    console.log(data);
    window.location.reload();
  } catch (error) {
    console.error(error);
  }
}
