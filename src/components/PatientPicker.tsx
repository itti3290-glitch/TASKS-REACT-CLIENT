import { useState, type KeyboardEvent } from 'react';
import type { Patient } from '../types';

type PatientPickerProps = {
  patients: Patient[];
  onSelect: (id: string) => void;
  initialId?: string; // when editing, the patient that is already chosen
};

function patientLabel(patient: Patient) {
  return `${patient.full_name} · ${patient.patient_code}`;
}

function PatientPicker(props: PatientPickerProps) {
  const [text, setText] = useState(() => {
    const chosen = props.patients.find((patient) => String(patient.id) === props.initialId);
    return chosen ? patientLabel(chosen) : '';
  });
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const search = text.trim().toLowerCase();
  const matches = props.patients.filter((patient) =>
    patientLabel(patient).toLowerCase().includes(search)
  );

  function handleType(value: string) {
    setText(value);
    setIsOpen(true);
    setHighlighted(0);
    props.onSelect('');
  }

  function choose(patient: Patient) {
    setText(patientLabel(patient));
    setIsOpen(false);
    props.onSelect(String(patient.id));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setHighlighted(Math.min(highlighted + 1, matches.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted(Math.max(highlighted - 1, 0));
    } else if (event.key === 'Enter' && isOpen) {
      event.preventDefault();
      if (matches[highlighted]) choose(matches[highlighted]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div className="combo">
      <input
        value={text}
        onChange={(event) => handleType(event.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
        placeholder="הקלידו שם או קוד מטופל"
      />
      <span className="combo-arrow">▾</span>

      {isOpen && (
        <ul className="combo-list">
          {matches.map((patient, index) => (
            <li
              key={patient.id}
              className={index === highlighted ? 'highlighted' : ''}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(patient);
              }}
              onMouseEnter={() => setHighlighted(index)}
            >
              {patientLabel(patient)}
            </li>
          ))}
          {matches.length === 0 && <li className="combo-empty">לא נמצא מטופל</li>}
        </ul>
      )}
    </div>
  );
}

export default PatientPicker;
