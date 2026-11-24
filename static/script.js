const form = document.querySelector('#chatForm');
const input = document.querySelector('#messageInput');
const messages = document.querySelector('#chatMessages');
const scrollArea = document.querySelector('#chatScroll');
const sendButton = document.querySelector('#sendButton');
const projectName = document.querySelector('#projectName');
const projectContext = document.querySelector('#projectContext');
const projectTitle = document.querySelector('#activeProjectTitle');
const savedStatus = document.querySelector('#savedStatus');
let history = [];
let saveTimer;

function persistProject() {
    localStorage.setItem('entrelinhas-project', JSON.stringify({
        name: projectName.value.trim(),
        context: projectContext.value,
        history
    }));
    savedStatus.classList.add('visible');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => savedStatus.classList.remove('visible'), 900);
}

function appendMessage(role, content, animate = true) {
    const row = document.createElement('div');
    row.className = `message ${role}`;
    if (!animate) row.style.animation = 'none';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = content;
    row.append(bubble);
    messages.append(row);
    scrollArea.scrollTop = scrollArea.scrollHeight;
}

function showConversation() {
    document.querySelector('#welcome')?.remove();
    document.querySelector('#suggestions')?.remove();
}

function loadProject() {
    let saved;
    try {
        saved = JSON.parse(localStorage.getItem('entrelinhas-project') || '{}');
    } catch {
        saved = {};
    }
    projectName.value = saved.name || '';
    projectContext.value = saved.context || '';
    history = Array.isArray(saved.history) ? saved.history : [];
    projectTitle.textContent = saved.name || 'Uma página em branco';
    if (history.length) {
        showConversation();
        history.forEach(item => {
            if (item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string') {
                appendMessage(item.role, item.content, false);
            }
        });
    }
}

async function sendMessage(rawMessage) {
    const message = rawMessage.trim();
    if (!message || sendButton.disabled) return;

    showConversation();
    appendMessage('user', message);
    history.push({ role: 'user', content: message });
    persistProject();
    input.value = '';
    input.style.height = 'auto';
    sendButton.disabled = true;

    const typing = document.createElement('div');
    typing.className = 'message assistant';
    typing.id = 'typingIndicator';
    typing.innerHTML = '<div class="message-bubble typing"><i></i><i></i><i></i></div>';
    messages.append(typing);
    scrollArea.scrollTop = scrollArea.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                context: [projectName.value.trim(), projectContext.value.trim()].filter(Boolean).join('\n'),
                history: history.slice(0, -1)
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível obter uma resposta.');
        history.push({ role: 'assistant', content: data.reply });
        appendMessage('assistant', data.reply);
        persistProject();
    } catch (error) {
        appendMessage('assistant', error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
        document.querySelector('#typingIndicator')?.remove();
        sendButton.disabled = false;
        input.focus();
    }
}

form.addEventListener('submit', event => {
    event.preventDefault();
    sendMessage(input.value);
});
input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
});
input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
    }
});
document.querySelectorAll('[data-prompt]').forEach(button => {
    button.addEventListener('click', () => sendMessage(button.dataset.prompt));
});
[projectName, projectContext].forEach(field => field.addEventListener('input', () => {
    projectTitle.textContent = projectName.value.trim() || 'Uma página em branco';
    persistProject();
}));
document.querySelector('#newProject').addEventListener('click', () => {
    if (!window.confirm('Criar outro projeto? O contexto e a conversa atuais serão removidos deste navegador.')) return;
    history = [];
    projectName.value = '';
    projectContext.value = '';
    projectTitle.textContent = 'Uma página em branco';
    localStorage.removeItem('entrelinhas-project');
    messages.innerHTML = `
        <div class="welcome" id="welcome">
            <span class="welcome-mark" aria-hidden="true">¶</span>
            <p class="overline">BEM-VINDA AO SEU ATELIÊ</p>
            <h2>Toda história começa<br>com uma boa pergunta.</h2>
            <p class="welcome-copy">Traga uma ideia, um trecho ou um impasse. Vamos pensar juntas, mantendo sua voz no centro.</p>
        </div>
        <div class="prompt-list" id="suggestions">
            <button type="button" data-prompt="Tenho uma ideia inicial para uma história. Ajude-me a encontrar o que há de mais interessante nela.">Desenvolver uma ideia <span aria-hidden="true">↗</span></button>
            <button type="button" data-prompt="Estou travada no desenvolvimento do conflito. Faça algumas perguntas para me ajudar a encontrar caminhos.">Destravar o conflito <span aria-hidden="true">↗</span></button>
            <button type="button" data-prompt="Quero aprofundar um personagem sem cair em clichês. Por onde podemos começar?">Aprofundar personagem <span aria-hidden="true">↗</span></button>
        </div>`;
    document.querySelectorAll('[data-prompt]').forEach(button => {
        button.addEventListener('click', () => sendMessage(button.dataset.prompt));
    });
});
loadProject();
