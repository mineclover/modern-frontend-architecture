import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/global'
import { Layout } from '@/shared'
import { UserList } from '@/domain/user'

export function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<div>Dashboard</div>} />
            <Route path="/users" element={<UserList />} />
            <Route path="/products" element={<div>Products</div>} />
            <Route path="/orders" element={<div>Orders</div>} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  )
}