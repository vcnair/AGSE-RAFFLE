
import { Employee } from '../types';

export function parseEmployeeCSV(csv: string): Employee[] {
  const lines = csv.split('\n');
  const result: Employee[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV with potential quoted fields (like "Last, First")
    const parts: string[] = [];
    let currentPart = '';
    let inQuotes = false;

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(currentPart.trim());
        currentPart = '';
      } else {
        currentPart += char;
      }
    }
    parts.push(currentPart.trim());

    if (parts.length >= 5) {
      const fullName = parts[2].replace(/"/g, '');
      const nameParts = fullName.split(',').map(s => s.trim());
      const firstName = nameParts[1] || '';
      const lastName = nameParts[0] || '';

      result.push({
        id: parts[0] + '-' + i,
        clientName: parts[1],
        fullName,
        firstName,
        lastName,
        jobTitle: parts[3],
        manager: parts[4]
      });
    }
  }

  return result;
}
