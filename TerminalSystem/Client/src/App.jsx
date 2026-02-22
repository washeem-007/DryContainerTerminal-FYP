import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import WeighBaySelection from './pages/WeighBaySelection';
import WeighingForm from './pages/WeighingForm';
import StorageBaySelection from './pages/StorageBaySelection';
import ContainerDetailsForm from './pages/ContainerDetailsForm';
import ContainerSummary from './pages/ContainerSummary';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/weigh-bays" element={<WeighBaySelection />} />
        <Route path="/weighing-form" element={<WeighingForm />} />
        <Route path="/storage-bays" element={<StorageBaySelection />} />
        <Route path="/container-details" element={<ContainerDetailsForm />} />
        <Route path="/container-summary" element={<ContainerSummary />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
