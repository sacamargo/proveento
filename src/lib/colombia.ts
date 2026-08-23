import colombiaData from "@/data/colombia.json";

type DepartmentRecord = {
  departamento: string;
  ciudades: string[];
};

const departments = (colombiaData as DepartmentRecord[])
  .map((item) => ({
    name: item.departamento,
    cities: [...item.ciudades].sort((a, b) => a.localeCompare(b, "es")),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "es"));

export function getDepartments(): string[] {
  return departments.map((item) => item.name);
}

export function getCities(department: string): string[] {
  return departments.find((item) => item.name === department)?.cities ?? [];
}

export function isValidLocation(department: string, city: string): boolean {
  return getCities(department).includes(city);
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
