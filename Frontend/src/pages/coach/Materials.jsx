import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  FileText,
  Image,
  Video,
  FileUp,
  Download,
  Calendar,
  Users,
  User,
  Upload,
  Clock,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
} from "lucide-react";
import classMaterialService from "../../services/classMaterialService";
import classService from "../../services/classService";

export default function CoachMaterials() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClassForUpload, setSelectedClassForUpload] = useState(null);
  const [expandedClasses, setExpandedClasses] = useState(new Set());
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    fileType: "PDF",
    file: null,
    linkUrl: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const classesData = await classService.getMyClasses();

      // Load materials for each class
      const classesWithMaterials = await Promise.all(
        classesData.map(async (cls) => {
          try {
            const allMaterials = await classMaterialService.getCoachMaterials();
            const classMaterials = allMaterials.filter(
              (m) => m.classId === cls._id,
            );
            return { ...cls, materials: classMaterials };
          } catch (error) {
            console.error("Error loading materials for class:", cls._id, error);
            return { ...cls, materials: [] };
          }
        }),
      );

      setClasses(classesWithMaterials);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUploadModal = (classItem) => {
    setSelectedClassForUpload(classItem);
    setShowUploadModal(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedClassForUpload) {
      alert("No class selected");
      return;
    }

    // Validate based on file type
    if (uploadForm.fileType === "LINK") {
      if (!uploadForm.linkUrl) {
        alert("Please enter a link URL");
        return;
      }
      // Validate URL format
      try {
        new URL(uploadForm.linkUrl);
      } catch (err) {
        alert("Please enter a valid URL (e.g., https://example.com)");
        return;
      }
    } else {
      if (!uploadForm.file) {
        alert("Please select a file");
        return;
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (uploadForm.file.size > maxSize) {
        alert(`File size exceeds 50MB limit. Your file is ${(uploadForm.file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }

      // Validate file type
      const allowedExtensions = /\.(pdf|jpe?g|png|docx?|pptx?|mp4)$/i;
      if (!allowedExtensions.test(uploadForm.file.name)) {
        alert("Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX, PPT, PPTX, MP4");
        return;
      }

      // Validate MIME type
      const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'video/mp4',
      ];
      if (!allowedMimeTypes.includes(uploadForm.file.type)) {
        alert(`Invalid file format: ${uploadForm.file.type}. Please upload PDF, JPG, PNG, DOC, DOCX, PPT, PPTX, or MP4 files.`);
        return;
      }
    }

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("description", uploadForm.description);
      formData.append("fileType", uploadForm.fileType);

      if (uploadForm.fileType === "LINK") {
        formData.append("linkUrl", uploadForm.linkUrl);
      } else {
        formData.append("file", uploadForm.file);
      }

      await classMaterialService.uploadMaterial(
        selectedClassForUpload._id,
        formData,
      );
      alert("Material uploaded successfully!");
      setShowUploadModal(false);
      setUploadForm({
        title: "",
        description: "",
        fileType: "PDF",
        file: null,
        linkUrl: "",
      });
      setSelectedClassForUpload(null);
      loadData();
    } catch (error) {
      console.error("Error uploading material:", error);
      
      // Display specific error message from backend
      let errorMsg = "Failed to upload material";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      alert(errorMsg);
    } finally {
      setUploadLoading(false);
    }
  };

  const toggleClassExpand = (classId) => {
    setExpandedClasses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "IMAGE":
        return <Image className="w-4 h-4 text-blue-500" />;
      case "VIDEO":
        return <Video className="w-4 h-4 text-purple-500" />;
      case "LINK":
        return <LinkIcon className="w-4 h-4 text-green-500" />;
      case "PDF":
      case "DOC":
        return <FileText className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Class Materials</h1>
        <p className="text-gray-600 mt-2">
          Upload and manage materials for your classes
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No classes found</p>
          <p className="text-sm text-gray-400 mt-2">
            Create a class first to upload materials
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((classItem) => {
            const isExpanded = expandedClasses.has(classItem._id);
            const materialsCount = classItem.materials?.length || 0;

            return (
              <div
                key={classItem._id}
                className="bg-white rounded-lg shadow-md border"
              >
                {/* Class Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {classItem.title}
                      </h3>
                      {classItem.batch ? (
                        <span className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          <Users className="w-4 h-4" />
                          Batch: {classItem.batch.name}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                          <User className="w-4 h-4" />
                          1-on-1: {classItem.student?.studentName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {classItem.weekdays?.join(", ")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {classItem.startTime} - {classItem.endTime}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {materialsCount} material
                        {materialsCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenUploadModal(classItem)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Material
                    </button>

                    <button
                      onClick={() => toggleClassExpand(classItem._id)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Materials List (Expanded) */}
                {isExpanded && (
                  <div className="border-t p-4 bg-gray-50">
                    {materialsCount === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No materials uploaded yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classItem.materials.map((material) => (
                          <div
                            key={material._id}
                            className="bg-white rounded-lg p-4 border shadow-sm"
                          >
                            <div className="flex items-start justify-between mb-3">
                              {getFileIcon(material.fileType)}
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {material.fileType}
                              </span>
                            </div>

                            <h4 className="font-semibold mb-2">
                              {material.title}
                            </h4>

                            {material.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {material.description}
                              </p>
                            )}

                            <div className="text-xs text-gray-400 mb-3">
                              Uploaded:{" "}
                              {format(
                                new Date(material.uploadedAt),
                                "MMM dd, yyyy",
                              )}
                            </div>

                            <a
                              href={material.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 w-full text-sm"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedClassForUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-2">Upload Material</h2>
            <p className="text-sm text-gray-600 mb-4">
              Class:{" "}
              <span className="font-semibold">
                {selectedClassForUpload.title}
              </span>
            </p>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, title: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Week 1 Notes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                  placeholder="Brief description of the material..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  File Type *
                </label>
                <select
                  value={uploadForm.fileType}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      fileType: e.target.value,
                      file: null,
                      linkUrl: "",
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="PDF">PDF</option>
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                  <option value="DOC">Document</option>
                  <option value="LINK">Link/URL</option>
                </select>
              </div>

              {uploadForm.fileType === "LINK" ? (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Link URL *
                  </label>
                  <input
                    type="url"
                    value={uploadForm.linkUrl}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, linkUrl: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                    placeholder="https://example.com/resource"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a web link to external resources (e.g., Google Docs,
                    YouTube, etc.)
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    File *
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, file: e.target.files[0] })
                    }
                    className="w-full border rounded px-3 py-2"
                    accept={
                      uploadForm.fileType === "PDF"
                        ? ".pdf"
                        : uploadForm.fileType === "IMAGE"
                          ? "image/*"
                          : uploadForm.fileType === "VIDEO"
                            ? "video/*"
                            : ".doc,.docx,.txt"
                    }
                    required
                  />
                  {uploadForm.file && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {uploadForm.file.name}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadLoading ? "Uploading..." : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedClassForUpload(null);
                    setUploadForm({
                      title: "",
                      description: "",
                      fileType: "PDF",
                      file: null,
                      linkUrl: "",
                    });
                  }}
                  disabled={uploadLoading}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
