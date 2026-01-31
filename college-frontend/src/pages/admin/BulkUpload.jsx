import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUploadAlt, faFileExcel, faCheckCircle, faExclamationTriangle, faSpinner, faDownload } from '@fortawesome/free-solid-svg-icons'
import api from '../../utils/api'

const BulkUpload = () => {
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState(null)
    const [errors, setErrors] = useState([])

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0])
            setResult(null)
            setErrors([])
        }
    }

    const handleUpload = async () => {
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        setUploading(true)
        setErrors([])
        setResult(null)

        try {
            const response = await api.post('/admin/bulk/students', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            setResult({ success: true, message: response.data.message })
        } catch (err) {
            console.error(err)
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors)
                setResult({ success: false, message: 'Validation Failed' })
            } else {
                setResult({ success: false, message: err.response?.data?.message || 'Upload failed' })
            }
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="p-6 h-full overflow-y-auto bg-slate-50">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Bulk Data Management</h1>
                <p className="text-slate-500 mt-1">Upload Excel files to manage large datasets safely</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">
                            <FontAwesomeIcon icon={faFileExcel} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Student Bulk Upload</h2>
                            <p className="text-sm text-slate-500">Add multiple students with validation</p>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition duration-200 cursor-pointer relative"
                        onClick={() => document.getElementById('fileInput').click()}>
                        <input
                            type="file"
                            id="fileInput"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl text-slate-400 mb-4" />

                        {file ? (
                            <div>
                                <p className="font-bold text-slate-800">{file.name}</p>
                                <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                        ) : (
                            <div>
                                <p className="font-bold text-slate-700">Click to upload Excel file</p>
                                <p className="text-xs text-slate-400 mt-2">Required: .xlsx format</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6">
                            <p className="font-bold mb-2">Expected Format (Columns):</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Register Number (Unique)</li>
                                <li>Full Name</li>
                                <li>Date of Birth (DD/MM/YYYY)</li>
                                <li>Department (e.g., IT, CSE)</li>
                                <li>Batch Name (e.g., 2024-2028)</li>
                                <li>Academic Year (e.g., 1, 2)</li>
                                <li>Email</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    Processing...
                                </>
                            ) : (
                                'Upload & Process'
                            )}
                        </button>
                    </div>
                </div>

                {/* Status / Errors */}
                <div>
                    {result && (
                        <div className={`rounded-xl border p-6 mb-6 ${result.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${result.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    <FontAwesomeIcon icon={result.success ? faCheckCircle : faExclamationTriangle} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                        {result.success ? 'Upload Successful!' : 'Upload Failed'}
                                    </h3>
                                    <p className={`text-sm mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                                        {result.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {errors.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                                <h3 className="font-bold text-red-800">Validation Errors</h3>
                                <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                                    {errors.length} Issues
                                </span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto p-0">
                                {errors.map((err, idx) => (
                                    <div key={idx} className="px-6 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 text-sm text-slate-700 flex items-start gap-3">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 mt-0.5" />
                                        {err}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BulkUpload
