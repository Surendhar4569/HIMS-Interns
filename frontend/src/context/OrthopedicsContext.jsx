// src/context/OrthopedicsContext.js
import React, { createContext, useState, useContext } from 'react';

const OrthopedicsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useOrthopedics = () => {
    const context = useContext(OrthopedicsContext);
    if (!context) {
        throw new Error('useOrthopedics must be used within OrthopedicsProvider');
    }
    return context;
};

export const OrthopedicsProvider = ({ children }) => {
    const [editData, setEditData] = useState(null);
    const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
    const [encounterId, setEncounterId] = useState(null);
    const [patientId, setPatientId] = useState(null);

    // Function to set data for editing
    const setEditMode = (data, encId, patId) => {
        setEditData(data);
        setEncounterId(encId);
        setPatientId(patId);
        setFormMode('edit');
    };

    // Function to clear edit data (for create mode)
    const clearEditMode = () => {
        setEditData(null);
        setEncounterId(null);
        setPatientId(null);
        setFormMode('create');
    };

    const value = {
        editData,
        formMode,
        encounterId,
        patientId,
        setEditMode,
        clearEditMode
    };

    return (
        <OrthopedicsContext.Provider value={value}>
            {children}
        </OrthopedicsContext.Provider>
    );
};