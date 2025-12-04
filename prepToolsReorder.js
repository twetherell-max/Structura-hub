document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('sortable-list');
    const sections = Array.from(mainContent.querySelectorAll('section'));

    const editOrderBtn = document.getElementById('editOrderBtn');
    const saveOrderBtn = document.getElementById('saveOrderBtn');
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');

    let sortableInstance = null;
    let originalOrder = [];
    let currentSectionOrder = [];

    // Initialize section IDs based on their H2 text content
    sections.forEach(section => {
        const h2 = section.querySelector('h2');
        if (h2 && !section.id) {
            section.id = h2.textContent.replace(/\s+/g, '');
        }
    });

    const enableSorting = () => {
        originalOrder = sortableInstance ? sortableInstance.toArray() : sections.map(s => s.id);
        if (!sortableInstance) {
            sortableInstance = Sortable.create(mainContent, {
                animation: 150,
                handle: 'h2', // Drag by the section title
                ghostClass: 'sortable-ghost',
                onEnd: function (evt) {
                    console.log('Moved element:', evt.item.id, 'to position', evt.newIndex);
                    currentSectionOrder = sortableInstance.toArray();
                }
            });
        }
        mainContent.classList.add('sorting-mode');
        editOrderBtn.style.display = 'none';
        saveOrderBtn.style.display = 'inline-block';
        cancelOrderBtn.style.display = 'inline-block';
        sections.forEach(section => section.classList.add('sortable-item'));
    };

    const disableSorting = () => {
        if (sortableInstance) {
            sortableInstance.destroy(); // Destroy the Sortable instance
            sortableInstance = null;
        }
        mainContent.classList.remove('sorting-mode');
        editOrderBtn.style.display = 'inline-block';
        saveOrderBtn.style.display = 'none';
        cancelOrderBtn.style.display = 'none';
        sections.forEach(section => section.classList.remove('sortable-item'));
    };

    const saveOrder = () => {
        const newOrder = sortableInstance.toArray();
        google.script.run
            .withSuccessHandler(() => {
                alert('Order saved successfully!');
                disableSorting();
            })
            .withFailureHandler(err => {
                alert('Failed to save order: ' + err.message);
                console.error(err);
                // Optionally revert to original order on failure
                sortableInstance.sort(originalOrder, false);
                disableSorting();
            })
            .saveSidebarOrder(newOrder);
    };

    const cancelOrder = () => {
        if (sortableInstance && originalOrder.length > 0) {
            sortableInstance.sort(originalOrder, false); // Revert to original order
        }
        disableSorting();
    };

    editOrderBtn.addEventListener('click', enableSorting);
    saveOrderBtn.addEventListener('click', saveOrder);
    cancelOrderBtn.addEventListener('click', cancelOrder);

    // Load initial order
    google.script.run
        .withSuccessHandler(loadedOrder => {
            if (loadedOrder && loadedOrder.length > 0) {
                // Ensure all current sections are in the loadedOrder, add new ones at the end
                const finalOrder = loadedOrder.filter(id => sections.some(s => s.id === id));
                sections.forEach(s => {
                    if (!finalOrder.includes(s.id)) {
                        finalOrder.push(s.id);
                    }
                });

                // Reorder DOM elements based on finalOrder
                finalOrder.forEach(id => {
                    const section = document.getElementById(id);
                    if (section) {
                        mainContent.appendChild(section);
                    }
                });
                currentSectionOrder = finalOrder;
            } else {
                currentSectionOrder = sections.map(s => s.id);
            }
            originalOrder = currentSectionOrder; // Set original order after loading
        })
        .withFailureHandler(err => {
            console.error('Failed to load order: ' + err.message);
            currentSectionOrder = sections.map(s => s.id); // Use default order on failure
            originalOrder = currentSectionOrder;
        })
        .getSidebarOrder(); // Call Apps Script to get the stored order
});