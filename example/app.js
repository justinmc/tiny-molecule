import tinyMolecule from '../src/index';

const INITIAL_PDB_ID = '3aid';

const FILE_EXTENSIONS = {
  PDB: 'pdb',
  MMCIF: 'cif',
};

function createSelect(...optionStrings) {
  const select = window.document.createElement('select');

  optionStrings.forEach((optionString) => {
    const option = window.document.createElement('option');
    option.value = optionString;
    option.text = optionString;
    select.append(option);
  });

  return select;
}

function fetchPdb(pdbId) {
  const type = typeSelect.value;
  window.fetch(`https://files.rcsb.org/download/${pdbId}.${FILE_EXTENSIONS[type]}`)
    .then(response => response.text())
    .then((pdbString) => {
      window.document.body.innerHtml = '';
      tinyMolecule(window.document.body, pdbString, {
        type,
        representation: representationSelect.value,
      });
    })
    .catch(console.error.bind(console));
}

// Create pdbid input
const input = window.document.createElement('input');
input.value = INITIAL_PDB_ID;
input.addEventListener('keydown', (event) => {
  if (event.which === 13) {
    fetchPdb(event.target.value.toUpperCase());
  }
});
window.document.body.append(input);

// Create type select
const typeSelect = createSelect('PDB', 'MMCIF');
window.document.body.append(typeSelect);

// Create representation select
const representationSelect = createSelect('sphere', 'particle');
window.document.body.append(representationSelect);
representationSelect.addEventListener('change', () => {
  fetchPdb(input.value.toUpperCase());
});

fetchPdb(INITIAL_PDB_ID);
