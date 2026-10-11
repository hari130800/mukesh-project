const plantForm = document.getElementById("plantForm");
const plantNameInput = document.getElementById("plantName");
const intervalInput = document.getElementById("interval");
const plantList = document.getElementById("plantList");
const emptyMessage = document.getElementById("emptyMessage");

let plants = [];

try {
  const savedPlants = JSON.parse(localStorage.getItem("smartPlants") || "[]");
  plants = Array.isArray(savedPlants) ? savedPlants : [];
} catch (error) {
  plants = [];
}

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateString, days) {
  const date = new Date(dateString + "T12:00:00");

  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  const date = new Date(dateString + "T12:00:00");

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function savePlants() {
  localStorage.setItem("smartPlants", JSON.stringify(plants));
}

function isDue(plant) {
  return plant.nextWatering <= getToday();
}

function renderPlants() {
  if (!plantList || !emptyMessage) return;

  plantList.innerHTML = "";
  const currentDate = getToday();

  plants.forEach((plant) => {
    const due = isDue(plant);
    const wateredToday = plant.lastWatered === currentDate;

    const card = document.createElement("article");
    card.className = "plant-card";

    const top = document.createElement("div");
    top.className = "plant-top";

    const details = document.createElement("div");

    const name = document.createElement("h3");
    name.className = "plant-name";
    name.textContent = plant.name;

    const interval = document.createElement("p");
    interval.className = "plant-info";
    interval.textContent = "💧 Water every " + plant.interval + " day(s)";

    const nextDate = document.createElement("p");
    nextDate.className = "plant-info";
    nextDate.textContent = "📅 Next watering: " + formatDate(plant.nextWatering);

    const status = document.createElement("span");

    if (wateredToday) {
      status.className = "status status-done";
      status.textContent = "✓ Watered today";
    } else if (due) {
      status.className = "status status-due";
      status.textContent = "💧 Watering due";
    } else {
      status.className = "status status-done";
      status.textContent = "🌿 Growing well";
    }

    const icon = document.createElement("span");
    icon.className = "plant-icon";
    icon.textContent = "🪴";

    details.append(name, interval, nextDate, status);
    top.append(details, icon);

    const actions = document.createElement("div");
    actions.className = "plant-actions";

    const waterButton = document.createElement("button");
    waterButton.className = "water-btn";
    waterButton.textContent = wateredToday ? "✓ Watered Today" : "💧 Mark as Watered";

    waterButton.disabled = wateredToday;

    if (wateredToday) {
      waterButton.style.opacity = "0.7";
      waterButton.style.cursor = "not-allowed";
    }

    waterButton.addEventListener("click", () => {
      plant.lastWatered = getToday();
      plant.nextWatering = addDays(getToday(), Number(plant.interval));

      savePlants();
      renderPlants();
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "🗑 Delete";

    deleteButton.addEventListener("click", () => {
      const confirmed = confirm("Delete " + plant.name + " from your plant list?");

      if (!confirmed) return;

      plants = plants.filter((item) => item.id !== plant.id);

      savePlants();
      renderPlants();
    });

    actions.append(waterButton, deleteButton);
    card.append(top, actions);

    plantList.appendChild(card);
  });

  const dueCount = plants.filter(isDue).length;
  const wateredCount = plants.filter((plant) => plant.lastWatered === currentDate).length;

  const totalPlantsEl = document.getElementById("totalPlants");
  const duePlantsEl = document.getElementById("duePlants");
  const wateredPlantsEl = document.getElementById("wateredPlants");
  const plantCountEl = document.getElementById("plantCount");

  if (totalPlantsEl) totalPlantsEl.textContent = String(plants.length);
  if (duePlantsEl) duePlantsEl.textContent = String(dueCount);
  if (wateredPlantsEl) wateredPlantsEl.textContent = String(wateredCount);
  if (plantCountEl) plantCountEl.textContent = plants.length + " plant" + (plants.length === 1 ? "" : "s");

  emptyMessage.style.display = plants.length === 0 ? "block" : "none";
}

if (plantForm) {
  plantForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = plantNameInput.value.trim();
    const interval = Number(intervalInput.value);

    if (!name || !Number.isInteger(interval) || interval < 1) {
      alert("Please enter a valid plant name and watering interval.");
      return;
    }

    const today = getToday();

    const newPlant = {
      id: crypto.randomUUID(),
      name: name,
      interval: interval,
      lastWatered: null,
      nextWatering: addDays(today, interval)
    };

    plants.push(newPlant);

    savePlants();
    renderPlants();

    plantForm.reset();
    intervalInput.value = "3";

    alert(name + " added successfully! 🌱");
  });
}
