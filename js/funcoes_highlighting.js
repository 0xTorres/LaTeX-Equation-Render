const textarea = document.getElementById('inputText');
  const overlay = document.getElementById('highlightedText');
  const overlayBuffer = document.getElementById('highlightedBuffer');
  
  const markInstance = new Mark(overlay);
  const markBuffer = new Mark(overlayBuffer);
  
  // Variáveis de otimização para highlighting
  let highlightTimeout = null;
  let lastHighlightedText = '';
  
  overlay.style.display = 'none';
  
  function syncOverlay() {
  const currentText = textarea.value;
  if (currentText === lastHighlightedText) return;
  lastHighlightedText = currentText;

  // escreve o texto no buffer (não visível)
  overlayBuffer.textContent = currentText;

  // aplica highlight no buffer
  requestAnimationFrame(() => {
    markBuffer.unmark({
	  done: () => {
		
		//  1: Destacar comentários (para que sejam excluídos dos próximos)
		markBuffer.markRegExp(/<!--[\s\S]*?-->/g, { className: "red-comment" });
		
		// 2. Depois: destacar blocos LaTeX, EXCLUINDO os que estão dentro de comentários
		markBuffer.markRegExp(/(?<!\\)\$\$[\s\S]*?(?<!\\)\$\$/g, { 
		  className: "green-display", 
		  exclude: ['mark.red-comment'] 
		});
		markBuffer.markRegExp(/(?<!\\)\$(?!\$)(?:\\.|[^\\$])*(?<!\\)\$/g, { 
		  className: "green-inline", 
		  exclude: ['mark.red-comment', 'mark.green-display'] 
		});

		// Destaque de operadores MATEMÁTICOS: apenas dentro de LaTeX
		markBuffer.markRegExp(/[+\-*/=]/g, { 
		  className: "math-operator", 
		  exclude: ['mark.red-comment', 'mark.dark-orange-char', 'mark.orange-char'] 
		});

		// Destaque de sintaxe Markdown (fora e dentro do LaTeX)
		markBuffer.markRegExp(/\!\[[^\]]*\]/g, { className: "dark-orange-char" });
		markBuffer.markRegExp(/[\[\]\/!]/g, { className: "dark-orange-char" });
		markBuffer.markRegExp(/[()\{\}]/g, { className: "orange-char" });

		// Copiar resultado para o overlay visível
		overlay.innerHTML = overlayBuffer.innerHTML;
		overlay.scrollTop = textarea.scrollTop;
	  }
	});
  });
}
  
  // Debounced highlighting
  function handleHighlightInput() {
  if (highlightTimeout) {
    clearTimeout(highlightTimeout);
  }

  highlightTimeout = setTimeout(() => {
    syncOverlay();
  }, 10);
  }

  function handleScroll() {
    requestAnimationFrame(() => {
      overlay.scrollTop = textarea.scrollTop;
    });
  }

  textarea.addEventListener('input', handleHighlightInput);
  textarea.addEventListener('scroll', handleScroll);

  setTimeout(() => {
    overlay.style.display = 'block';
    syncOverlay();
  }, 500);