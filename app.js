// Liste des matières obligatoires
const matieresObligatoires = [
    { id: 'francais', nom: 'Français' },
    { id: 'maths', nom: 'Mathématiques' },
    { id: 'histoire-geo', nom: 'Histoire-Géo' },
    { id: 'emc', nom: 'EMC' },
    { id: 'physique-chimie', nom: 'Physique-Chimie' },
    { id: 'svt', nom: 'SVT' },
    { id: 'technologie', nom: 'Technologie' },
    { id: 'lv1', nom: 'Anglais' },
    { id: 'lv2', nom: 'Espagnol' },
    { id: 'eps', nom: 'EPS' },
    { id: 'arts-plastiques', nom: 'Arts' },
    { id: 'musique', nom: 'Musique' }
];

// Générer les lignes du tableau des matières
function generateMatièresTable() {
    const tbody = document.getElementById('matières-body');
    tbody.innerHTML = '';
    matieresObligatoires.forEach(matiere => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${matiere.nom}</td>
            <td><input type="number" id="${matiere.id}-t1" min="0" max="20" step="0.01" oninput="updateAll()" placeholder="0"></td>
            <td><input type="number" id="${matiere.id}-t2" min="0" max="20" step="0.01" oninput="updateAll()" placeholder="0"></td>
            <td><input type="number" id="${matiere.id}-t3" min="0" max="20" step="0.01" oninput="updateAll()" placeholder="0"></td>
            <td id="${matiere.id}-moyenne">-</td>
        `;
        tbody.appendChild(row);
    });
}

// Fonction pour calculer la moyenne
function calculerMoyenne(...notes) {
    const notesValides = notes.filter(n => n !== null && n !== undefined && !isNaN(n) && n !== "");
    if (notesValides.length === 0) return 0;
    return notesValides.reduce((a, b) => a + parseFloat(b), 0) / notesValides.length;
}

// Fonction pour arrondir
function arrondir(valeur) {
    return Math.round(valeur * 100) / 100;
}

// Mettre à jour toutes les moyennes et résultats
function updateAll() {
    let sommeMatières = 0;

    // Calcul des moyennes pour les matières obligatoires
    matieresObligatoires.forEach(matiere => {
        const t1 = parseFloat(document.getElementById(`${matiere.id}-t1`).value) || null;
        const t2 = parseFloat(document.getElementById(`${matiere.id}-t2`).value) || null;
        const t3 = parseFloat(document.getElementById(`${matiere.id}-t3`).value) || null;
        const moyenne = calculerMoyenne(t1, t2, t3);
        document.getElementById(`${matiere.id}-moyenne`).textContent = arrondir(moyenne);
        sommeMatières += moyenne;
    });

    // Latin
    const latinT1 = parseFloat(document.getElementById('latin-t1').value) || null;
    const latinT2 = parseFloat(document.getElementById('latin-t2').value) || null;
    const latinT3 = parseFloat(document.getElementById('latin-t3').value) || null;
    const moyenneLatin = calculerMoyenne(latinT1, latinT2, latinT3);
    document.getElementById('latin-moyenne').textContent = arrondir(moyenneLatin);
    const pointsLatin = moyenneLatin > 10 ? moyenneLatin - 10 : 0;
    document.getElementById('latin-points').textContent = pointsLatin > 0 ? `+${arrondir(pointsLatin)}` : '0';

    // Moyenne contrôle continu (40%)
    let moyenneCC = sommeMatières / matieresObligatoires.length;
    moyenneCC = Math.min(moyenneCC + pointsLatin, 20);

    // Épreuves finales (60%)
    const notesFinales = [
        parseFloat(document.getElementById('francais-final').value) || 0,
        parseFloat(document.getElementById('maths-final').value) || 0,
        parseFloat(document.getElementById('histoire-final').value) || 0,
        parseFloat(document.getElementById('sciences-final').value) || 0,
        parseFloat(document.getElementById('oral-final').value) || 0
    ];
    const moyenneFinales = calculerMoyenne(...notesFinales);
    document.getElementById('moyenne-finales').textContent = arrondir(moyenneFinales);

    // Moyenne finale DNB
    const moyenneFinale = (moyenneCC * 0.4) + (moyenneFinales * 0.6);

    // Seuils
    const seuils = [
        { nom: "DNB", valeur: 10, emoji: "🎓" },
        { nom: "Assez bien", valeur: 12, emoji: "🌟" },
        { nom: "Bien", valeur: 14, emoji: "🌟🌟" },
        { nom: "Très bien", valeur: 16, emoji: "🌟🌟🌟" },
        { nom: "Félicitations", valeur: 18, emoji: "🏆" }
    ];

    // Génération des résultats
    let resultHTML = `
        <div class="result-item">
            <div class="result-title">Moyenne contrôle continu (<span class="highlight">40%</span>)</div>
            <div class="result-value">${arrondir(moyenneCC)}/20</div>
            ${pointsLatin > 0 ? `<div style="font-size: 0.85em; color: #7f8c8d;">+${arrondir(pointsLatin)} pts (Latin)</div>` : ''}
        </div>

        <div class="result-item">
            <div class="result-title">Moyenne épreuves finales (<span class="highlight">60%</span>)</div>
            <div class="result-value">${arrondir(moyenneFinales)}/20</div>
        </div>

        <div class="result-item">
            <div class="result-title">Moyenne finale DNB</div>
            <div class="result-value" style="font-size: 1.4em;">${arrondir(moyenneFinale)}/20</div>
        </div>
    `;

    // Mention obtenue
    let mention = null;
    for (let i = seuils.length - 1; i >= 0; i--) {
        if (moyenneFinale >= seuils[i].valeur) {
            mention = seuils[i];
            break;
        }
    }

    if (mention) {
        resultHTML += `
            <div class="result-item" style="border-left: 4px solid #27ae60;">
                <div class="result-title">${mention.emoji} ${mention.nom}</div>
                <div class="result-ok">Félicitations !</div>
            </div>
        `;
    } else {
        resultHTML += `
            <div class="result-item">
                <div class="result-title">❌ Pas encore le DNB</div>
                <div class="result-error">Il manque ${arrondir(10 - moyenneFinale)} pts</div>
            </div>
        `;
    }

    // Points manquants pour chaque mention
    resultHTML += `<div class="result-item"><div class="result-title">Points manquants:</div></div>`;
    seuils.forEach(seuil => {
        if (moyenneFinale < seuil.valeur) {
            const manque = arrondir(seuil.valeur - moyenneFinale);
            resultHTML += `
                <div class="result-item">
                    <div class="result-title">${seuil.emoji} ${seuil.nom}</div>
                    <div class="result-error">Manque ${manque} pts</div>
                </div>
            `;
        }
    });

    document.getElementById('result').innerHTML = resultHTML;
}

// Initialisation
window.onload = function() {
    generateMatièresTable();
    updateAll();
};
