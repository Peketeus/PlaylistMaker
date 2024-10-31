import React from 'react';

import { Routes, Route } from "react-router-dom"
import App from './App';
import TestPage from './components/SearchResults';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<App />} />
            <Route path='/test' element={<TestPage />} />
        </Routes>
    )
}

export default AppRoutes;