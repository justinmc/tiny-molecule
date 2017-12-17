import tinyMolecule from '../src/index';

const INITIAL_PDB_ID = '3aid';

function fetchPdb(pdbId) {
  window.fetch(`https://files.rcsb.org/download/${pdbId}.pdb`)
    .then(response => response.text())
    .then((pdbString) => {
      window.document.body.innerHtml = '';
      tinyMolecule(window.document.body, pdbString);
    })
    .catch(console.error.bind(console));
}

// Create pdbid input
const input = window.document.createElement('input');
input.value = '3aid';
input.addEventListener('keydown', (event) => {
  if (event.which === 13) {
    fetchPdb(event.target.value.toUpperCase());
  }
});
window.document.body.append(input);

fetchPdb(INITIAL_PDB_ID);
