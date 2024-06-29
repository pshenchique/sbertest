
import React, { useState } from 'react';
import { groth16 } from 'snarkjs';
import Web3 from 'web3';

import circuitWasm from './circuit/mult.wasm';
import circuitZkey from './circuit/mult_0001.zkey';
import verifier from './circuit/Verifier.json';

const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
const networkId = await web3.eth.net.getId();
const verifierAddress = verifier.networks[networkId];

function Verifier() {
    const [inputs, setInputs] = useState({ a: '', b: '' });
    const [proof, setProof] = useState(null);
    const [publicSignals, setPublicSignals] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);
  
    const handleChange = (event) => {
      const { name, value } = event.target;
      setInputs({ ...inputs, [name]: value });
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      const input = { a: Number(inputs.a), b: Number(inputs.b) };
      const { proof, publicSignals } = await groth16.fullProve(input, circuitWasm, circuitZkey);
      setProof(proof);
      setPublicSignals(publicSignals);
      console.log('Proof: ', proof);
      console.log('Public Signals: ', publicSignals);
    };
  
    const verifyProof = async () => {
      const verifierContract = new web3.eth.Contract(verifier.abi, verifierAddress.address);
      const result = await verifierContract.methods.verifyProof(
        proof.pi_a,
        proof.pi_b,
        // proof.pi_c,
        publicSignals
      ).call();
      setVerificationResult(result);
      console.log('Verification Result: ', result);
    };
  
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              a:
              <input type="number" name="a" value={inputs.a} onChange={handleChange} required />
            </label>
          </div>
          <div>
            <label>
              b:
              <input type="number" name="b" value={inputs.b} onChange={handleChange} required />
            </label>
          </div>
          <button type="submit">Generate Proof</button>
        </form>
        {proof && (
          <div>
            <button onClick={verifyProof}>Verify Proof</button>
          </div>
        )}
        {verificationResult !== null && (
          <div>
            Verification Result: {verificationResult ? 'Success' : 'Failure'}
          </div>
        )}
      </div>
    );
  }
  
  export default Verifier;