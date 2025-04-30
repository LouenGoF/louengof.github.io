function genererPass() {
  const nom = document.getElementById("nom").value;
  const msg = document.getElementById("msg");
  if (!nom) {
    msg.innerText = "Veuillez entrer votre nom.";
    return;
  }
  msg.innerText = "Génération en cours...";

  fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nom })
  })
    .then(res => {
      if (!res.ok) throw new Error("Erreur réseau");
      return res.blob();
    })
    .then(blob => {
      const lien = document.createElement("a");
      lien.href = URL.createObjectURL(blob);
      lien.download = "mon_pass.pkpass";
      lien.click();
      msg.innerText = "Fichier généré.";
    })
    .catch(err => {
      msg.innerText = "Erreur : " + err.message;
    });
}
