import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const MyReports = () => {
  const { backendUrl, token, userData, loadUserProfileData } =
    useContext(AppContext);

  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("prescription");
  const [reportFile, setReportFile] = useState(null);

  const uploadReport = async () => {
    try {
      if (!reportFile) {
        return toast.error("Please select a file");
      }

      const formData = new FormData();
      formData.append("report", reportFile);
      formData.append("title", reportTitle);
      formData.append("type", reportType);

      const { data } = await axios.post(
        backendUrl + "/api/user/upload-report",
        formData,
        {
          headers: { token },
        }
      );

      if (data.success) {
        toast.success(data.message);

        setReportTitle("");
        setReportType("prescription");
        setReportFile(null);

        await loadUserProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">
        My Medical Reports
      </h1>

      <div className="border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-700 mb-4">
          Upload New Report
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Report title"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary"
          />

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary"
          >
            <option value="prescription">Prescription</option>
            <option value="blood report">Blood Report</option>
            <option value="xray">X-Ray</option>
            <option value="scan">Scan</option>
          </select>

          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setReportFile(e.target.files[0])}
            className="border border-gray-300 rounded-xl px-4 py-3"
          />
        </div>

        <button
          onClick={uploadReport}
          className="mt-5 bg-primary text-white px-6 py-3 rounded-full hover:opacity-90 transition-all"
        >
          Upload Report
        </button>
      </div>

      <div>
        <h2 className="text-xl font-medium text-gray-700 mb-4">
          Uploaded Reports
        </h2>

        {userData?.reports?.length > 0 ? (
          <div className="flex flex-col gap-3">
            {userData.reports.map((report, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-2xl px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {report.title || "Untitled Report"}
                  </p>

                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>
                      {new Date(report.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-medium hover:underline"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-2xl py-12 text-center text-gray-500">
            No reports uploaded yet
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;