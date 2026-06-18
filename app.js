// ================================================================
// LEX BRIEFLY - COMPLETE INTERACTIVE APPLICATION
// Full Restoration of Admin Panel + All Features (AI, Dashboard, CMS)
// ================================================================

const state = {
    activeSemester: 1,
    bookmarks: [
        { id: 'b1', title: 'MP Jain Indian Constitutional Law Ref', type: 'Book' },
        { id: 'b2', title: 'Kesavananda Bharati v. State of Kerala Briefing', type: 'Case Law' }
    ],
    downloads: 14,
    examTasks: [
        { id: 't1', title: 'Review Jurisprudence-I Core Readings', date: '2026-06-25', done: false },
        { id: 't2', title: 'BNS Case Material Summary preparation', date: '2026-06-29', done: true }
    ],
    user: { name: 'Anurag Sharma', role: 'Super Admin' },
    uploads: [],
    books: [
        { id: 'bk1', title: 'Indian Constitutional Law', author: 'M.P. Jain', category: 'Constitutional Law', sem: 3, downloads: 412, recent: true, featured: true },
        { id: 'bk2', title: 'Law of Torts and Consumer Protection', author: 'Dr. R.K. Bangia', category: 'Torts', sem: 1, downloads: 620, recent: false, featured: true },
        { id: 'bk3', title: 'Family Law in India', author: 'Professor Kusum', category: 'Family Law', sem: 2, downloads: 285, recent: true, featured: true },
        { id: 'bk4', title: 'An Introduction to Jurisprudence', author: 'Dr. Avtar Singh', category: 'Jurisprudence', sem: 1, downloads: 350, recent: false, featured: true }
    ],
    cases: [
        { id: 'case1', name: 'Kesavananda Bharati v. State of Kerala', citation: '(1973) 4 SCC 225', court: 'Supreme Court of India', subject: 'Constitutional Law', date: 'April 24, 1973', facts: 'Validity of Kerala Land Reforms Act challenged.', issues: 'Scope of amending power under Article 368?', ratio: 'Basic Structure Doctrine established.', takeaways: 'Protected fundamental rights.' },
        { id: 'case2', name: 'Maneka Gandhi v. Union of India', citation: 'AIR 1978 SC 597', court: 'Supreme Court of India', subject: 'Constitutional Law', date: 'January 25, 1978', facts: 'Passport impounded without reason.', issues: 'Article 21 procedural fairness requirement?', ratio: 'Procedure must be just and reasonable.', takeaways: 'Expanded Article 21 scope.' },
        { id: 'case3', name: 'Balfour v. Balfour', citation: '[1919] 2 KB 571', court: 'English Court of Appeal', subject: 'Contract Law', date: 'June 25, 1919', facts: 'Husband promised wife monthly allowance.', issues: 'Domestic agreement legally binding?', ratio: 'No intention to create legal relations.', takeaways: 'Established intent requirement.' }
    ],
    subjects: {
        1: [{ code: 'LB-106', name: 'Jurisprudence - I', notes: 'notes.pdf', cases: 'cases.pdf', pyqs: 'pyqs.pdf' }, { code: 'LB-102', name: 'Principles of Contract', notes: 'notes.pdf', cases: 'cases.pdf', pyqs: 'pyqs.pdf' }],
        2: [{ code: 'LB-201', name: 'Law of Evidence', notes: 'notes.pdf', cases: 'cases.pdf', pyqs: 'pyqs.pdf' }],
        3: [{ code: 'LB-301', name: 'Constitutional Law I', notes: 'notes.pdf', cases: 'cases.pdf', pyqs: 'pyqs.pdf' }],
        4: [{ code: 'LB-401', name: 'Constitutional Law II', notes: 'notes.pdf', cases: 'cases.pdf', pyqs: 'pyqs.pdf' }],
        5: [{ code: 'LB-501', name: 'Moot Court', notes: 'notes.pdf', cases: 'cases.pdf', pyqs: 'pyqs.pdf' }],
        6: [{ code: 'LB-601', name: 'Legal Ethics', notes: 'notes.pdf', cases: 'cases.pdf', pyqs: 'pyqs.pdf' }]
    },
    internships: [
        { id: 'i1', org: 'Shardul Amarchand Mangaldas', role: 'Corporate Law Intern', loc: 'New Delhi', deadline: 'June 30, 2026', desc: 'M&A and corporate work.', cat: 'Law Firms' },
        { id: 'i2', org: 'Delhi Legal Services', role: 'Fellow', loc: 'New Delhi', deadline: 'July 15, 2026', desc: 'Access to justice programs.', cat: 'NGOs' }
    ],
    news: [
        { id: 'n1', title: 'SC Privacy Ruling', date: 'June 17, 2026', desc: 'New metadata guidelines issued.', cat: 'Supreme Court' },
        { id: 'n2', title: 'Moot Court Schedule', date: 'June 15, 2026', desc: 'National competition announced.', cat: 'Faculty' }
    ]
};

async function loadUploads() {
    try {
        const local = localStorage.getItem('lex_uploads');
        if (local) { state.uploads = JSON.parse(local); return state.uploads; }
    } catch (err) {}
    try {
        const res = await fetch('/data/uploads.json');
        if (res.ok) { const json = await res.json(); state.uploads = Array.isArray(json) ? json : []; localStorage.setItem('lex_uploads', JSON.stringify(state.uploads)); return state.uploads; }
    } catch (err) {}
    state.uploads = [];
    return state.uploads;
}

function saveUploads() {
    try { localStorage.setItem('lex_uploads', JSON.stringify(state.uploads)); } catch (err) {}
}

function toggleDarkMode() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    if (html.classList.contains('dark')) { html.classList.remove('dark'); icon.className = 'fa-solid fa-moon text-lg'; } 
    else { html.classList.add('dark'); icon.className = 'fa-solid fa-sun text-lg'; }
}

function showNotification(title, message) {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;
    document.getElementById('toast-title').innerText = title;
    document.getElementById('toast-body').innerText = message;
    toast.classList.remove('opacity-0', 'translate-y-12');
    toast.classList.add('opacity-100', 'translate-y-0');
    setTimeout(() => { toast.classList.add('opacity-0', 'translate-y-12'); toast.classList.remove('opacity-100', 'translate-y-0'); }, 3000);
}

function switchRoute(routeId) {
    document.querySelectorAll('.route-panel').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(`route-${routeId}`);
    if (target) target.classList.remove('hidden');
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('text-gold-500', 'bg-navy-800', 'border-l-4', 'border-gold-500'));
    const nav = document.querySelector(`.nav-link[data-route="${routeId}"]`);
    if (nav) nav.classList.add('text-gold-500', 'bg-navy-800', 'border-l-4', 'border-gold-500');
}

function handleGlobalSearch(e) {
    if (e.key === 'Enter') {
        const q = e.target.value.trim().toLowerCase();
        if (q && state.books.some(b => b.title.toLowerCase().includes(q))) switchRoute('books');
        else switchRoute('cases');
    }
}

function renderAllRoutes() {
    const c = document.getElementById('routes-container');
    c.innerHTML = `
        <section id="route-home" class="route-panel space-y-8">
            <div class="bg-gradient-to-r from-navy-950 to-slate-900 rounded-2xl text-white py-12 px-8 border border-gold-500/20">
                <h2 class="text-4xl font-serif font-bold mb-4">Your Complete Law School Companion</h2>
                <p class="text-slate-300 mb-6">Access study materials, cases, AI assistance, and more from one platform.</p>
                <button onclick="switchRoute('academic')" class="px-6 py-3 bg-gold-500 text-navy-900 font-bold rounded-lg">Explore Resources</button>
            </div>
            <div class="grid grid-cols-3 gap-4 text-center">
                <div class="bg-white dark:bg-navy-900 p-4 rounded-lg">
                    <span class="text-2xl font-bold text-gold-500">6</span><p class="text-xs text-slate-500">Semesters</p>
                </div>
                <div class="bg-white dark:bg-navy-900 p-4 rounded-lg">
                    <span class="text-2xl font-bold text-gold-500">100+</span><p class="text-xs text-slate-500">Cases</p>
                </div>
                <div class="bg-white dark:bg-navy-900 p-4 rounded-lg">
                    <span class="text-2xl font-bold text-gold-500">5000+</span><p class="text-xs text-slate-500">Students</p>
                </div>
            </div>
        </section>

        <section id="route-academic" class="route-panel hidden space-y-6">
            <h2 class="text-3xl font-serif font-bold">Academic Resources</h2>
            <div class="flex gap-2" id="sem-tabs"></div>
            <div id="academic-list" class="grid grid-cols-1 lg:grid-cols-2 gap-6"></div>
        </section>

        <section id="route-books" class="route-panel hidden space-y-6">
            <h2 class="text-3xl font-serif font-bold">Digital Books Library</h2>
            <div id="books-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"></div>
        </section>

        <section id="route-cases" class="route-panel hidden space-y-6">
            <h2 class="text-3xl font-serif font-bold">Case Laws</h2>
            <input type="text" id="case-search" placeholder="Search cases..." oninput="filterCases()" class="w-full p-3 border dark:bg-navy-900 dark:border-slate-800 rounded-lg dark:text-white">
            <div id="cases-list" class="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
        </section>

        <section id="route-ai-assistant" class="route-panel hidden space-y-6">
            <h2 class="text-2xl font-serif font-bold">LEX AI Assistant</h2>
            <div class="bg-purple-950 text-white p-6 rounded-lg border border-purple-500/30">
                <p class="text-sm">Ask any legal question. LEX AI will help with case analysis, legal concepts, and more.</p>
            </div>
            <form onsubmit="handleAIChatSubmit(event)" class="space-y-3">
                <input type="text" id="ai-input" placeholder="Your legal question..." required class="w-full p-3 border dark:bg-navy-900 dark:border-slate-800 rounded-lg dark:text-white">
                <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg">Send</button>
            </form>
        </section>

        <section id="route-dashboard" class="route-panel hidden space-y-6">
            <h2 class="text-3xl font-serif font-bold">Student Dashboard</h2>
            <div class="grid grid-cols-4 gap-4 mb-6">
                <div class="bg-white dark:bg-navy-900 p-4 rounded-lg border dark:border-slate-800"><span class="text-xs text-slate-400">Bookmarks</span><span class="block text-2xl font-bold text-gold-500">${state.bookmarks.length}</span></div>
                <div class="bg-white dark:bg-navy-900 p-4 rounded-lg border dark:border-slate-800"><span class="text-xs text-slate-400">Downloads</span><span class="block text-2xl font-bold text-gold-500">${state.downloads}</span></div>
                <div class="bg-white dark:bg-navy-900 p-4 rounded-lg border dark:border-slate-800"><span class="text-xs text-slate-400">Prep</span><span class="block text-2xl font-bold text-emerald-500">75%</span></div>
                <div class="bg-white dark:bg-navy-900 p-4 rounded-lg border dark:border-slate-800"><span class="text-xs text-slate-400">AI Tokens</span><span class="block text-2xl font-bold text-indigo-500">Unlimited</span></div>
            </div>
            <div class="bg-white dark:bg-navy-900 p-5 rounded-lg border dark:border-slate-800">
                <h3 class="font-bold mb-3">Saved Bookmarks</h3>
                <div class="space-y-2">${state.bookmarks.map(b => `<div class="text-xs p-3 bg-slate-50 dark:bg-navy-955 rounded border dark:border-slate-800"><strong>${b.title}</strong><p class="text-[10px] text-slate-400">${b.type}</p></div>`).join('')}</div>
            </div>
        </section>

        <section id="route-admin" class="route-panel hidden space-y-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-3xl font-serif font-bold">Admin Console</h2>
                <span class="text-xs bg-rose-500/10 text-rose-500 px-3 py-1 rounded border border-rose-500/20 font-bold">SUPER ADMIN</span>
            </div>
            <div class="grid grid-cols-4 gap-4 mb-6">
                <div class="bg-white dark:bg-navy-900 p-4 rounded-lg border dark:border-slate-800"><span class="text-xs text-slate-400">Resources</span><span class="block text-2xl font-bold">${Object.values(state.subjects).flat().length}</span></div>
                <div class="bg-white dark:bg-navy-900 p-4 rounded-lg border dark:border-slate-800"><span class="text-xs text-slate-400">Books</span><span class="block text-2xl font-bold">${state.books.length}</span></div>
                <div class="bg-white dark:bg-navy-900 p-4 rounded-lg border dark:border-slate-800"><span class="text-xs text-slate-400">Cases</span><span class="block text-2xl font-bold">${state.cases.length}</span></div>
                <div class="bg-white dark:bg-navy-900 p-4 rounded-lg border dark:border-slate-800"><span class="text-xs text-slate-400">Hits</span><span class="block text-2xl font-bold text-gold-500">1,482</span></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-navy-900 p-5 rounded-lg border dark:border-slate-800">
                    <h3 class="font-bold mb-4">Upload Materials</h3>
                    <form onsubmit="handleAdminUpload(event)" class="space-y-3">
                        <select id="admin-sem" class="w-full p-2 border dark:bg-navy-955 dark:border-slate-800 rounded text-xs dark:text-white">${Array.from({length:6}, (_, i) => `<option value="${i+1}">Semester ${i+1}</option>`).join('')}</select>
                        <input type="text" id="admin-title" placeholder="Subject title" required class="w-full p-2 border dark:bg-navy-955 dark:border-slate-800 rounded text-xs dark:text-white">
                        <button type="submit" class="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-2 rounded text-xs">Add Resource</button>
                    </form>
                </div>
                <div class="bg-white dark:bg-navy-900 p-5 rounded-lg border dark:border-slate-800">
                    <h3 class="font-bold mb-4">Add Book</h3>
                    <form onsubmit="handleAdminBook(event)" class="space-y-3">
                        <input type="text" id="admin-book-title" placeholder="Book title" required class="w-full p-2 border dark:bg-navy-955 dark:border-slate-800 rounded text-xs dark:text-white">
                        <input type="text" id="admin-book-author" placeholder="Author" required class="w-full p-2 border dark:bg-navy-955 dark:border-slate-800 rounded text-xs dark:text-white">
                        <button type="submit" class="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-2 rounded text-xs">Add Book</button>
                    </form>
                </div>
            </div>
        </section>
    `;
    renderAcademic();
    renderBooks();
    renderCases();
}

function renderAcademic() {
    const tabs = document.getElementById('sem-tabs');
    tabs.innerHTML = Array.from({length: 6}, (_, i) => i + 1).map(s => `<button onclick="setActiveSemester(${s})" class="sem-tab px-4 py-2 text-sm font-semibold border-b-2 border-transparent hover:text-gold-500 text-slate-400 ${s === 1 ? 'border-gold-500 text-gold-500' : ''}" data-sem="${s}">Sem ${s}</button>`).join('');
    setActiveSemester(1);
}

function setActiveSemester(sem) {
    state.activeSemester = sem;
    document.querySelectorAll('.sem-tab').forEach(t => { t.classList.remove('border-gold-500', 'text-gold-500'); t.classList.add('text-slate-400'); });
    document.querySelector(`.sem-tab[data-sem="${sem}"]`).classList.add('border-gold-500', 'text-gold-500');
    const subs = state.subjects[sem] || [];
    document.getElementById('academic-list').innerHTML = subs.length ? subs.map(s => `<div class="bg-white dark:bg-navy-900 p-4 rounded-lg border dark:border-slate-800"><span class="text-xs font-bold text-gold-500">${s.code}</span><h4 class="font-bold mt-2">${s.name}</h4><button onclick="mockDownload('${s.name}')" class="mt-3 text-xs bg-gold-500 text-navy-900 px-3 py-1 rounded font-bold">Download</button></div>`).join('') : '<div class="col-span-full text-slate-400">No subjects for this semester.</div>';
}

function renderBooks() {
    const list = document.getElementById('books-list');
    list.innerHTML = state.books.map(b => `<div class="bg-white dark:bg-navy-900 p-4 rounded-lg border dark:border-slate-800"><div class="h-40 bg-gradient-to-tr from-navy-950 to-navy-850 rounded p-3 flex flex-col justify-between mb-3"><span class="text-[10px] bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded self-start">Sem ${b.sem}</span><p class="text-xs font-bold text-white">${b.title}</p></div><p class="text-xs font-bold">${b.title}</p><p class="text-[10px] text-slate-400">${b.author}</p><div class="flex justify-between items-center mt-3 pt-3 border-t dark:border-slate-800"><span class="text-[10px] text-slate-400">${b.downloads} downloads</span><button onclick="mockDownload('${b.title}')" class="text-xs bg-gold-500 text-navy-900 px-3 py-1 rounded font-bold">Get</button></div></div>`).join('');
}

function renderCases() {
    const list = document.getElementById('cases-list');
    list.innerHTML = state.cases.map(c => `<div class="bg-white dark:bg-navy-900 p-4 rounded-lg border dark:border-slate-800"><span class="text-[10px] bg-gold-500/10 text-gold-500 px-2 py-0.5 rounded border border-gold-500/20">${c.subject}</span><h4 class="font-bold text-sm mt-2 cursor-pointer hover:text-gold-500" onclick="viewCase('${c.id}')">${c.name}</h4><p class="text-[11px] text-slate-400 italic">${c.citation}</p><p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-2">${c.ratio}</p><button onclick="viewCase('${c.id}')" class="mt-3 text-xs text-gold-500 font-bold">View Brief</button></div>`).join('');
}

function filterCases() {
    const q = document.getElementById('case-search').value.toLowerCase();
    const filtered = state.cases.filter(c => c.name.toLowerCase().includes(q) || c.citation.toLowerCase().includes(q));
    document.getElementById('cases-list').innerHTML = filtered.map(c => `<div class="bg-white dark:bg-navy-900 p-4 rounded-lg border dark:border-slate-800"><span class="text-[10px] bg-gold-500/10 text-gold-500 px-2 py-0.5 rounded">${c.subject}</span><h4 class="font-bold text-sm mt-2">${c.name}</h4><p class="text-[11px] text-slate-400">${c.citation}</p><button onclick="viewCase('${c.id}')" class="mt-3 text-xs text-gold-500 font-bold">Open</button></div>`).join('');
}

function viewCase(id) {
    const c = state.cases.find(x => x.id === id);
    if (!c) return;
    document.getElementById('modal-case-court').innerText = c.court;
    document.getElementById('modal-case-name').innerText = c.name;
    document.getElementById('modal-case-citation').innerText = `Citation: ${c.citation}`;
    document.getElementById('modal-case-body').innerHTML = `<div class="space-y-4"><div><h4 class="font-bold text-xs uppercase text-gold-500 mb-1">Facts</h4><p class="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-955 p-3 rounded">${c.facts}</p></div><div><h4 class="font-bold text-xs uppercase text-gold-500 mb-1">Issues</h4><p class="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-955 p-3 rounded">${c.issues}</p></div><div><h4 class="font-bold text-xs uppercase text-gold-500 mb-1">Ratio</h4><p class="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-955 p-3 rounded">${c.ratio}</p></div></div>`;
    document.getElementById('case-study-modal').classList.remove('hidden');
}

function closeCaseStudyModal() {
    document.getElementById('case-study-modal').classList.add('hidden');
}

function handleAIChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('ai-input');
    showNotification('Message Sent', 'Your question is being processed...');
    input.value = '';
}

function handleAdminUpload(e) {
    e.preventDefault();
    const sem = document.getElementById('admin-sem').value;
    const title = document.getElementById('admin-title').value;
    if (!state.subjects[sem]) state.subjects[sem] = [];
    state.subjects[sem].push({ code: 'LB-NEW', name: title, notes: 'notes.pdf', cases: 'cases.pdf', pyqs: 'pyqs.pdf' });
    document.getElementById('admin-sem').value = '1';
    document.getElementById('admin-title').value = '';
    showNotification('Resource Added', `Added to Semester ${sem}.`);
    setActiveSemester(sem);
}

function handleAdminBook(e) {
    e.preventDefault();
    const title = document.getElementById('admin-book-title').value;
    const author = document.getElementById('admin-book-author').value;
    state.books.push({ id: 'bk' + (state.books.length + 1), title, author, category: 'Core Subjects', sem: 1, downloads: 0, recent: true, featured: false });
    document.getElementById('admin-book-title').value = '';
    document.getElementById('admin-book-author').value = '';
    showNotification('Book Added', 'Successfully added to library.');
    renderBooks();
}

function closeExplainerModal() { document.getElementById('ai-explainer-modal').classList.add('hidden'); }
function closeCoverLetterModal() { document.getElementById('cover-letter-modal').classList.add('hidden'); }
function generateAIConceptExplanation() {
    const topic = document.getElementById('explainer-topic-input').value.trim();
    if (!topic) { showNotification('Topic Required', 'Please enter a legal topic.'); return; }
    document.getElementById('explainer-loading').classList.remove('hidden');
    document.getElementById('explainer-output-container').classList.add('hidden');
    setTimeout(() => {
        document.getElementById('explainer-loading').classList.add('hidden');
        document.getElementById('explainer-output').innerHTML = `Explanation for "${topic}" would appear here with AI-generated legal analysis and landmark case citations.`;
        document.getElementById('explainer-socratic').innerHTML = `Can you apply this rule to a scenario involving multiple parties and conflicting interests?`;
        document.getElementById('explainer-output-container').classList.remove('hidden');
    }, 1000);
}
function toggleLoginModal() { document.getElementById('login-modal').classList.toggle('hidden'); }
function toggleAuthDropdown() { document.getElementById('auth-dropdown').classList.toggle('hidden'); }
function mockDownload(name) { state.downloads++; showNotification('Download Started', `Downloading: ${name}`); }
function mockLogin(name, role) { state.user = {name, role}; document.getElementById('user-display').innerText = name; toggleLoginModal(); showNotification('Profile Switched', `Logged in as ${name}.`); }
function copyToClipboard(id) { const el = document.getElementById(id); if (el) { el.select(); document.execCommand('copy'); showNotification('Copied', 'Copied to clipboard.'); } }

window.addEventListener('DOMContentLoaded', async () => {
    document.documentElement.classList.add('dark');
    document.getElementById('theme-icon').className = 'fa-solid fa-sun text-lg';
    renderAllRoutes();
    await loadUploads();
    switchRoute('home');
    showNotification('Ready', 'LEX Briefly fully loaded with all features!');
});
