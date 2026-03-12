import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../../../utils/api';

const MediaLibrary = () => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [filterType, setFilterType] = useState('all'); // 'all', 'image', 'video', 'document'
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchMedia();
  }, [filterType]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== 'all') params.file_type = filterType;
      
      const response = await api.get('/media', { params });
      setMediaFiles(response.data);
    } catch (err) {
      console.error('Failed to fetch media:', err);
      alert('Failed to load media files');
    }
    setLoading(false);
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        setUploadProgress(0);
        const response = await api.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setUploadProgress(percent);
          }
        });
        
        alert(`${file.name} uploaded successfully!`);
        fetchMedia();
      } catch (err) {
        console.error('Upload error:', err);
        alert(`Failed to upload ${file.name}`);
      }
    }
    setUploadProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov'],
      'application/pdf': ['.pdf']
    }
  });

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Delete this media file?')) return;
    
    try {
      await api.delete(`/media/${mediaId}`);
      alert('Media deleted successfully');
      setSelectedMedia(null);
      fetchMedia();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete media');
    }
  };

  const updateMediaDetails = async (mediaId, field, value) => {
    try {
      await api.put(`/media/${mediaId}`, { [field]: value });
      alert('Media updated successfully');
      fetchMedia();
    } catch (err) {
      alert('Failed to update media');
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
          <button
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {view === 'grid' ? '📋 List View' : '🎞️ Grid View'}
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="mb-4 flex gap-2">
          {['all', 'image', 'video', 'document'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type === 'all' ? 'All Files' : `${type.charAt(0).toUpperCase() + type.slice(1)}s`}
            </button>
          ))}
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-all ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-4xl mb-2">📁</div>
          <p className="text-gray-700 font-medium">
            {isDragActive
              ? 'Drop files here...'
              : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supports: Images (JPG, PNG, GIF, WebP), Videos (MP4, MOV), Documents (PDF)
          </p>
          {uploadProgress > 0 && (
            <div className="mt-4 max-w-md mx-auto">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-700 mt-2 font-medium">{uploadProgress}% uploaded</p>
            </div>
          )}
        </div>

        {/* Media Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading media files...</div>
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">🖼️</div>
            <p className="text-gray-600 text-lg mb-2">No media files yet</p>
            <p className="text-gray-500 text-sm">Upload your first file to get started!</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaFiles.map(media => (
              <div
                key={media._id}
                onClick={() => setSelectedMedia(media)}
                className="cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-500 transition-all"
              >
                {media.file_type === 'image' ? (
                  <img
                    src={media.url}
                    alt={media.alt_text || media.original_filename}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    <span className="text-5xl">
                      {media.file_type === 'video' ? '🎥' : '📄'}
                    </span>
                  </div>
                )}
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-700 truncate font-medium">{media.original_filename}</p>
                  <p className="text-xs text-gray-500">{(media.file_size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">File</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Uploaded</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mediaFiles.map(media => (
                  <tr key={media._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {media.file_type === 'image' && (
                          <img src={media.url} alt="" className="w-10 h-10 object-cover rounded" />
                        )}
                        <span className="text-sm text-gray-900 font-medium">{media.original_filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{media.file_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{(media.file_size / 1024).toFixed(1)} KB</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(media.uploaded_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedMedia(media)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(media._id);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Sidebar */}
      {selectedMedia && (
        <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Media Details</h3>
            <button 
              onClick={() => setSelectedMedia(null)} 
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {selectedMedia.file_type === 'image' && (
            <img 
              src={selectedMedia.url} 
              alt={selectedMedia.alt_text} 
              className="w-full rounded-lg mb-4 border border-gray-200" 
            />
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filename</label>
              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedMedia.original_filename}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedMedia.url}
                  readOnly
                  className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 bg-gray-50"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedMedia.url);
                    alert('URL copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
              <input
                type="text"
                defaultValue={selectedMedia.alt_text}
                onBlur={(e) => updateMediaDetails(selectedMedia._id, 'alt_text', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe this image for accessibility..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <textarea
                defaultValue={selectedMedia.caption}
                onBlur={(e) => updateMediaDetails(selectedMedia._id, 'caption', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Add a caption or description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Information</label>
              <div className="bg-gray-50 rounded p-3 space-y-1">
                <p className="text-sm text-gray-700"><span className="font-medium">Type:</span> {selectedMedia.file_type}</p>
                <p className="text-sm text-gray-700"><span className="font-medium">Size:</span> {(selectedMedia.file_size / 1024).toFixed(1)} KB</p>
                {selectedMedia.width && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Dimensions:</span> {selectedMedia.width} × {selectedMedia.height}px
                  </p>
                )}
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Uploaded:</span> {new Date(selectedMedia.uploaded_at).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedMedia.used_in && selectedMedia.used_in.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Used In</label>
                <p className="text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded border border-yellow-200">
                  This file is used in {selectedMedia.used_in.length} page(s)/post(s)
                </p>
              </div>
            )}

            <button
              onClick={() => handleDelete(selectedMedia._id)}
              className="w-full px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Media File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
