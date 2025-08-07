// Seni seviyorum hayatım ama kodlarıma bakmaya geldiysen kaç çünkü hiç düzenli değil ölebilirsin...
window.addEventListener('load', () => {
  showMessage('Mali işten gelmeden önce bütün dekorasyonları bulmalıyımm!', 3000);
});

let inventoryAlertShown = false;
let currentRoom = "living-room";
let isBoxOpen = false;
let selectedInventoryItem = null;

const album = document.getElementById('photo-album');
const openAlbumBtn = document.getElementById('open-album');
const closeAlbumBtn = document.getElementById('close-album');
const albumPhotosContainer = document.getElementById('album-photos');
const photos = [
  { src: 'assets/photos/photo1.jpg', note: 'İlk buluşmadan beraber olmamız gerektiği belliydi.' },
  { src: 'assets/photos/photo2.jpg', note: 'Bazen üzülsek de, hayatta engelleyemeyeceğimiz zor şeyler olsa da unutma...' },
  { src: 'assets/photos/photo3.jpg', note: 'Beraber her şeyin üstesinden geliriz!' },
];

const inventory = [];

const transitionSound = new Audio("assets/sounds/pageturn.mp3");
transitionSound.preload = "auto";
transitionSound.load();

const cat = new Audio("assets/sounds/cat.mp3");
cat.preload = "auto";
cat.load();

const itemPickupSound = new Audio("assets/sounds/pickitem.mp3");
itemPickupSound.preload = "auto";
itemPickupSound.load();

const celebrationSound = new Audio("assets/sounds/celebration.mp3");

const roomImage = document.getElementById("room-image");
const roomItemsContainer = document.getElementById("room-items");
const inventoryContainer = document.getElementById("inventory-items");

const placementAreas = [
  { top: "10%", left: "20%", width: "450px", height: "160px", acceptedItem: "banner", placed: false },
  { top: "20px", left: "0px", width: "131px", height: "536px", acceptedItem: "balloon", placed: false },
  { top: "350px", left: "551px", width: "44px", height: "60px", acceptedItem: "partyhat", placed: false },
  { top: "390px", left: "325px", width: "128px", height: "128px", acceptedItem: "cake", placed: false },
  { top: "460px", left: "145px", width: "90px", height: "90px", acceptedItem: "gift", placed: false },
];

function loadAlbum() {
  albumPhotosContainer.innerHTML = '';
  photos.forEach(({src, note}) => {
    const photoDiv = document.createElement('div');
    photoDiv.style.marginBottom = '15px';

    const img = document.createElement('img');
    img.src = src;
    img.alt = note;

    const caption = document.createElement('p');
    caption.textContent = note;
    caption.style.fontSize = '0.9rem';
    caption.style.marginTop = '5px';

    photoDiv.appendChild(img);
    photoDiv.appendChild(caption);

    albumPhotosContainer.appendChild(photoDiv);
  });
}

openAlbumBtn.addEventListener('click', () => {
  loadAlbum();
  album.classList.remove('hidden');
});

closeAlbumBtn.addEventListener('click', () => {
  album.classList.add('hidden');
});

function showMessage(text, stay = false) {
  const box = document.getElementById('message-box');
  const msg = document.getElementById('message-text');
  const close = document.getElementById('close-message');

  msg.textContent = text;
  box.style.display = 'block';

  close.style.display = stay ? 'none' : 'block';

  if (!stay) {
    setTimeout(() => {
      box.style.display = 'none';
    }, 3000);
  }
}

document.getElementById('close-message').addEventListener('click', () => {
  document.getElementById('message-box').style.display = 'none';
});

document.querySelectorAll(".arrow").forEach(arrow => {
  arrow.addEventListener("click", () => {
    const dir = arrow.dataset.direction;
    changeRoom(dir);
  });
});

function setupInventoryClick() {
  Array.from(inventoryContainer.children).forEach(slot => {
    slot.classList.remove("selected");
    const img = slot.querySelector("img");
    slot.onclick = () => {
      if (selectedInventoryItem === img.alt) {
        selectedInventoryItem = null;
        slot.classList.remove("selected");
      } else {
        selectedInventoryItem = img.alt;
        Array.from(inventoryContainer.children).forEach(s => s.classList.remove("selected"));
        slot.classList.add("selected");
      }
    };
  });
}

function changeRoom(directionOrRoom) {
  transitionSound.pause();        
  transitionSound.currentTime = 0;
  transitionSound.play().catch(e => {});

  const order = ["living-room", "office-closed", "kitchen-closed", "basement"];

  if (order.includes(directionOrRoom)) {
    currentRoom = directionOrRoom;
  } else {
    if (currentRoom === "office-open") currentRoom = "office-closed";
    if (currentRoom === "kitchen-open") currentRoom = "kitchen-closed";

    let index = order.indexOf(currentRoom);
    if (directionOrRoom === "left") {
      index = (index - 1 + order.length) % order.length;
    } else {
      index = (index + 1) % order.length;
    }

    currentRoom = order[index];
  }

    setTimeout(() => {
    renderRoom();
  }, 5);
}


function renderRoom() {
  roomImage.src = `assets/rooms/${currentRoom}.png`;
  roomItemsContainer.innerHTML = "";

  if (currentRoom === "living-room") {
    placementAreas.forEach(area => {
      const areaDiv = document.createElement("div");
      areaDiv.className = "interactive-item";
      areaDiv.style.top = area.top;
      areaDiv.style.left = area.left;
      areaDiv.style.width = area.width;
      areaDiv.style.height = area.height;
      areaDiv.style.border = "none";
      areaDiv.style.backgroundColor = "transparent";
      areaDiv.style.cursor = area.placed ? "default" : "pointer";

      if (area.placed) {
        const placedImg = document.createElement("img");
        placedImg.src = `assets/items/${area.acceptedItem}-placed.png`;
        placedImg.style.width = "100%";
        placedImg.style.height = "100%";
        areaDiv.appendChild(placedImg);
      }

      areaDiv.onclick = () => {
        if (selectedInventoryItem === area.acceptedItem && !area.placed) {
          area.placed = true;
          const index = inventory.indexOf(selectedInventoryItem);
          if (index > -1) inventory.splice(index, 1);
          updateInventory();
          selectedInventoryItem = null;
          renderRoom();


          setTimeout(() => {
           if (placementAreas.every(a => a.placed)) {
              celebrationSound.play();
              showMessage("🎉 Doğum günün kutlu olsun sevgilim. Yanında olamayıp seninle güzel bir parti yapamadığımız için kendimi kötü hissediyordum. O yüzden umarım sanal partimde eğlenmişsindir. Bir gün oturma odamız senin için süslenecek ve bütün doğum günlerinde yanında olacağım. Büyüdüğümüzü görmeyi merakla bekliyorum. Seni seviyorum.❤️",true);
                }
              }, 1500);
             } else {
              if(area.acceptedItem == "partyhat" && !area.placed) {
                cat.pause();
                cat.currentTime = 0;
                cat.play().catch(() => {});
               }
              }
             };

      roomItemsContainer.appendChild(areaDiv);
    });
  }

  if (currentRoom === "office-closed") {
    const drawer = document.createElement("div");
    drawer.className = "interactive-item";
    drawer.style.top = "460px";
    drawer.style.left = "380px";
    drawer.style.width = "80px";
    drawer.style.height = "50px";
    drawer.addEventListener("click", () => {
      if (!inventory.includes("banner")) {
        addToInventory("banner");
      }
      currentRoom = "office-open";
      renderRoom();
    });
    roomItemsContainer.appendChild(drawer);
  }

if (currentRoom === "kitchen-closed") {
  
  const fridge = document.createElement("div");
  fridge.className = "interactive-item";
  fridge.style.top = "300px";
  fridge.style.left = "500px";
  fridge.style.width = "100px";
  fridge.style.height = "200px";
  fridge.style.position = "absolute";
  fridge.style.cursor = "pointer";

  fridge.addEventListener("click", () => {
    currentRoom = "kitchen-open";
    renderRoom();
  });

  roomItemsContainer.appendChild(fridge);

  
  if (!inventory.includes("gift")) {
    const gift = document.createElement("div");
    gift.className = "interactive-item";
    gift.style.position = "absolute";
    gift.style.top = "420px";    
    gift.style.left = "380px";   
    gift.style.width = "105px";  
    gift.style.height = "130px"; 
    gift.style.cursor = "pointer";

    gift.addEventListener("click", () => {
      addToInventory("gift");
      renderRoom();
    });

    const giftImg = document.createElement("img");
    giftImg.src = "assets/items/gift.png";
    giftImg.style.width = "100%";
    giftImg.style.height = "100%";
    giftImg.style.pointerEvents = "none";

    gift.appendChild(giftImg);
    roomItemsContainer.appendChild(gift);
  }
}


if (currentRoom === "kitchen-open") {
  
  if (!inventory.includes("cake")) {
    const cake = document.createElement("div");
    cake.className = "interactive-item";
    cake.style.top = "290px";
    cake.style.left = "515px";
    cake.style.width = "128px";
    cake.style.height = "128px";
    cake.style.position = "absolute";
    cake.style.cursor = "pointer";

    cake.addEventListener("click", () => {
      addToInventory("cake");
      renderRoom();
    });

    const cakeImg = document.createElement("img");
    cakeImg.src = "assets/items/cake.png";
    cakeImg.style.width = "100%";
    cakeImg.style.height = "100%";
    cakeImg.style.pointerEvents = "none";

    cake.appendChild(cakeImg);
    roomItemsContainer.appendChild(cake);
  }

  if (!inventory.includes("gift")) {
    const gift = document.createElement("div");
    gift.className = "interactive-item";
    gift.style.position = "absolute";
    gift.style.top = "420px"; 
    gift.style.left = "380px";
    gift.style.width = "105px";
    gift.style.height = "130px"; 
    gift.style.cursor = "pointer";

    gift.addEventListener("click", () => {
      addToInventory("gift");
      renderRoom();
    });

    const giftImg = document.createElement("img");
    giftImg.src = "assets/items/gift.png";
    giftImg.style.width = "100%";
    giftImg.style.height = "100%";
    giftImg.style.pointerEvents = "none";

    gift.appendChild(giftImg);
    roomItemsContainer.appendChild(gift);
  }
}

  if (currentRoom === "basement") {
    const box = document.createElement("img");
    box.src = isBoxOpen ? "assets/items/box-open.png" : "assets/items/box-closed.png";
    box.className = "interactive-item";
    Object.assign(box.style, {
      position: "absolute",
      top: "0px",
      left: "0px",
      width: "800px",
      height: "600px",
      cursor: "pointer",
      zIndex: 5
    });

    box.addEventListener("click", () => {
  if (!isBoxOpen) {
    isBoxOpen = true;
    addToInventory("balloon");
    renderRoom(); 
    setTimeout(() => {
      startBalloonAnimation(); 
    }, 50);
  }
});

    roomItemsContainer.appendChild(box);

    if (!inventory.includes("partyhat")) {
      const hat = document.createElement("img");
      hat.src = "assets/items/partyhat.png";
      hat.className = "interactive-item";
      Object.assign(hat.style, {
        position: "absolute",
        top: "350px",
        left: "0px",
        width: "150px",
        height: "150px",
        cursor: "pointer",
        zIndex: 6
      });
      hat.addEventListener("click", () => {
        addToInventory("partyhat");
        renderRoom();
      });
      roomItemsContainer.appendChild(hat);
    }
  }

  updateInventory();
  setupInventoryClick();
}

function addToInventory(item) {
  if (!inventory.includes(item)) {
    inventory.push(item);
    updateInventory();

    itemPickupSound.pause();
    itemPickupSound.currentTime = 0;
    itemPickupSound.play();
  }
}

function updateInventory() {
  inventoryContainer.innerHTML = "";

  inventory.forEach(item => {
    const slot = document.createElement("div");
    slot.className = "item-slot";
    slot.title = item;

    const img = document.createElement("img");
    img.src = `assets/items/${item}.png`;
    img.alt = item;

    if (item === "balloon") {
      img.classList.add("item-balloon");
    } else if (item === "cake") {
      img.classList.add("item-cake");
    }

    slot.appendChild(img);
    inventoryContainer.appendChild(slot);
  });

  if (inventory.length === 5 && !inventoryAlertShown) {
    inventoryAlertShown = true;
    setTimeout(() => {
      showMessage("🎉 Şimdi eşyaları oturma odasına yerleştirme zamanı, önce eşyaya tıkla sonra da doğru yerlere yerleştir!", 3000);
    }, 500);
  }
}


function startBalloonAnimation() {
  const balloon = document.createElement("img");
   balloon.src = "assets/items/balloonanimation.png";
   balloon.className = "balloon-animation";
   balloon.style.top = "230px";  
   balloon.style.left = "300px";
   balloon.style.width = "185px";
   balloon.style.height = "258px";

  document.getElementById("room-items").appendChild(balloon);

  balloon.addEventListener("animationend", () => {
    balloon.remove();
  });
}


renderRoom();
