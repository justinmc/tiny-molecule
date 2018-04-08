# tiny-molecule
A small, developer-friendly 3D molecule viewer for the modern web

![demo](./demo.gif)

## Getting Started

`npm install --save tiny-molecule`

```
import tinyMolecule from 'tiny-molecule';
import pdbString from 'raw-loader!./3aid.pdb';

tinyMolecule(pdbString, document.body);
```

## API
`tinyMolecule` exports a single function that takes a DOM element and a data string.  The data string can be either the contents of a PDB or MMCIF file.  It will synchronously render a canvas into the given DOM element visualizing the given molecule.

See the example folder for a full working example that uses RCSB's API to fetch molecules by PDBID.  You can run it for yourself with `npm run example` (after an `npm install`).

## License
MIT.  See LICENSE file.
