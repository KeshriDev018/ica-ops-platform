import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  FileText,
  Image,
  Video,
  Download,
  Calendar,
  Users,
  User,
  Link as LinkIcon,
  Clock,
} from "lucide-react";
import classMaterialService from "../../services/classMaterialService";

export default function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, batch, one-on-one

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await classMaterialService.getStudentMaterials();
      setMaterials(data);
    } catch (error) {
      console.error("Error loading materials:", error);
      alert("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "IMAGE":
        return <Image className="w-5 h-5 text-blue-500" />;
      case "VIDEO":
        return <Video className="w-5 h-5 text-purple-500" />;
      case "LINK":
        return <LinkIcon className="w-5 h-5 text-green-500" />;
      case "PDF":
      case "DOC":
        return <FileText className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredMaterials = materials.filter((material) => {
    if (filter === "all") return true;
    if (filter === "batch") return material.classType === "Batch";
    if (filter === "one-on-one") return material.classType === "1-on-1";
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl">Loading materials...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Class Materials</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 font-medium ${
              filter === "all"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All ({materials.length})
          </button>
          <button
            onClick={() => setFilter("batch")}
            className={`px-4 py-2 font-medium ${
              filter === "batch"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Batch Classes (
            {materials.filter((m) => m.classType === "Batch").length})
          </button>
          <button
            onClick={() => setFilter("one-on-one")}
            className={`px-4 py-2 font-medium ${
              filter === "one-on-one"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            1-on-1 Classes (
            {materials.filter((m) => m.classType === "1-on-1").length})
          </button>
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No materials available</p>
          <p className="text-sm text-gray-400 mt-2">
            Your coach will upload study materials here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div
              key={material._id}
              className="bg-white rounded-lg shadow-md p-4 border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                {getFileIcon(material.fileType)}
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {material.fileType}
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-2">{material.title}</h3>

              {material.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {material.description}
                </p>
              )}

              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{material.className}</span>
                </div>

                {material.classType === "Batch" && material.batchName && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{material.batchName}</span>
                  </div>
                )}

                {material.classType === "1-on-1" && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>1-on-1 Session</span>
                  </div>
                )}

                {material.schedule && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">{material.schedule}</span>
                  </div>
                )}

                <div className="text-xs text-gray-400">
                  Coach: {material.coachEmail}
                </div>

                <div className="text-xs text-gray-400">
                  Uploaded:{" "}
                  {format(new Date(material.uploadedAt), "MMM dd, yyyy")}
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>

                {material.meetLink && (
                  <a
                    href={material.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full text-sm"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Join Class
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
