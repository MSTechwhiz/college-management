import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarAlt, faPlus, faHistory, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons'
import api from '../../utils/api'

const AcademicManagement = () => {
    const [years, setYears] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        currentYear: false
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchYears()
    }, [])

    const fetchYears = async () => {
        try {
            const response = await api.get('/academic/years')
            setYears(response.data)
        } catch (err) {
            console.error(err)
            setError("Failed to load academic years")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            await api.post('/academic/years', {
                ...formData,
                status: formData.currentYear ? 'ACTIVE' : 'UPCOMING'
            })
            setShowModal(false)
            fetchYears()
            setFormData({ name: '', startDate: '', endDate: '', currentYear: false })
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create year")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600" />
            </div>
        )
    }

    return (
        <div className="p-6 h-full overflow-y-auto bg-slate-50">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Academic Management</h1>
                    <p className="text-slate-500 mt-1">Manage academic years and batches</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    New Academic Year
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 flex items-center gap-3">
                    <FontAwesomeIcon icon={faHistory} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {years.map(year => (
                    <div key={year.id} className={`bg-white rounded-xl shadow-sm border p-6 relative overflow-hidden transition-all hover:shadow-md ${year.currentYear ? 'border-blue-200 ring-4 ring-blue-50' : 'border-slate-100'}`}>
                        {year.currentYear && (
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                CURRENT
                            </div>
                        )}

                        <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${year.currentYear ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                <FontAwesomeIcon icon={faCalendarAlt} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{year.name}</h3>
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-2 ${year.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                        year.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {year.status}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-slate-50 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Start Date</span>
                                <span className="font-medium text-slate-700">{year.startDate}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">End Date</span>
                                <span className="font-medium text-slate-700">{year.endDate}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-fade-in relative">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Create Academic Year</h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Year Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 2024-2025"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition font-medium"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer" onClick={() => setFormData({ ...formData, currentYear: !formData.currentYear })}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${formData.currentYear ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                    {formData.currentYear && <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs" />}
                                </div>
                                <span className="font-medium text-slate-700">Set as Current Active Year</span>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {submitting ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Create Year'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AcademicManagement
