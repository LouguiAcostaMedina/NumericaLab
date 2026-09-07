import { CalculationHistoryItem } from '../domain/history';

const HISTORY_STORAGE_KEY = 'metodos_numericos_history_v1';
const MAX_HISTORY_ITEMS = 30;

/**
 * Gestor de Persistencia en localStorage para el Historial de Sesiones.
 */
export class HistoryStorage {
  /**
   * Obtiene la lista completa de ítems guardados en el historial (más recientes primero).
   */
  static getHistory(): CalculationHistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Guarda un nuevo cálculo en el historial de localStorage.
   */
  static addEntry(item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>): CalculationHistoryItem {
    const history = this.getHistory();
    const newEntry: CalculationHistoryItem = {
      ...item,
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
    };

    const updated = [newEntry, ...history].slice(0, MAX_HISTORY_ITEMS);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error guardando en localStorage:', e);
      }
    }

    return newEntry;
  }

  /**
   * Elimina una entrada específica por su ID.
   */
  static removeEntry(id: string): void {
    if (typeof window === 'undefined') return;
    const history = this.getHistory().filter((item) => item.id !== id);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Error eliminando entrada de localStorage:', e);
    }
  }

  /**
   * Limpia completamente el historial de cálculos.
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {
      console.error('Error limpiando localStorage:', e);
    }
  }
}
