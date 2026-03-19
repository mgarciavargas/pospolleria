// src/services/storage.ts

export const storageService = {
  getPendingSync() {
    const items = localStorage.getItem('pending_sync');
    return items ? JSON.parse(items) : [];
  },

  savePedidoLocal(pedido: any) {
    const pending = this.getPendingSync();
    pending.push({
      id: pedido.id,
      tipo: 'pedido',
      datos: pedido,
      timestamp: Date.now(),
      sincronizado: false
    });
    localStorage.setItem('pending_sync', JSON.stringify(pending));
  },

  markAsSynced(id: string) {
    const pending = this.getPendingSync();
    const updated = pending.map((item: any) =>
      item.id === id ? { ...item, sincronizado: true } : item
    );
    localStorage.setItem('pending_sync', JSON.stringify(updated));
  },

  clearSynced() {
    const pending = this.getPendingSync();
    const active = pending.filter((item: any) => !item.sincronizado);
    localStorage.setItem('pending_sync', JSON.stringify(active));
  },

  cacheData(key: string, data: any, ttl: number = 3600000) {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(`cache:${key}`, JSON.stringify(item));
  },

  getCachedData(key: string) {
    const item = localStorage.getItem(`cache:${key}`);
    if (!item) return null;

    const { data, timestamp, ttl } = JSON.parse(item);
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(`cache:${key}`);
      return null;
    }

    return data;
  }
};
