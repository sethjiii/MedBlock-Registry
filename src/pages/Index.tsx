
import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { db } from '@/services/database';
import Navigation from '@/components/Navigation';
import PatientRegistrationForm from '@/components/PatientRegistrationForm';
import PatientDirectory from '@/components/PatientDirectory';
import SQLQueryInterface from '@/components/SQLQueryInterface';

const Index = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await db.init();
        console.log('Database initialized successfully');
        toast({
          title: "System Ready",
          description: "Patient registration system is now online!",
        });
      } catch (error) {
        console.error('Failed to initialize database:', error);
        toast({
          title: "System Error",
          description: "Failed to initialize database. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  const handlePatientAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('directory');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Initializing MedFlow Registry</h2>
          <p className="text-gray-500 mt-2">Setting up your patient database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === 'register' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to MedFlow Registry</h2>
              <p className="text-lg text-gray-600">Streamlined patient registration and data management</p>
            </div>
            <PatientRegistrationForm onPatientAdded={handlePatientAdded} />
          </div>
        )}
        
        {activeTab === 'directory' && (
          <PatientDirectory refreshTrigger={refreshTrigger} />
        )}
        
        {activeTab === 'sql' && (
          <SQLQueryInterface />
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>MedFlow Registry - Secure Patient Data Management</p>
            <p className="mt-1">Data is stored locally using PGlite with IndexedDB persistence</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
