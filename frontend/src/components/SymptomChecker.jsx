import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  const handleAnalyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/user/analyze-symptoms`,
        { symptoms },
        { headers: { token } }
      );

      if (data.success) {
        setAnalysis({
          specialty: data.recommendedSpecialty,
          confidence: data.confidence,
          reasoning: data.reasoning
        });
        toast.success("Analysis complete! Finding doctors...");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error analyzing symptoms");
    } finally {
      setLoading(false);
    }
  };

  const handleFindDoctors = () => {
    if (analysis?.specialty) {
      navigate(`/doctors/${analysis.specialty}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSymptoms("");
      setAnalysis(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-10 w-full max-w-3xl mx-auto border border-blue-200">
      <h2 className="text-3xl font-medium text-center mb-2 text-gray-900">
        AI Symptom Analyzer
      </h2>
      
      <p className="text-center text-gray-600 mb-6 text-sm">
        Describe your symptoms and our AI will help you find the right specialist
      </p>

      {!analysis ? (
        <div className="flex flex-col gap-4">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe your symptoms in detail... (e.g., 'I have severe acne and red spots on my face', 'My child has been coughing with high fever')"
            className="w-full border border-blue-200 rounded-lg px-4 py-3 outline-none focus:border-primary resize-none text-gray-700"
            rows="4"
          />

          <button
            onClick={handleAnalyzeSymptoms}
            disabled={loading || !symptoms.trim()}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Analyzing symptoms..." : "Analyze Symptoms"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Recommended Specialist
            </h3>

            <p className="text-2xl font-semibold text-primary mb-3">
              {analysis.specialty}
            </p>

            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Confidence</span>
                <span className="text-sm font-semibold text-primary">
                  {analysis.confidence}%
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${analysis.confidence}%` }}
                ></div>
              </div>
            </div>

            <p className="text-gray-700 text-sm">
              <span className="font-medium">Reason: </span>{analysis.reasoning}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleFindDoctors}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition font-medium"
            >
              Find {analysis.specialty}s
            </button>

            <button
              onClick={() => {
                setAnalysis(null);
                setSymptoms("");
              }}
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Try Again
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            This is an AI recommendation. Please consult with a healthcare professional for accurate diagnosis.
          </p>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
