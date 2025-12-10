// Declaracao newTab global
		let newTab;

		document.getElementById('openTabBtn').addEventListener('click', function() {
		  updateOutput(); // Renderiza o LaTeX antes de abrir o separador
      //atualiza o highlightedText para o mathjex nao renderizar o highlightedText dentro do separador atual
      setTimeout(() => {
        overlay.style.display = 'block';  // Exibe o overlay após o delay
        syncOverlay();                    // Atualiza o texto e destaques
      }, 500); // 500 ms de delay

		  const text = (renderedOutput.innerHTML || "Nenhum texto inserido.")
			.replace(/\n/g, "<br>");

		  if (!newTab || newTab.closed) {
			newTab = window.open();
			if (!newTab) {
			  console.error("Falha ao abrir um novo separador. O navegador pode estar a bloquear pop-ups.");
			  return;
			}

			// Monta o HTML da nova aba
			const html = `<!DOCTYPE html>
		<html lang="pt">
		<head>
		  <meta charset="UTF-8">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <title>Texto Gerado</title>
		  <style>
				@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab&display=swap');
				body { 
				  font-family: 'Roboto Slab', serif; 
				  padding: 1rem; 
				  text-align: center; 
				}
				pre#renderedOutput {
				  padding: 0.5rem 1rem;
				  background: white;
				  border-radius: 8px;
				  border: 1px solid #27ae60;
				  overflow-y: fit-content;
				  font-size: 1.125rem;
				  line-height: 1.3;
				  color: #111;
				  white-space: pre-wrap;
				  word-break: break-word;
				  overflow-wrap: anywhere;
				}
				img {
				  width: 600px;
				  height: auto;
				  display: block;
				  margin: 10px auto;
				}
				#saveButton {
				  margin-top: 20px;
				  padding: 10px 20px;
				  background-color: #007bff;
				  color: white;
				  border: none;
				  border-radius: 5px;
				  cursor: pointer;
				}
				#saveButton:hover {
				  background-color: #0056b3;
				}
		  </style>
		</head>
		<body>
		  <pre id="renderedOutput">${text}</pre>
		  <button id="saveButton">Save Page</button>
		</body>
		</html>`;

			// Escreve e fecha o documento
			newTab.document.open();
			newTab.document.write(html);
			newTab.document.close();

			// Injeta o MathJax
			const mathJaxScript = newTab.document.createElement("script");
			mathJaxScript.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
			newTab.document.body.appendChild(mathJaxScript);

			// Injeta o script de salvar, marcado com data-save-script
			const saveScript = newTab.document.createElement("script");
			saveScript.setAttribute("data-save-script", "");
			saveScript.textContent = `
			  document.getElementById('saveButton').addEventListener('click', async function() {
				if (window.MathJax && MathJax.typesetPromise) {
				  await MathJax.typesetPromise();
				}

				// 1) clona todo o <html>
				const clone = document.documentElement.cloneNode(true);

				// 2) remove botão e este script do clone
				clone.querySelectorAll('#saveButton, script[data-save-script]')
					 .forEach(el => el.remove());

				// 3) serializa e dispara o download
				const htmlToSave = '<!DOCTYPE html>\\n' + clone.outerHTML;
				const blob = new Blob([htmlToSave], { type: 'text/html' });
				const url  = URL.createObjectURL(blob);
				const a    = document.createElement('a');
				a.href     = url;
				a.download = 'pagina.html';
				document.body.appendChild(a);
				a.click();
				a.remove();
				URL.revokeObjectURL(url);
			  });
			`;
			newTab.document.body.appendChild(saveScript);
		  }
		});