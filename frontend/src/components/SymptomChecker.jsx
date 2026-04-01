import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { symptomMap } from "../data/symptomMap";

const SymptomChecker = () => {
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const navigate = useNavigate();

  const handleFindDoctor = () => {
    if (!selectedSymptom) return;
    const specialty = symptomMap[selectedSymptom];
    navigate(`/doctors/${specialty}`);
    window.scrollTo({ top: 0, behavior: 'smooth' })
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-10 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Not sure which doctor to choose?
      </h2>

      <p className="text-center text-gray-500 mb-5">
        Select your symptom and we’ll suggest the right specialist.
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={selectedSymptom}
          onChange={(e) => setSelectedSymptom(e.target.value)}
          className="flex-1 border rounded-xl px-4 py-3 outline-none"
        >
          <option value="">Select Symptom</option>
          {Object.keys(symptomMap).map((symptom) => (
            <option key={symptom} value={symptom}>
              {symptom}
            </option>
          ))}
        </select>

        <button
          onClick={handleFindDoctor}
          className="bg-primary text-white px-6 py-3 rounded-xl hover:opacity-90 transition"
        >
          Find Doctor
        </button>
      </div>

      {selectedSymptom && (
        <div className="mt-5 text-center text-gray-700">
          Recommended Specialty:
          <span className="font-semibold text-primary ml-2">
            {symptomMap[selectedSymptom]}
          </span>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
