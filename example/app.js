import tinyMolecule from '../src/index';

const INITIAL_PDB_ID = '3aid';

const FILE_EXTENSIONS = {
  PDB: 'pdb',
  MMCIF: 'cif',
};

// Create type select
const option0 = window.document.createElement('option');
option0.value = 'PDB';
option0.text = 'PDB';
const option1 = window.document.createElement('option');
option1.value = 'MMCIF';
option1.text = 'MMCIF';
const select = window.document.createElement('select');
select.append(option0);
select.append(option1);

// Create pdbid input
const input = window.document.createElement('input');
input.value = INITIAL_PDB_ID;
input.addEventListener('keydown', (event) => {
  if (event.which === 13) {
    fetchPdb(event.target.value.toUpperCase());
  }
});

window.document.body.append(input);
window.document.body.append(select);

function fetchPdb(pdbId) {
  const type = select.value;
  window.fetch(`https://files.rcsb.org/download/${pdbId}.${FILE_EXTENSIONS[type]}`)
    .then(response => response.text())
    .then((pdbString) => {
      window.document.body.innerHtml = '';
      tinyMolecule(window.document.body, pdbString, { type });
    })
    .catch(console.error.bind(console));
}

fetchPdb(INITIAL_PDB_ID);
