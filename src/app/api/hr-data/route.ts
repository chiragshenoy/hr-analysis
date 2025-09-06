import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export async function GET(request: NextRequest) {
  try {
    // Path to the CSV file in the src/data directory
    const csvFilePath = path.join(process.cwd(), 'src', 'data', 'hr-data.csv');
    
    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json(
        { error: 'HR data file not found' },
        { status: 404 }
      );
    }

    // Read the CSV file
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    
    // Parse CSV data
    const parsedData = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsedData.errors.length > 0) {
      console.error('CSV parsing errors:', parsedData.errors);
      return NextResponse.json(
        { error: 'Error parsing CSV data', details: parsedData.errors },
        { status: 500 }
      );
    }

    // Return the parsed data
    return NextResponse.json({
      data: parsedData.data,
      meta: {
        totalRecords: parsedData.data.length,
        fields: parsedData.meta?.fields || [],
      }
    });

  } catch (error) {
    console.error('Error reading HR data:', error);
    return NextResponse.json(
      { error: 'Internal server error while reading HR data' },
      { status: 500 }
    );
  }
}
