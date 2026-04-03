import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StackOverview from './pages/StackOverview';
import WeighBaySelection from './pages/WeighBaySelection';
import WeighingForm from './pages/WeighingForm';
import StorageBaySelection from './pages/StorageBaySelection';
import ContainerDetailsForm from './pages/ContainerDetailsForm';
import ContainerSummary from './pages/ContainerSummary';
import InspectionDashboard from './pages/InspectionDashboard';
import InspectionSummary from './pages/InspectionSummary';
import PaymentDashboard from './pages/PaymentDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/stacks" element={<ProtectedRoute><StackOverview /></ProtectedRoute>} />
          <Route path="/weigh-bays" element={<ProtectedRoute><WeighBaySelection /></ProtectedRoute>} />
          <Route path="/weighing-form" element={<ProtectedRoute><WeighingForm /></ProtectedRoute>} />
          <Route path="/storage-bays" element={<ProtectedRoute><StorageBaySelection /></ProtectedRoute>} />
          <Route path="/inspection-dashboard" element={<ProtectedRoute><InspectionDashboard /></ProtectedRoute>} />
          <Route path="/inspection-summary" element={<ProtectedRoute><InspectionSummary /></ProtectedRoute>} />
          <Route path="/container-details" element={<ProtectedRoute><ContainerDetailsForm /></ProtectedRoute>} />
          <Route path="/container-summary" element={<ProtectedRoute><ContainerSummary /></ProtectedRoute>} />
          <Route path="/shipments" element={<ProtectedRoute><PaymentDashboard /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
export default App
