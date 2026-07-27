import { Injectable, signal, computed } from '@angular/core';

@Injectable()
export class ListDetailStateService<T = any> {
  private readonly _selectedItem = signal<T | null>(null);
  private readonly _detailOpen = signal(false);
  private readonly _globalFilter = signal('');
  private readonly _loading = signal(false);

  readonly selectedItem = this._selectedItem.asReadonly();
  readonly detailOpen = this._detailOpen.asReadonly();
  readonly hasSelection = computed(() => this._selectedItem() !== null);
  readonly globalFilter = this._globalFilter.asReadonly();
  readonly loading = this._loading.asReadonly();

  selectItem(item: T | null): void {
    this._selectedItem.set(item);
  }

  clearSelection(): void {
    this._selectedItem.set(null);
  }

  openDetail(item?: T): void {
    if (item) this._selectedItem.set(item);
    this._detailOpen.set(true);
  }

  closeDetail(): void {
    this._detailOpen.set(false);
  }

  toggleDetail(): void {
    this._detailOpen.update(v => !v);
  }

  setGlobalFilter(value: string): void {
    this._globalFilter.set(value);
  }

  setLoading(value: boolean): void {
    this._loading.set(value);
  }
}
