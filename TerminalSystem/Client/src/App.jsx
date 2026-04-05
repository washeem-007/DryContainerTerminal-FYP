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
import DatabaseManager from './pages/DatabaseManager';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Gate Clerk', 'Yard Supervisor', 'Admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/stacks" element={<ProtectedRoute allowedRoles={['Gate Clerk', 'Yard Supervisor', 'Admin']}><StackOverview /></ProtectedRoute>} />
          <Route path="/weigh-bays" element={<ProtectedRoute allowedRoles={['Gate Clerk', 'Admin']}><WeighBaySelection /></ProtectedRoute>} />
          <Route path="/weighing-form" element={<ProtectedRoute allowedRoles={['Gate Clerk', 'Admin']}><WeighingForm /></ProtectedRoute>} />
          <Route path="/storage-bays" element={<ProtectedRoute allowedRoles={['Gate Clerk', 'Admin']}><StorageBaySelection /></ProtectedRoute>} />
          <Route path="/inspection-dashboard" element={<ProtectedRoute allowedRoles={['Yard Supervisor', 'Admin']}><InspectionDashboard /></ProtectedRoute>} />
          <Route path="/inspection-summary" element={<ProtectedRoute allowedRoles={['Yard Supervisor', 'Admin']}><InspectionSummary /></ProtectedRoute>} />
          <Route path="/container-details" element={<ProtectedRoute allowedRoles={['Gate Clerk', 'Admin']}><ContainerDetailsForm /></ProtectedRoute>} />
          <Route path="/container-summary" element={<ProtectedRoute allowedRoles={['Gate Clerk', 'Admin']}><ContainerSummary /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute allowedRoles={['Wharf Clerk', 'Admin']}><PaymentDashboard /></ProtectedRoute>} />
          <Route path="/database" element={<ProtectedRoute allowedRoles={['Admin']}><DatabaseManager /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
export default App
