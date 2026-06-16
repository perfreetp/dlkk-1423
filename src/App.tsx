import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import OrderHall from "@/pages/OrderHall"
import DeviceVerify from "@/pages/DeviceVerify"
import OperationTasks from "@/pages/OperationTasks"
import RemoteCollab from "@/pages/RemoteCollab"
import RiskConfirm from "@/pages/RiskConfirm"
import CaseArchive from "@/pages/CaseArchive"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<OrderHall />} />
          <Route path="/verify" element={<DeviceVerify />} />
          <Route path="/verify/:orderId" element={<DeviceVerify />} />
          <Route path="/tasks" element={<OperationTasks />} />
          <Route path="/tasks/:orderId" element={<OperationTasks />} />
          <Route path="/collab" element={<RemoteCollab />} />
          <Route path="/collab/:orderId" element={<RemoteCollab />} />
          <Route path="/risk" element={<RiskConfirm />} />
          <Route path="/risk/:orderId" element={<RiskConfirm />} />
          <Route path="/archive" element={<CaseArchive />} />
          <Route path="/archive/:orderId" element={<CaseArchive />} />
        </Route>
      </Routes>
    </Router>
  )
}
