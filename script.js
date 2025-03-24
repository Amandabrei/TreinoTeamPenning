let competitors = [];
let teams = [];
let finalTeams = [];
let winners = [];
let participationCount = {}; // Contador de participações
let lastTeams = {}; // Para controlar os últimos trios em que cada competidor participou

function addCompetitor() {
    const nameInput = document.getElementById('competitorName');
    const name = nameInput.value.trim();
    const errorMessage = document.querySelector('.error');

    if (errorMessage) {
        errorMessage.remove(); // Remove mensagem de erro anterior
    }

    if (name === '') {
        showError('Por favor, insira um nome.');
        return;
    }

    if (competitors.includes(name)) {
        showError('Competidor já cadastrado.');
        return;
    }

    competitors.push(name);
    participationCount[name] = 0; // Inicializa o contador de participações
    lastTeams[name] = []; // Inicializa a lista de últimos trios
    updateCompetitorList();
    nameInput.value = '';
}

function showError(message) {
    const error = document.createElement('div');
    error.className = 'error';
    error.textContent = message;
    document.querySelector('.container').insertBefore(error, document.querySelector('h2'));
}

function updateCompetitorList() {
    const list = document.getElementById('competitorList');
    list.innerHTML = '';
    competitors.forEach((name, index) => {
        const li = document.createElement('li');
        li.textContent = name;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Deletar';
        deleteBtn.onclick = () => {
            competitors.splice(index, 1);
            delete participationCount[name]; // Remove o contador de participações
            delete lastTeams[name]; // Remove os últimos trios
            updateCompetitorList();
        };
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

function generateTeams() {
    if (competitors.length < 3) {
        alert('É necessário pelo menos 3 competidores para formar trios.');
        return;
    }

    teams = [];
    let shuffled = [...competitors].sort(() => 0.5 - Math.random());

    for (let i = 0; i < shuffled.length; i++) {
        if (participationCount[shuffled[i]] < 12) {
            let trio = [];
            for (let j = 0; j < 3; j++) {
                if (i + j < shuffled.length && participationCount[shuffled[i + j]] < 12) {
                    // Verifica se o competidor não participou nos últimos 2 trios
                    if (!lastTeams[shuffled[i + j]].includes(trio.join(', '))) {
                        trio.push(shuffled[i + j]);
                        participationCount[shuffled[i + j]]++;
                    }
                }
            }
            if (trio.length === 3) {
                teams.push(trio.sort().join(', '));
                trio.forEach(name => {
                    lastTeams[name].push(trio.join(', '));
                    if (lastTeams[name].length > 2) {
                        lastTeams[name].shift(); // Mantém apenas os últimos 2 trios
                    }
                });
            }
        }
    }

    // Verifica se todos os competidores têm pelo menos 10 participações
    for (const competitor of competitors) {
        if (participationCount[competitor] < 10) {
            alert(`O competidor ${competitor} não tem o mínimo de 10 participações.`);
            return;
        }
    }

    updateQualifyingTable();
}

function updateQualifyingTable() {
    const tableBody = document.querySelector('#qualifyingTable tbody');
    tableBody.innerHTML = '';
    teams.forEach(trio => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${trio}</td>
                         <td><input type='text' placeholder='Nº Boi'></td>
                         <td><input type='number' step='0.01' placeholder='Tempo'></td>`;
        tableBody.appendChild(row);
    });
}

function finalizeQualifying() {
    const rows = document.querySelectorAll('#qualifyingTable tbody tr');
    let results = [];
    rows.forEach(row => {
        const trio = row.cells[0].textContent;
        const time = parseFloat(row.cells[2].querySelector('input').value) || 0;
        const boiNumber = row.cells[1].querySelector('input').value || '';
        results.push({ trio, time, boiNumber });
    });

    results.sort((a, b) => a.time - b.time);
    finalTeams = results.slice(0, 15);
    updateFinalTable();
}

function updateFinalTable() {
    const tableBody = document.querySelector('#finalTable tbody');
    tableBody.innerHTML = '';
    finalTeams.forEach(team => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${team.trio}</td>
                         <td>${team.time}</td>
                         <td><input type='text' placeholder='Nº Boi'></td>
                         <td><input type='number' step='0.01' placeholder='Tempo da Final'></td>`;
        tableBody.appendChild(row);
    });
}

function selectWinners() {
    const rows = document.querySelectorAll('#finalTable tbody tr');
    let results = [];
    rows.forEach(row => {
        const trio = row.cells[0].textContent;
        const timeQualifying = parseFloat(row.cells[1].textContent) || 0;
        const timeFinal = parseFloat(row.cells[3].querySelector('input').value) || 0;
        results.push({ trio, totalTime: timeQualifying + timeFinal });
    });
    results.sort((a, b) => a.totalTime - b.totalTime);
    winners = results;
    updateWinnersTable();
}

function updateWinnersTable() {
    const tableBody = document.querySelector('#winnersTable tbody');
    tableBody.innerHTML = '';
    winners.forEach(winner => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${winner.trio}</td>
                         <td>${winner.totalTime.toFixed(2)}</td>`;
        tableBody.appendChild(row);
    });
}