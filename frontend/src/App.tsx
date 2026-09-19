import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Medicines from '@/pages/Medicines'
import Inventory from '@/pages/Inventory'
import Pos from '@/pages/Pos'
import Analytics from '@/pages/Analytics'
import Transactions from '@/pages/Transactions'
import Suppliers from '@/pages/Suppliers'
import Customers from '@/pages/Customers'
import Alerts from '@/pages/Alerts'
import Login from '@/pages/Login'
import Placeholder from '@/pages/Placeholder'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/pos" element={<Pos />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
      </Route>
    </Routes>
  )
}
