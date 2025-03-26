const addClientBtn = document.getElementById("add-client-btn");
const modalContainer = document.getElementById("modal-container");
const closeIcon = document.getElementById("close-icon");
const form = document.getElementById("form");

const deleteBtn = document.querySelectorAll("#delete-btn");

addClientBtn.addEventListener("click", () => {
  modalContainer.classList.add("show");
});

closeIcon.addEventListener("click", () => {
  modalContainer.classList.remove("show");
});

form.addEventListener("submit", () => {
  modalContainer.classList.remove("show");
});

deleteBtn.forEach((element) => {
  element.addEventListener("click", (e) => deleteClient(e));
});

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
