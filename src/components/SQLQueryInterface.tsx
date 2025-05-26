
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { db } from '@/services/database';
import { toast } from '@/hooks/use-toast';

const SQLQueryInterface: React.FC = () => {
  const [query, setQuery] = useState('SELECT * FROM patients LIMIT 10;');
  const [results, setResults] = useState<any>({
    success: false,
    data: [],
    rowCount: 0,
    fields: [],
    error: ''
  });
  const [isExecuting, setIsExecuting] = useState(false);

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a SQL query",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    try {
      const result = await db.executeRawQuery(query);
      setResults(result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Query executed successfully. ${result.rowCount} rows returned.`,
        });
      } else {
        toast({
          title: "Query Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      toast({
        title: "Error",
        description: "Failed to execute query",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const sampleQueries = [
    {
      name: "All Patients",
      query: "SELECT * FROM patients ORDER BY created_at DESC;"
    },
    {
      name: "Patient Count by Gender",
      query: "SELECT gender, COUNT(*) as count FROM patients GROUP BY gender;"
    },
    {
      name: "Recent Registrations",
      query: "SELECT first_name, last_name, email, created_at FROM patients WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' ORDER BY created_at DESC;"
    },
    {
      name: "Patients with Medical Conditions",
      query: "SELECT first_name, last_name, medical_conditions FROM patients WHERE medical_conditions != '' AND medical_conditions IS NOT NULL;"
    },
    {
      name: "Insurance Providers",
      query: "SELECT insurance_provider, COUNT(*) as patient_count FROM patients GROUP BY insurance_provider ORDER BY patient_count DESC;"
    }
  ];

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-700">SQL Query Interface</CardTitle>
        <p className="text-gray-600">Execute raw SQL queries against the patient database</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sample Queries */}
        <div>
          <h3 className="font-semibold mb-3">Sample Queries:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {sampleQueries.map((sample, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(sample.query)}
                className="text-left justify-start h-auto p-3"
              >
                <div>
                  <div className="font-medium">{sample.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {sample.query.substring(0, 50)}...
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Query Input */}
        <div>
          <label className="block text-sm font-medium mb-2">SQL Query:</label>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your SQL query here..."
            rows={6}
            className="font-mono text-sm"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Tip: Use standard PostgreSQL syntax. Available table: patients
            </p>
            <Button 
              onClick={executeQuery} 
              disabled={isExecuting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isExecuting ? 'Executing...' : 'Execute Query'}
            </Button>
          </div>
        </div>

        {/* Results */}
        {(results.success || results.error) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold">Query Results:</h3>
              <Badge variant={results.success ? "default" : "destructive"}>
                {results.success ? `${results.rowCount} rows` : 'Error'}
              </Badge>
            </div>

            {results.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-800 font-medium">Error:</p>
                <p className="text-red-700 text-sm mt-1">{results.error}</p>
              </div>
            )}

            {results.success && results.data.length > 0 && (
              <div className="border rounded-md overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {results.fields.map((field: string, index: number) => (
                        <TableHead key={index} className="whitespace-nowrap">
                          {field}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.data.map((row: any, rowIndex: number) => (
                      <TableRow key={rowIndex}>
                        {results.fields.map((field: string, colIndex: number) => (
                          <TableCell key={colIndex} className="whitespace-nowrap">
                            {row[field] !== null && row[field] !== undefined 
                              ? String(row[field]) 
                              : 'NULL'
                            }
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {results.success && results.data.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Query executed successfully but returned no results.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SQLQueryInterface;
