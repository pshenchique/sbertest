import React, { useState } from 'react';
import Web3 from 'web3';
import { groth16 } from 'snarkjs';
import Verifier from './circuit/Verifier.json';
import wasm from './circuit/circuit.wasm';
import zkey from './circuit/circuit_0001.zkey';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

const AGE_THRESHOLD = 441796964; // Public input value
const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");

const App = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  return (
    <div>
      <AgeCheckComponent setResult={setResult} setError={setError} />
      
      {result !== null && (
        <div>
          <h2>Результат:</h2>
          <p>{result ? 'Подтверждение принято!' : 'Подтверждение не принято.'}</p>
        </div>
      )}
      {error && <p></p>}
    </div>
  );
};

const AgeCheckComponent = ({ setResult, setError }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSubmit = async () => {
    if (selectedDate) {
      const birthdate = Math.floor(new Date(selectedDate).getTime() / 1000);
      const timestamp = Math.floor(Date.now() / 1000);
      await sendAgeCheckData(birthdate, timestamp, AGE_THRESHOLD);
    } else {
      alert('Пожалуйста, выберите дату');
    }
  };

  const sendAgeCheckData = async (birthdate, timestamp, ageThreshold) => {
    const input = { birthdate, timestamp, ageThreshold };

    try {
      // Generate witness and proof
      const { proof, publicSignals } = await generateProof(input);

      // Interact with the smart contract
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Verifier.networks[networkId];

      const verifier = new web3.eth.Contract(
        Verifier.abi,
        deployedNetwork && deployedNetwork.address
      );

      const proofData = {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [[proof.pi_b[0][0], proof.pi_b[0][1]], [proof.pi_b[1][0], proof.pi_b[1][1]]],
        c: [proof.pi_c[0], proof.pi_c[1]],
        input: publicSignals.map(x => x.toString()) // Ensure public signals are strings
        
      };
      console.log(publicSignals)

      const isValid = await verifier.methods
        .verifyProof(proofData.a, proofData.b, proofData.c, proofData.input)
        .send({ from: accounts[0] });

      setResult(isValid);
      setError('');
    } catch (error) {
      console.error('Error verifying proof:', error);
      setResult(false);
      setError('Error verifying proof: ' + error.message);
    }
  };

  const generateProof = async (input) => {
    console.log(input)
    try {
      // Generate proof using snarkjs.groth16
      const { proof, publicSignals } = await groth16.fullProve(
        input,
        wasm,
        zkey
      );
      return { proof, publicSignals };
    } catch (error) {
      console.error('Error generating proof:', error);
      throw error;
    }
  };

  return (
    <div>
      <h1>Аренда электросамоката</h1>
      <p>Для того, чтобы арендовать электросамокат, вам нужно ввести дату вашего рождения</p>

      <div><
        DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="dd.MM.yyyy"
        placeholderText="Введите дату рождения"
      />
      <button onClick={handleSubmit}>Отправить</button>
      </div>
      
    </div>
  );
};

export default App;