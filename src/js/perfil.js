import { User } from './user.js';

class Dashboard {
    constructor(user) {
        this.user = user;
        this.activityList = [];
        this.initializeProfile();
    }

    initializeProfile() {
        if (this.user) {
            // Atualiza as informações no perfil
            const profileSection = document.getElementById('profile');
            if (profileSection) {
                // Calcula o total doado
                const totalDonated = this.user.donations ? this.user.donations.reduce((total, donation) => total + donation.value, 0) : 0;
                const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDonated);

                // Cria o HTML do histórico de doações
                const donationHistory = this.user.donations && this.user.donations.length > 0
                    ? this.user.donations.map(donation => `
                        <div class="donation-item">
                            <span class="donation-value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(donation.value)}</span>
                            <span class="donation-project">${donation.project}</span>
                            <span class="donation-date">${new Date(donation.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                    `).join('')
                    : '<p>Nenhuma doação realizada ainda.</p>';

                profileSection.innerHTML = `
                    <h2>Perfil do Usuário</h2>
                    <div class="info-item">
                        <strong>Nome:</strong>
                        <span>${this.user.name}</span>
                    </div>
                    <div class="info-item">
                        <strong>Email:</strong>
                        <span>${this.user.email}</span>
                    </div>
                    <div class="info-item">
                        <strong>Telefone:</strong>
                        <span>${this.user.phone}</span>
                    </div>
                    <div class="info-item">
                        <strong>CEP:</strong>
                        <span>${this.user.cep}</span>
                    </div>
                    <div class="info-item">
                        <strong>CPF:</strong>
                        <span>${this.user.cpf}</span>
                    </div>

                    <div class="donations-section">
                        <h3>Minhas Doações</h3>
                        <div class="total-donated">
                            <strong>Total Doado:</strong>
                            <span>${formattedTotal}</span>
                        </div>
                        <div class="donation-history">
                            <h4>Histórico de Doações</h4>
                            ${donationHistory}
                        </div>
                    </div>
                `;
            }
            this.addActivity('Perfil visualizado em ' + new Date().toLocaleDateString());
        }
    }

    addActivity(activity) {
        this.activityList.push(activity);
        this.renderActivity();
        this.saveActivities();
    }

    renderActivity() {
        const activityListElement = document.getElementById('activityList');
        if (activityListElement) {
            activityListElement.innerHTML = ''; // Limpa a lista atual
            this.activityList.forEach(activity => {
                const li = document.createElement('li');
                li.innerText = activity;
                activityListElement.appendChild(li);
            });
        }
    }

    saveActivities() {
        localStorage.setItem('userActivities', JSON.stringify(this.activityList));
    }

    loadActivities() {
        const savedActivities = localStorage.getItem('userActivities');
        if (savedActivities) {
            this.activityList = JSON.parse(savedActivities);
            this.renderActivity();
        }
    }
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    // Tenta carregar os dados do usuário da URL
    const urlParams = new URLSearchParams(window.location.search);
    const nome = urlParams.get('nome');
    const telefone = urlParams.get('telefone');
    const email = urlParams.get('email');
    const cep = urlParams.get('cep');
    const cpf = urlParams.get('cpf');

    // Se tiver dados na URL, cria um novo usuário
    if (nome && email) {
        const user = new User(nome, email, telefone, cep, cpf);
        user.save(); // Salva no localStorage
        
        // Cria o dashboard com o usuário
        const dashboard = new Dashboard(user);
        dashboard.loadActivities();
    } else {
        // Se não houver dados na URL, tenta carregar do localStorage
        const savedUser = User.load();
        if (savedUser) {
            const dashboard = new Dashboard(savedUser);
            dashboard.loadActivities();
        } else {
            console.log('Usuário não encontrado');
        }
    }
});