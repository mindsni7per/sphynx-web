function switchTab(tabId) {
    // Hide all tabs
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.add('hidden'));

    // Remove active styles from all buttons
    const buttons = document.querySelectorAll('nav button');
    buttons.forEach(btn => {
        btn.classList.remove('bg-accent', 'text-white');
        btn.classList.add('text-gray-400', 'hover:bg-gray-900', 'hover:text-white');
    });

    // Show target tab
    document.getElementById('tab-' + tabId).classList.remove('hidden');

    // Highlight active button
    const activeBtn = document.getElementById('btn-' + tabId);
    activeBtn.classList.remove('text-gray-400', 'hover:bg-gray-900', 'hover:text-white');
    activeBtn.classList.add('bg-accent', 'text-white');
}
