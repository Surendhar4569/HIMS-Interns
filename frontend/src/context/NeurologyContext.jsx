// src/context/NeurologyContext.js
import React, { createContext, useState, useContext } from 'react';

// Create context
const NeurologyContext = createContext();

// Custom hook to use the context
export const useNeurology = () => {
    const context = useContext(NeurologyContext);
    if (!context) {
        throw new Error('useNeurology must be used within a NeurologyProvider');
    }
    return context;
};


    export const NeurologyProvider = ({ children }) => {
    const [editMode, setEditMode] = useState({
        isEditing: false,
        encounterData: null,
        encounterId: null, // Frontend uses encounterId
        patientId: null
    });

    const [currentPatient, setCurrentPatient] = useState(null);
    const [currentEncounter, setCurrentEncounter] = useState(null);

    // FIX: Renamed to setEditMode to match your Records.jsx call
    const setEditModeData = (encounterData, encounterId, patientId) => {
        setEditMode({
            isEditing: true,
            encounterData: encounterData,
            encounterId: encounterId,
            patientId: patientId
        });
    };

    const clearEditMode = () => {
        setEditMode({
            isEditing: false,
            encounterData: null,
            encounterId: null,
            patientId: null
        });
    };

    // Set current patient for new encounter
    const setSelectedPatient = (patient) => {
        setCurrentPatient(patient);
    };

    // Set current encounter
    const setSelectedEncounter = (encounter) => {
        setCurrentEncounter(encounter);
    };

    // Clear all selections
    const clearAll = () => {
        setEditMode({
            isEditing: false,
            encounterData: null,
            encounterId: null,
            patientId: null
        });
        setCurrentPatient(null);
        setCurrentEncounter(null);
    };

    // Context value
    const value = {
        editMode: editMode,
        setEditMode: setEditModeData,
        clearEditMode: clearEditMode,
        currentPatient: currentPatient,
        setSelectedPatient: setSelectedPatient,
        currentEncounter: currentEncounter,
        setSelectedEncounter: setSelectedEncounter,
        clearAll: clearAll
    };

    return (
        <NeurologyContext.Provider value={value}>
            {children}
        </NeurologyContext.Provider>
    );
};

export default NeurologyContext;