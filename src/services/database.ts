
import { PGlite } from '@electric-sql/pglite';

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_conditions: string;
  medications: string;
  insurance_provider: string;
  insurance_id: string;
  created_at: string;
  updated_at: string;
}

class DatabaseService {
  private db: PGlite | null = null;
  private isInitialized = false;
  private initializationAttempts = 0;
  private maxAttempts = 3;

  async init() {
    if (this.isInitialized) return;
    
    this.initializationAttempts++;
    console.log(`Database initialization attempt ${this.initializationAttempts}/${this.maxAttempts}`);
    
    try {
      // Clear any existing database instance
      if (this.db) {
        try {
          await this.db.close();
        } catch (e) {
          console.log('Error closing existing db:', e);
        }
        this.db = null;
      }

      // Try different database names for each attempt to avoid cache issues
      const dbName = `patient-registration-db-v${this.initializationAttempts}`;
      console.log(`Initializing database with name: ${dbName}`);
      
      this.db = new PGlite(`idb://${dbName}`);
      
      // Test the connection
      await this.db.query('SELECT 1');
      console.log('Database connection test successful');
      
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error(`Database initialization attempt ${this.initializationAttempts} failed:`, error);
      
      if (this.initializationAttempts < this.maxAttempts) {
        console.log('Retrying database initialization...');
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.init();
      } else {
        console.error('All database initialization attempts failed');
        throw new Error(`Failed to initialize database after ${this.maxAttempts} attempts. Please refresh the page and try again.`);
      }
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    const createPatientsTable = `
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        emergency_contact_name VARCHAR(100) NOT NULL,
        emergency_contact_phone VARCHAR(20) NOT NULL,
        medical_conditions TEXT DEFAULT '',
        medications TEXT DEFAULT '',
        insurance_provider VARCHAR(100) NOT NULL,
        insurance_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await this.db.exec(createPatientsTable);
    console.log('Database tables created successfully');
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  async addPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO patients (
        first_name, last_name, email, phone, date_of_birth, gender, 
        address, emergency_contact_name, emergency_contact_phone, 
        medical_conditions, medications, insurance_provider, insurance_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const result = await this.db.query(query, [
      patient.first_name,
      patient.last_name,
      patient.email,
      patient.phone,
      patient.date_of_birth,
      patient.gender,
      patient.address,
      patient.emergency_contact_name,
      patient.emergency_contact_phone,
      patient.medical_conditions,
      patient.medications,
      patient.insurance_provider,
      patient.insurance_id
    ]);

    return result.rows[0] as Patient;
  }

  async getAllPatients(): Promise<Patient[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query('SELECT * FROM patients ORDER BY created_at DESC');
    return result.rows as Patient[];
  }

  async getPatientById(id: number): Promise<Patient | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query('SELECT * FROM patients WHERE id = $1', [id]);
    return result.rows[0] as Patient || null;
  }

  async searchPatients(searchTerm: string): Promise<Patient[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      SELECT * FROM patients 
      WHERE first_name ILIKE $1 
         OR last_name ILIKE $1 
         OR email ILIKE $1 
         OR phone ILIKE $1
      ORDER BY created_at DESC
    `;
    
    const result = await this.db.query(query, [`%${searchTerm}%`]);
    return result.rows as Patient[];
  }

  async executeRawQuery(query: string) {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.query(query);
      return {
        success: true,
        data: result.rows,
        rowCount: result.rows.length,
        fields: result.fields?.map(f => f.name) || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        rowCount: 0,
        fields: []
      };
    }
  }

  // Method to reset the database if needed
  async reset() {
    console.log('Resetting database...');
    this.isInitialized = false;
    this.initializationAttempts = 0;
    
    if (this.db) {
      try {
        await this.db.close();
      } catch (e) {
        console.log('Error closing db during reset:', e);
      }
      this.db = null;
    }
    
    await this.init();
  }
}

export const db = new DatabaseService();
