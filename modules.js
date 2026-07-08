// Module tracking functionality
const tableBody = document.querySelector('#characterTable tbody');

// Store for undo operations
let undoState = null;
let undoTimeout = null;

// Storage key
const storageKey = 'nte_characters';

// Module icons from modules folder
const moduleIcons = {
    'Type II Module 1.png': 'modules/Type II Module 1.png',
    'Type II Module 2.png': 'modules/Type II Module 2.png',
    'Type III Module 1.png': 'modules/Type III Module 1.png',
    'Type III Module 2.png': 'modules/Type III Module 2.png',
    'Type III Module 3.png': 'modules/Type III Module 3.png',
    'Type III Module 4.png': 'modules/Type III Module 4.png',
    'Type III Module 5.png': 'modules/Type III Module 5.png',
    'Type III Module 6.png': 'modules/Type III Module 6.png',
    'Type IV Module 1.png': 'modules/Type IV Module 1.png',
    'Type IV Module 2.png': 'modules/Type IV Module 2.png',
    'Type IV Module 3.png': 'modules/Type IV Module 3.png',
    'Type IV Module 4.png': 'modules/Type IV Module 4.png'
};

// Character icons from characters folder
const characterIcons = {
    'Adler': 'characters/Adler.webp',
    'Aurelia': 'characters/Aurelia.webp',
    'Baicang': 'characters/Baicang.webp',
    'Chaos': 'characters/Chaos.webp',
    'Chiz': 'characters/Chiz.webp',
    'Daffodill': 'characters/Daffodill.webp',
    'Edgar': 'characters/Edgar.webp',
    'Fadia': 'characters/Fadia.webp',
    'Haniel': 'characters/Haniel.webp',
    'Hathor': 'characters/Hathor.webp',
    'Hotori': 'characters/Hotori.webp',
    'Iroi': 'characters/Iroi.webp',
    'Jiuyuan': 'characters/Jiuyuan.webp',
    'Lacrimosa': 'characters/Lacrimosa.webp',
    'Mint': 'characters/Mint.webp',
    'Nanally': 'characters/Nanally.webp',
    'Sakiri': 'characters/Sakiri.webp',
    'Shinku': 'characters/Shinku.webp',
    'Skia': 'characters/Skia.webp',
    'Zero': 'characters/Zero.webp'
};

// Get all module names
function getModuleNames() {
    return Object.keys(moduleIcons);
}

// Get all character names
function getCharacterNames() {
    return Object.keys(characterIcons);
}

// Load characters from storage
function loadCharacters() {
    const data = localStorage.getItem(storageKey);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Error parsing character data:', e);
            return [];
        }
    }
    return [];
}

// Save characters to storage
function saveCharacters(characters) {
    localStorage.setItem(storageKey, JSON.stringify(characters));
}

// Calculate total module requirements
function calculateTotalModules() {
    const characters = loadCharacters();
    const totalModules = {};
    
    characters.forEach(character => {
        if (character.modules) {
            character.modules.forEach((module, index) => {
                if (module && module.count > 0) {
                    if (!totalModules[module.name]) {
                        totalModules[module.name] = 0;
                    }
                    totalModules[module.name] += module.count;
                }
            });
        }
    });
    
    return totalModules;
}

// Render module summary
function renderModuleSummary() {
    const totalModules = calculateTotalModules();
    const summaryGrid = document.getElementById('summaryGrid');
    
    if (Object.keys(totalModules).length === 0) {
        summaryGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>No modules tracked yet</p>
            </div>`;
        return;
    }
    
    let html = '';
    const sortedModules = Object.keys(totalModules).sort((a, b) => {
      if (totalModules[b] !== totalModules[a]) {
        return totalModules[b] - totalModules[a]; // descending by count
      }
      return a.localeCompare(b); // ascending alphabetical by name for ties
    });
    
    sortedModules.forEach(moduleName => {
        const iconPath = moduleIcons[moduleName];
        const count = totalModules[moduleName];
        // Remove file extension for display
        const displayName = moduleName.replace(/\.[^/.]+$/, "");
        
        html += `
            <div class="summary-item">
                <img src="${iconPath}" alt="${moduleName}" onerror="this.style.display='none'">
                <div class="count">${count}</div>
                <span>${displayName}</span>
            </div>`;
    });
    
    summaryGrid.innerHTML = html;
}

// Save character list
function saveCharacterList(characters) {
    localStorage.setItem(storageKey, JSON.stringify(characters));
}

// Load character list
function loadCharacterList() {
    const jsonString = localStorage.getItem(storageKey);
    if (jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error('Error parsing character data:', e);
            return [];
        }
    }
    return [];
}

// Render character table
function renderTable() {
    const characters = loadCharacterList();
    const moduleNames = getModuleNames();
    
    tableBody.innerHTML = '';
    
    if (characters.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state">
                    <i class="fas fa-user"></i>
                    <p>No characters tracked yet</p>
                </td>
            </tr>`;
        return;
    }
    
    characters.forEach((character, index) => {
        const row = document.createElement('tr');
        
        // Character cell with icon
        const charCell = document.createElement('td');
        const charDiv = document.createElement('div');
        charDiv.className = 'character-cell';
        
        const charImg = document.createElement('img');
        const charName = character.character || 'Unknown Character';
        const iconPath = characterIcons[charName];
        
        if (iconPath) {
            charImg.src = iconPath;
            charImg.onerror = function() {
                this.style.display = 'none';
            };
        }
        
        const charSpan = document.createElement('span');
        charSpan.textContent = charName;
        
        charDiv.appendChild(charImg);
        charDiv.appendChild(charSpan);
        charCell.appendChild(charDiv);
        row.appendChild(charCell);
        
        // Modules cell - combined view
        const modulesCell = document.createElement('td');
        const modulesContainer = document.createElement('div');
        modulesContainer.className = 'modules-container';
        modulesContainer.style.display = 'flex';
        modulesContainer.style.flexWrap = 'wrap';
        modulesContainer.style.justifyContent = 'center';
        
        // Ensure modules array exists
        if (!character.modules) {
            character.modules = [];
        }
        
        // Sort modules alphabetically by name
        character.modules.sort((a, b) => a.name.localeCompare(b.name));
        
        // Render all modules
        character.modules.forEach((module, i) => {
            const moduleWrapper = document.createElement('div');
            moduleWrapper.style.display = 'flex';
            moduleWrapper.style.flexDirection = 'column';
            moduleWrapper.style.alignItems = 'center';
            moduleWrapper.style.gap = '4px';
            moduleWrapper.style.padding = '8px';
            moduleWrapper.style.background = 'rgba(255,255,255,0.05)';
            moduleWrapper.style.borderRadius = '8px';
            moduleWrapper.style.minWidth = '120px';
            moduleWrapper.style.cursor = 'pointer';
            moduleWrapper.style.transition = 'all 0.2s';
            moduleWrapper.onmouseover = () => {
                moduleWrapper.style.backgroundColor = 'rgba(255,255,255,0.1)';
                moduleWrapper.style.transform = 'translateY(-2px)';
            };
            moduleWrapper.onmouseout = () => {
                moduleWrapper.style.backgroundColor = 'rgba(255,255,255,0.05)';
                moduleWrapper.style.transform = 'translateY(0)';
            };
            
            // Module icon
            const moduleImg = document.createElement('img');
            const iconPath = moduleIcons[module.name];
            if (iconPath) {
                moduleImg.src = iconPath;
                moduleImg.style.width = '74px';
                moduleImg.style.height = '74px';
                moduleImg.style.objectFit = 'contain';
            } else {
                moduleImg.src = '';
                moduleImg.style.width = '50px';
                moduleImg.style.height = '50px';
                moduleImg.style.display = 'none';
            }
            moduleImg.onerror = function() {
                this.style.display = 'none';
            };
            
            // Module name
            const moduleNameSpan = document.createElement('span');
            // Remove file extension for display
            const displayName = module.name ? module.name.replace(/\.[^/.]+$/, "") : 'Unknown';
            moduleNameSpan.textContent = displayName;
            moduleNameSpan.style.fontSize = '12px';
            moduleNameSpan.style.color = '#aaa';
            moduleNameSpan.style.textAlign = 'center';
            moduleNameSpan.style.maxWidth = '100px';
            moduleNameSpan.style.overflow = 'hidden';
            moduleNameSpan.style.textOverflow = 'ellipsis';
            moduleNameSpan.style.whiteSpace = 'nowrap';
            
            // Count display and controls
            const countDiv = document.createElement('div');
            countDiv.style.display = 'flex';
            countDiv.style.alignItems = 'center';
            countDiv.style.gap = '6px';
            
            // Decrease count button
            const decBtn = document.createElement('button');
            decBtn.innerHTML = '<i class="fas fa-minus"></i>';
            decBtn.style.background = 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)';
            decBtn.style.color = 'white';
            decBtn.style.border = 'none';
            decBtn.style.borderRadius = '4px';
            decBtn.style.padding = '4px 8px';
            decBtn.style.cursor = 'pointer';
            decBtn.style.fontSize = '10px';
            decBtn.style.transition = 'all 0.2s';
            decBtn.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
            decBtn.onmouseover = () => { decBtn.style.transform = 'scale(1.1)'; };
            decBtn.onmouseout = () => { decBtn.style.transform = 'scale(1)'; };
            decBtn.onclick = (e) => {
                e.stopPropagation();
                if (character.modules[i].count > 0) {
                    character.modules[i].count--;
                    saveCharacterList(characters);
                    renderTable();
                    renderModuleSummary();
                }
            };
            
            // Count display
            const countSpan = document.createElement('span');
            countSpan.textContent = module.count;
            countSpan.style.fontSize = '16px';
            countSpan.style.fontWeight = 'bold';
            countSpan.style.color = '#4fc3f7';
            countSpan.style.minWidth = '20px';
            countSpan.style.textAlign = 'center';
            
            // Increase count button
            const incBtn = document.createElement('button');
            incBtn.innerHTML = '<i class="fas fa-plus"></i>';
            incBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
            incBtn.style.color = 'white';
            incBtn.style.border = 'none';
            incBtn.style.borderRadius = '4px';
            incBtn.style.padding = '4px 8px';
            incBtn.style.cursor = 'pointer';
            incBtn.style.fontSize = '10px';
            incBtn.style.transition = 'all 0.2s';
            incBtn.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
            incBtn.onmouseover = () => { incBtn.style.transform = 'scale(1.1)'; };
            incBtn.onmouseout = () => { incBtn.style.transform = 'scale(1)'; };
            incBtn.onclick = (e) => {
                e.stopPropagation();
                if (character.modules[i].count < 6) {
                    character.modules[i].count++;
                    saveCharacterList(characters);
                    renderTable();
                    renderModuleSummary();
                }
            };
            
            countDiv.appendChild(decBtn);
            countDiv.appendChild(countSpan);
            countDiv.appendChild(incBtn);
            
            // Remove module button
            const removeModuleBtn = document.createElement('button');
            removeModuleBtn.innerHTML = '<i class="fas fa-trash"></i>';
            removeModuleBtn.style.background = 'linear-gradient(135deg, #fa4646 0%, #ff6b6b 100%)';
            removeModuleBtn.style.color = 'white';
            removeModuleBtn.style.border = 'none';
            removeModuleBtn.style.borderRadius = '4px';
            removeModuleBtn.style.padding = '4px 8px';
            removeModuleBtn.style.cursor = 'pointer';
            removeModuleBtn.style.fontSize = '10px';
            removeModuleBtn.style.marginTop = '4px';
            removeModuleBtn.style.transition = 'all 0.2s';
            removeModuleBtn.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
            removeModuleBtn.onmouseover = () => { removeModuleBtn.style.transform = 'scale(1.1)'; };
            removeModuleBtn.onmouseout = () => { removeModuleBtn.style.transform = 'scale(1)'; };
            removeModuleBtn.onclick = (e) => {
                e.stopPropagation();
                character.modules.splice(i, 1);
                saveCharacterList(characters);
                renderTable();
                renderModuleSummary();
            };
            
            moduleWrapper.appendChild(moduleImg);
            moduleWrapper.appendChild(moduleNameSpan);
            moduleWrapper.appendChild(countDiv);
            moduleWrapper.appendChild(removeModuleBtn);
            modulesContainer.appendChild(moduleWrapper);
        });
        
        modulesCell.appendChild(modulesContainer);
        
        // Add Module button - placed below modules in its own centered container
        const addModuleBtn = document.createElement('button');
        addModuleBtn.className = 'delete-btn';
        addModuleBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
        addModuleBtn.style.fontSize = '14px';
        addModuleBtn.style.padding = '8px 16px';
        addModuleBtn.innerHTML = '<i class="fas fa-plus"></i> Add Module';
        addModuleBtn.style.marginTop = '10px';
        addModuleBtn.onclick = () => {
            showModuleSelectionPopup(characters, index);
        };
        modulesCell.appendChild(addModuleBtn);
        row.appendChild(modulesCell);
        
        // Delete button
        const actionCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.onclick = () => {
            showConfirm({
                title: 'Delete Character',
                message: `Are you sure you want to delete <strong>${character.character || 'this character'}</strong>?`,
                confirmText: 'Delete',
                cancelText: 'Cancel',
                onConfirm: () => {
                    const deletedCharacter = characters[index];
                    const deletedIndex = index;
                    characters.splice(index, 1);
                    saveCharacterList(characters);
                    renderTable();
                    renderModuleSummary();
                    showUndoToast({
                        message: `Deleted ${deletedCharacter.character || 'character'}`,
                        onUndo: () => {
                            characters.splice(deletedIndex, 0, deletedCharacter);
                            saveCharacterList(characters);
                            renderTable();
                            renderModuleSummary();
                        }
                    });
                }
            });
        };
        actionCell.appendChild(deleteBtn);
        row.appendChild(actionCell);
        
        tableBody.appendChild(row);
    });
}

// Add new character - shows character selection popup
document.getElementById('addCharacterBtn').onclick = () => {
    showCharacterSelectionPopup();
};

// Remove all characters
document.getElementById('removeAllBtn').onclick = () => {
    const characters = loadCharacterList();
    if (characters.length === 0) return;
    showConfirm({
        title: 'Clear All Characters',
        message: 'Are you sure you want to remove <strong>all characters</strong>?',
        confirmText: 'Clear All',
        cancelText: 'Cancel',
        onConfirm: () => {
            const previousCharacters = loadCharacterList();
            localStorage.removeItem(storageKey);
            renderTable();
            renderModuleSummary();
            showUndoToast({
                message: 'Cleared all characters',
                onUndo: () => {
                    saveCharacterList(previousCharacters);
                    renderTable();
                    renderModuleSummary();
                }
            });
        }
    });
};

// Export data
window.exportData = function() {
    const data = {
        characters: loadCharacters()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nte-tracker-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Import data
window.importData = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                if (data.characters) {
                    saveCharacters(data.characters);
                }
                renderModuleSummary();
                renderTable();
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    renderModuleSummary();
    renderTable();
});

// Custom confirmation dialog
function showConfirm(options) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        
        const icon = document.createElement('div');
        icon.className = 'confirm-icon';
        icon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
        
        const title = document.createElement('div');
        title.className = 'confirm-title';
        title.textContent = options.title || 'Confirm';
        
        const message = document.createElement('div');
        message.className = 'confirm-message';
        message.innerHTML = options.message || 'Are you sure?';
        
        const buttons = document.createElement('div');
        buttons.className = 'confirm-buttons';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-cancel';
        cancelBtn.textContent = options.cancelText || 'Cancel';
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            if (options.onCancel) options.onCancel();
            resolve(false);
        };
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn-confirm';
        confirmBtn.textContent = options.confirmText || 'Confirm';
        confirmBtn.onclick = () => {
            document.body.removeChild(overlay);
            if (options.onConfirm) options.onConfirm();
            resolve(true);
        };
        
        buttons.appendChild(cancelBtn);
        buttons.appendChild(confirmBtn);
        
        dialog.appendChild(icon);
        dialog.appendChild(title);
        dialog.appendChild(message);
        dialog.appendChild(buttons);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
        
        // Close on outside click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (overlay.parentNode) document.body.removeChild(overlay);
                }, 300);
                if (options.onCancel) options.onCancel();
                resolve(false);
            }
        };
        
        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (overlay.parentNode) document.body.removeChild(overlay);
                }, 300);
                if (options.onCancel) options.onCancel();
                resolve(false);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    });
}

// Undo toast notification
function showUndoToast(options) {
    // Remove any existing toast
    const existingToast = document.querySelector('.undo-toast');
    if (existingToast) {
        existingToast.remove();
    }
    if (undoTimeout) {
        clearTimeout(undoTimeout);
    }
    
    const toast = document.createElement('div');
    toast.className = 'undo-toast';
    
    const message = document.createElement('span');
    message.className = 'toast-message';
    message.textContent = options.message || 'Action completed';
    
    const undoBtn = document.createElement('button');
    undoBtn.className = 'undo-btn';
    undoBtn.innerHTML = '<i class="fas fa-undo"></i> Undo';
    undoBtn.onclick = () => {
        if (options.onUndo) options.onUndo();
        toast.classList.remove('active');
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 400);
        if (undoTimeout) {
            clearTimeout(undoTimeout);
        }
    };
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.onclick = () => {
        toast.classList.remove('active');
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 400);
        if (undoTimeout) {
            clearTimeout(undoTimeout);
        }
    };
    
    toast.appendChild(message);
    toast.appendChild(undoBtn);
    toast.appendChild(closeBtn);
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('active');
    });
    
    // Auto-hide after 8 seconds
    undoTimeout = setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 400);
    }, 8000);
}

// Character selection popup
function showCharacterSelectionPopup() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '1000';
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.backgroundColor = '#1a1a2e';
    modal.style.borderRadius = '12px';
    modal.style.padding = '20px';
    modal.style.width = '90%';
    modal.style.maxWidth = '400px';
    modal.style.maxHeight = '80vh';
    modal.style.overflowY = 'auto';
    modal.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.5)';
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Select Character';
    title.style.color = '#e0e0e0';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    modal.appendChild(title);
    
    // Search box
    const searchContainer = document.createElement('div');
    searchContainer.style.marginBottom = '15px';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search characters...';
    searchInput.style.width = '100%';
    searchInput.style.padding = '10px';
    searchInput.style.border = '2px solid #333';
    searchInput.style.borderRadius = '6px';
    searchInput.style.backgroundColor = '#0a0a0a';
    searchInput.style.color = '#fff';
    searchInput.style.fontSize = '14px';
    searchContainer.appendChild(searchInput);
    modal.appendChild(searchContainer);
    
    // Character grid
    const characterGrid = document.createElement('div');
    characterGrid.style.display = 'grid';
    characterGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(80px, 1fr))';
    characterGrid.style.gap = '10px';
    modal.appendChild(characterGrid);
    
    // Get character names and populate grid
    const characterNames = getCharacterNames();
    
    function populateGrid(filteredNames) {
        characterGrid.innerHTML = '';
        filteredNames.forEach(charName => {
            const charItem = document.createElement('div');
            charItem.style.textAlign = 'center';
            charItem.style.cursor = 'pointer';
            charItem.style.padding = '10px';
            charItem.style.borderRadius = '8px';
            charItem.style.transition = 'all 0.2s';
            charItem.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            
            const charImg = document.createElement('img');
            const iconPath = characterIcons[charName];
            if (iconPath) {
                charImg.src = iconPath;
                charImg.style.width = '50px';
                charImg.style.height = '50px';
                charImg.style.objectFit = 'contain';
                charImg.style.marginBottom = '8px';
                charImg.onerror = function() {
                    this.style.display = 'none';
                };
            }
            
            const charNameSpan = document.createElement('span');
            charNameSpan.textContent = charName;
            charNameSpan.style.fontSize = '12px';
            charNameSpan.style.color = '#aaa';
            charItem.appendChild(charImg);
            charItem.appendChild(charNameSpan);
            
            charItem.onclick = () => {
                // Add selected character
                const characters = loadCharacterList();
                characters.push({
                    character: charName,
                    modules: []
                });
                saveCharacterList(characters);
                renderTable();
                renderModuleSummary();
                document.body.removeChild(overlay);
            };
            
            charItem.onmouseover = () => {
                charItem.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                charItem.style.transform = 'translateY(-2px)';
            };
            
            charItem.onmouseout = () => {
                charItem.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                charItem.style.transform = 'translateY(0)';
            };
            
            characterGrid.appendChild(charItem);
        });
    }
    
    // Initial population
    populateGrid(characterNames);
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredNames = characterNames.filter(name => 
            name.toLowerCase().includes(searchTerm)
        );
        populateGrid(filteredNames);
    });
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cancel';
    closeBtn.style.width = '100%';
    closeBtn.style.padding = '10px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.backgroundColor = '#f093fb';
    closeBtn.style.color = 'white';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.transition = 'all 0.2s';
    closeBtn.onmouseover = () => {
        closeBtn.style.backgroundColor = '#f5576c';
        closeBtn.style.transform = 'translateY(-2px)';
    };
    closeBtn.onmouseout = () => {
        closeBtn.style.backgroundColor = '#f093fb';
        closeBtn.style.transform = 'translateY(0)';
    };
    closeBtn.onclick = () => {
        document.body.removeChild(overlay);
    };
    modal.appendChild(closeBtn);
    
    // Add modal to overlay and overlay to body
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close on outside click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
    
    // Focus search input
    searchInput.focus();
}

// Module selection popup (similar style to character selection popup)
function showModuleSelectionPopup(characters, charIndex) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '1000';
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.backgroundColor = '#1a1a2e';
    modal.style.borderRadius = '12px';
    modal.style.padding = '20px';
    modal.style.width = '90%';
    modal.style.maxWidth = '500px';
    modal.style.maxHeight = '80vh';
    modal.style.overflowY = 'auto';
    modal.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.5)';
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Select Module';
    title.style.color = '#e0e0e0';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    modal.appendChild(title);
    
    // Search box
    const searchContainer = document.createElement('div');
    searchContainer.style.marginBottom = '15px';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search modules...';
    searchInput.style.width = '100%';
    searchInput.style.padding = '10px';
    searchInput.style.border = '2px solid #333';
    searchInput.style.borderRadius = '6px';
    searchInput.style.backgroundColor = '#0a0a0a';
    searchInput.style.color = '#fff';
    searchInput.style.fontSize = '14px';
    searchContainer.appendChild(searchInput);
    modal.appendChild(searchContainer);
    
    // Module grid
    const moduleGrid = document.createElement('div');
    moduleGrid.style.display = 'grid';
    moduleGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
    moduleGrid.style.gap = '10px';
    modal.appendChild(moduleGrid);
    
    // Get module names
    const moduleNames = getModuleNames();
    
    function populateGrid(filteredNames) {
        moduleGrid.innerHTML = '';
        filteredNames.forEach(modName => {
            const modItem = document.createElement('div');
            modItem.style.textAlign = 'center';
            modItem.style.cursor = 'pointer';
            modItem.style.padding = '10px';
            modItem.style.borderRadius = '8px';
            modItem.style.transition = 'all 0.2s';
            modItem.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            
            const modImg = document.createElement('img');
            const iconPath = moduleIcons[modName];
            if (iconPath) {
                modImg.src = iconPath;
                modImg.style.width = '50px';
                modImg.style.height = '50px';
                modImg.style.objectFit = 'contain';
                modImg.style.marginBottom = '8px';
                modImg.onerror = function() {
                    this.style.display = 'none';
                };
            }
            
            const modNameSpan = document.createElement('span');
            // Remove file extension for display
            const displayName = modName.replace(/\.[^/.]+$/, "");
            modNameSpan.textContent = displayName;
            modNameSpan.style.fontSize = '11px';
            modNameSpan.style.color = '#aaa';
            modNameSpan.style.display = 'block';
            modNameSpan.style.wordBreak = 'break-word';
            
            modItem.appendChild(modImg);
            modItem.appendChild(modNameSpan);
            
            modItem.onclick = () => {
                // Add selected module to character
                characters[charIndex].modules.push({ name: modName, count: 1 });
                saveCharacterList(characters);
                renderTable();
                renderModuleSummary();
                document.body.removeChild(overlay);
            };
            
            modItem.onmouseover = () => {
                modItem.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                modItem.style.transform = 'translateY(-2px)';
            };
            
            modItem.onmouseout = () => {
                modItem.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                modItem.style.transform = 'translateY(0)';
            };
            
            moduleGrid.appendChild(modItem);
        });
    }
    
    // Initial population
    populateGrid(moduleNames);
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredNames = moduleNames.filter(name =>
            name.toLowerCase().includes(searchTerm)
        );
        populateGrid(filteredNames);
    });
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cancel';
    closeBtn.style.width = '100%';
    closeBtn.style.padding = '10px';
    closeBtn.style.marginTop = '15px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.backgroundColor = '#f093fb';
    closeBtn.style.color = 'white';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.transition = 'all 0.2s';
    closeBtn.onmouseover = () => {
        closeBtn.style.backgroundColor = '#f5576c';
        closeBtn.style.transform = 'translateY(-2px)';
    };
    closeBtn.onmouseout = () => {
        closeBtn.style.backgroundColor = '#f093fb';
        closeBtn.style.transform = 'translateY(0)';
    };
    closeBtn.onclick = () => {
        document.body.removeChild(overlay);
    };
    modal.appendChild(closeBtn);
    
    // Add modal to overlay and overlay to body
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close on outside click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
    
    // Focus search input
    searchInput.focus();
}
