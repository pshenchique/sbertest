import React, { useState } from 'react';

function MultiplierForm({ onSubmit }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ a: Number(a), b: Number(b) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          a:
          <input type="number" value={a} onChange={(e) => setA(e.target.value)} required />
        </label>
      </div>
      <div>
        <label>
          b:
          <input type="number" value={b} onChange={(e) => setB(e.target.value)} required />
        </label>
      </div>
      <button type="submit">Generate Proof</button>
    </form>
  );
}

export default MultiplierForm;