 window.MathJax = {
    tex: {
      inlineMath: [['$', '$']],
      displayMath: [['$$', '$$']],
	  packages: {'[+]': ['mhchem']}
    },
    options: {
      renderActions: {
        findScript: [10, function (doc) {
          doc.findMath();
        }, '']
      }
    },
	loader: {load: ['[tex]/mhchem']}
  };