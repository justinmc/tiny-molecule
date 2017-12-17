import tinyMolecule from '../src/index';
import pdbString from 'raw-loader!./3aid.pdb';

tinyMolecule(document.body, pdbString);
