
let zip, originalZipContent = {};
let passJson = {};

document.getElementById("fileInput").addEventListener("change", async function (e) {
  const file = e.target.files[0];
  if (!file || !file.name.endsWith(".pkpass")) {
    alert("Fichier invalide. Choisis un fichier .pkpass");
    return;
  }

  zip = await JSZip.loadAsync(file);
  if (!zip.files["pass.json"]) {
    alert("Ce fichier ne contient pas de pass.json");
    return;
  }

  for (const filename in zip.files) {
    if (filename !== "pass.json") {
      originalZipContent[filename] = await zip.files[filename].async("uint8array");
    }
  }

  const jsonText = await zip.files["pass.json"].async("string");
  passJson = JSON.parse(jsonText);
  buildForm(passJson);
});

function buildForm(data) {
  const formArea = document.getElementById("form-area");
  formArea.innerHTML = '<h3>📝 Modifier le contenu du pass.json</h3>';

  function createInput(key, value, path) {
    const id = path.join(".");
    const field = document.createElement("div");
    field.className = "field";
    field.innerHTML = \`
      <label for="\${id}">\${id}</label>
      <input type="text" name="\${id}" id="\${id}" value="\${value}" />
    \`;
    formArea.appendChild(field);
  }

  function recurse(obj, path = []) {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === "string" || typeof value === "number") {
        createInput(key, value, [...path, key]);
      } else if (typeof value === "object" && value !== null) {
        recurse(value, [...path, key]);
      }
    }
  }

  recurse(data);
  document.getElementById("downloadBtn").style.display = "inline-block";
}

document.getElementById("downloadBtn").addEventListener("click", async () => {
  function updateJson(obj, path = []) {
    for (const key in obj) {
      const value = obj[key];
      const id = [...path, key].join(".");
      const input = document.getElementById(id);
      if (input) {
        obj[key] = input.value;
      } else if (typeof value === "object" && value !== null) {
        updateJson(value, [...path, key]);
      }
    }
  }

  updateJson(passJson);

  const newZip = new JSZip();
  newZip.file("pass.json", JSON.stringify(passJson, null, 2));

  for (const filename in originalZipContent) {
    newZip.file(filename, originalZipContent[filename]);
  }

  const blob = await newZip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "pkpass_modifié.pkpass";
  link.click();
});

// Création d’un PKPass à partir de zéro
document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nom = document.getElementById("name").value;
  const event = document.getElementById("event").value;
  const date = document.getElementById("date").value;
  const lieu = document.getElementById("lieu").value;

  const passData = {
    formatVersion: 1,
    passTypeIdentifier: "pass.com.example.generated",
    serialNumber: "SN" + Date.now(),
    teamIdentifier: "TEAM12345",
    organizationName: "PassForge",
    description: "Pass personnalisé généré",
    logoText: nom,
    generic: {
      primaryFields: [
        { key: "name", label: "Nom", value: nom },
        { key: "event", label: "Événement", value: event },
        { key: "date", label: "Date", value: date },
        { key: "lieu", label: "Lieu", value: lieu }
      ]
    }
  };

  const iconData = Uint8Array.from([
    0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,
    0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x06,0x00,0x00,0x00,0x1F,0x15,0xC4,
    0x89,0x00,0x00,0x00,0x0A,0x49,0x44,0x41,0x54,0x78,0x9C,0x63,0x60,0x00,0x00,0x02,
    0x00,0x01,0x05,0x00,0xFE,0x2A,0x60,0x57,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,0x44,
    0xAE,0x42,0x60,0x82
  ]);

  const newZip = new JSZip();
  newZip.file("pass.json", JSON.stringify(passData, null, 2));
  newZip.file("icon.png", iconData);

  const blob = await newZip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "nouveau_pass.pkpass";
  link.click();
});
