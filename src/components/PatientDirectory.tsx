
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { db, Patient } from '@/services/database';
import { toast } from '@/hooks/use-toast';

interface PatientDirectoryProps {
  refreshTrigger: number;
}

const PatientDirectory: React.FC<PatientDirectoryProps> = ({ refreshTrigger }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const allPatients = await db.getAllPatients();
      setPatients(allPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchPatients = async () => {
    if (!searchTerm.trim()) {
      loadPatients();
      return;
    }

    try {
      setIsLoading(true);
      const searchResults = await db.searchPatients(searchTerm);
      setPatients(searchResults);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast({
        title: "Error",
        description: "Failed to search patients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [refreshTrigger]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-700">Patient Directory</CardTitle>
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
            />
          </div>
          <Button onClick={searchPatients} className="bg-blue-600 hover:bg-blue-700">
            Search
          </Button>
          <Button onClick={loadPatients} variant="outline">
            Show All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No patients found matching your search.' : 'No patients registered yet.'}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Showing {patients.length} patient{patients.length !== 1 ? 's' : ''}
            </div>
            <div className="grid gap-4">
              {patients.map((patient) => (
                <Card key={patient.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <p className="text-gray-600">ID: #{patient.id}</p>
                        <p className="text-gray-600">{patient.email}</p>
                        <p className="text-gray-600">{patient.phone}</p>
                      </div>
                      
                      <div>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Age:</span> {calculateAge(patient.date_of_birth)} years
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">DOB:</span> {formatDate(patient.date_of_birth)}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Gender:</span> {patient.gender}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Insurance:</span> {patient.insurance_provider}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Emergency Contact:</p>
                            <p className="text-sm text-gray-600">{patient.emergency_contact_name}</p>
                            <p className="text-sm text-gray-600">{patient.emergency_contact_phone}</p>
                          </div>
                          
                          {patient.medical_conditions && (
                            <div>
                              <Badge variant="outline" className="text-xs">
                                Has Medical Conditions
                              </Badge>
                            </div>
                          )}
                          
                          {patient.medications && (
                            <div>
                              <Badge variant="outline" className="text-xs">
                                Taking Medications
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Registered: {formatDate(patient.created_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientDirectory;
