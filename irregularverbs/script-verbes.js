const verbes = [
  { fr: "acheter", inf: "buy", past: "bought", participle: "bought" },
  { fr: "aller", inf: "go", past: "went", participle: "gone" },
  { fr: "avoir", inf: "have", past: "had", participle: "had" },
  { fr: "boire", inf: "drink", past: "drank", participle: "drunk" },
  { fr: "casser", inf: "break", past: "broke", participle: "broken" },
  { fr: "chanter", inf: "sing", past: "sang", participle: "sung" },
  { fr: "comprendre", inf: "understand", past: "understood", participle: "understood" },
  { fr: "couper", inf: "cut", past: "cut", participle: "cut" },
  { fr: "dire", inf: "say", past: "said", participle: "said" },
  { fr: "donner", inf: "give", past: "gave", participle: "given" },
  { fr: "écrire", inf: "write", past: "wrote", participle: "written" },
  { fr: "être", inf: "be", past: "was / were", participle: "been" },
  { fr: "faire", inf: "do", past: "did", participle: "done" },
  { fr: "gagner", inf: "win", past: "won", participle: "won" },
  { fr: "lire", inf: "read", past: "read", participle: "read" },
  { fr: "manger", inf: "eat", past: "ate", participle: "eaten" },
  { fr: "nager", inf: "swim", past: "swam", participle: "swum" },
  { fr: "parler", inf: "speak", past: "spoke", participle: "spoken" },
  { fr: "prendre", inf: "take", past: "took", participle: "taken" },
  { fr: "perdre", inf: "lose", past: "lost", participle: "lost" },
  { fr: "rencontrer", inf: "meet", past: "met", participle: "met" },
  { fr: "réveiller", inf: "wake up", past: "woke up", participle: "woken up" },
  { fr: "rêver", inf: "dream", past: "dreamt / dreamed", participle: "dreamt / dreamed" },
  { fr: "tomber", inf: "fall", past: "fell", participle: "fallen" },
  { fr: "voir", inf: "see", past: "saw", participle: "seen" },
];

const tableBody = document.getElementById("table-body");
const printBtn = document.getElementById("print-btn");

// Populate table
verbes.forEach((verb) => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><strong>${verb.fr}</strong></td>
    <td>${verb.inf}</td>
    <td>${verb.past}</td>
    <td>${verb.participle}</td>
  `;
  tableBody.appendChild(row);
});

// Print function
printBtn.addEventListener("click", () => {
  window.print();
});
