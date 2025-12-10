
    
    // Sistema de TextBox com Cursor Piscante
      (function() {
        const textboxAddon = document.getElementById('inputText');
        const cursorAddon = document.getElementById('cursor-addon');

        // Função principal para inserir texto (usar nos teus botões existentes e color-box)
        window.insertTextIntoBox = function(text) {
            if (!textboxAddon) return;
            
            const start = textboxAddon.selectionStart;
            const end = textboxAddon.selectionEnd;
            const currentText = textboxAddon.value;
            
            // Insere o texto na posição atual do cursor
            textboxAddon.value = currentText.substring(0, start) + text + currentText.substring(end);
            
            // Reposiciona o cursor após o texto inserido
            const newPosition = start + text.length;
            textboxAddon.setSelectionRange(newPosition, newPosition);
            
            // Mantém o foco na textbox
            textboxAddon.focus();
            
            // Atualiza a visibilidade do cursor
            updateCursorVisibilityAddon();

            // Atualiza overlay (mark.js)
            if (typeof syncOverlay === 'function') {
                syncOverlay();
            }

            // Atualiza renderização MathJax
            if (typeof updateOutput === 'function') {
                updateOutput();
            }
        }
        
        // Função para chamar no onclick da color-box (exemplo)
        window.insertRGBFromColorBox = function(element) {
            const bgColor = window.getComputedStyle(element).backgroundColor;
            window.insertTextIntoBox(bgColor);
        }

        // Função para atualizar a visibilidade do cursor
        function updateCursorVisibilityAddon() {
            if (!textboxAddon || !cursorAddon) return;
            
            const isEmpty = textboxAddon.value.trim() === '';
            const isFocused = document.activeElement === textboxAddon;
            
            if (isEmpty && isFocused) {
                cursorAddon.style.display = 'block';
            } else {
                cursorAddon.style.display = 'none';
            }
        }

        // Função para chamar no onclick da color-box (exemplo)
        window.insertRGBFromColorBox = function(element) {
            const bgColor = window.getComputedStyle(element).backgroundColor;
            window.insertTextIntoBox(bgColor);
        }

        // Event listeners para a textbox
        if (textboxAddon) {
            textboxAddon.addEventListener('focus', updateCursorVisibilityAddon);
            textboxAddon.addEventListener('blur', updateCursorVisibilityAddon);
            textboxAddon.addEventListener('input', updateCursorVisibilityAddon);
            textboxAddon.addEventListener('keyup', updateCursorVisibilityAddon);
        }

        // Inicialização quando a página carrega
        document.addEventListener('DOMContentLoaded', function() {
            updateCursorVisibilityAddon();
            
            if (textboxAddon && textboxAddon.value.trim() === '') {
                textboxAddon.focus();
            }
        });
    })();
