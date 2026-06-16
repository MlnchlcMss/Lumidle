import React from 'react';
import { patchNotes } from '../data/patchNotes';
import './PatchNotesModal.css';

const PatchNotesModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Patch Notes</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {patchNotes.map((entry, idx) => (
            <div key={idx} className="patch-entry">
              <h3>{entry.version} – {entry.date}</h3>
              <ul>
                {entry.changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatchNotesModal;