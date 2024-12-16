document.addEventListener("DOMContentLoaded", () => {
  const propositionEl = document.getElementById("proposition");
  const verifierBtn = document.getElementById("verifierBtn");
  const supprimerBtn = document.getElementById("supprimerBtn");
  const resultatEl = document.getElementById("resultat");
  const essaisRestantsEl = document.getElementById("essaisRestants");
  const listeHistoriqueEl = document.getElementById("liste-historique");
  const scoreEl = document.getElementById("score");
  let score = 1000;
  let proposition = [];
  let essaisRestants = 10;
  const toggleBtn = document.getElementById("toggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  const codeSecret = genererCodeSecret();
  console.log("Code secret (pour débogage) :", codeSecret.join(""));

  document.querySelectorAll(".couleur-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (proposition.length < 4) {
        proposition.push(button.dataset.couleur);
        propositionEl.textContent = proposition.join("");
      }
    });
  });

  // Charger le thème à partir des préférences système ou stockage local
  const savedTheme = localStorage.getItem("theme");
  const prefersDarkScheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  // Appliquer le thème initial
  const initialTheme = savedTheme || (prefersDarkScheme ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", initialTheme);

  updateThemeIcon(initialTheme);

  // Gestion du clic pour changer de thème
  toggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    themeIcon.textContent = theme === "dark" ? "🌙" : "☀️";
  }

  supprimerBtn.addEventListener("click", () => {
    // Supprime la dernière couleur ajoutée
    proposition.pop();
    propositionEl.textContent = proposition.join("");
  });

  verifierBtn.addEventListener("click", () => {
    if (proposition.length !== 4) {
      alert(
        "Veuillez sélectionner 4 couleurs pour faire une proposition complète."
      );
      return;
    }

    let resultat = verifierCode(proposition, codeSecret);

    // Animation sur le score
    scoreEl.classList.add("score-animated");
    setTimeout(() => {
      scoreEl.classList.remove("score-animated");
    }, 500);

    resultatEl.textContent = `Bien placés: ${resultat.bienPlace}, Mal placés: ${resultat.malPlace}`;

    const historiqueItem = document.createElement("li");
    const propositionDiv = document.createElement("div");
    propositionDiv.classList.add("proposition-visuelle");

    proposition.forEach((couleur) => {
      const couleurDiv = document.createElement("div");
      couleurDiv.classList.add("couleur");
      couleurDiv.style.backgroundColor = obtenirCouleurHex(couleur);
      propositionDiv.appendChild(couleurDiv);
    });

    historiqueItem.appendChild(propositionDiv);
    historiqueItem.innerHTML += ` - Bien placés: ${resultat.bienPlace}, Mal placés: ${resultat.malPlace}`;
    listeHistoriqueEl.appendChild(historiqueItem);

    if (resultat.bienPlace === 4) {
      alert(
        `Félicitations, vous avez trouvé le code secret ! Votre score est : ${score}`
      );
      verifierBtn.disabled = true;
      return;
    }
    essaisRestants--;
    score -= 100; // Diminuer le score à chaque tentative.
    essaisRestantsEl.textContent = `Essais restants : ${essaisRestants}`;
    scoreEl.textContent = `Score : ${score}`;

    if (essaisRestants === 0) {
      alert(
        "Désolé, vous avez perdu. Le code secret était : " + codeSecret.join("")
      );
      verifierBtn.disabled = true;
    }

    proposition = [];
    propositionEl.textContent = "";
  });

  function genererCodeSecret(taille = 4) {
    const couleurs = ["R", "V", "B", "J", "O", "N"];
    let code = [];
    for (let i = 0; i < taille; i++) {
      code.push(couleurs[Math.floor(Math.random() * couleurs.length)]);
    }
    return code;
  }

  function verifierCode(proposition, codeSecret) {
    let bienPlace = 0;
    let malPlace = 0;
    let codeSecretCopy = [...codeSecret];
    let propositionCopy = [...proposition];

    for (let i = 0; i < proposition.length; i++) {
      if (proposition[i] === codeSecret[i]) {
        bienPlace++;
        codeSecretCopy[i] = null;
        propositionCopy[i] = null;
      }
    }

    for (let i = 0; i < proposition.length; i++) {
      if (propositionCopy[i] !== null) {
        let index = codeSecretCopy.indexOf(propositionCopy[i]);
        if (index !== -1) {
          malPlace++;
          codeSecretCopy[index] = null;
        }
      }
    }

    return { bienPlace, malPlace };
  }

  function obtenirCouleurHex(couleur) {
    const mapCouleurs = {
      R: "red",
      V: "green",
      B: "blue",
      J: "yellow",
      O: "orange",
      N: "black",
    };
    return mapCouleurs[couleur];
  }

  function envoyerScore(score) {
    fetch("/update_score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: score }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data.message))
      .catch((err) => console.error("Erreur:", err));
  }
});
