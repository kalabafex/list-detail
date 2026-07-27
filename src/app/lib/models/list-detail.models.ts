import { TemplateRef } from '@angular/core';

export type ColumnType = 'text' | 'numeric' | 'date' | 'tag' | 'boolean' | 'custom';

export interface ColumnConfig<T = any> {
  field: string;
  header: string;
  type?: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  filterMatchMode?: string;
  dateFormat?: string;
  tagSeverityMap?: Record<string, string>;
  cellTemplate?: TemplateRef<any>;
  width?: string;
  visible?: boolean;
  frozen?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
}

export interface PaginationConfig {
  pageSize?: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showCurrentPageReport?: boolean;
}

export interface ListConfig<T = any> {
  columns: ColumnConfig<T>[];
  dataKey?: string;
  pagination?: PaginationConfig;
  globalFilter?: boolean;
  globalFilterPlaceholder?: string;
  multiSort?: boolean;
  selectable?: boolean;
  selectionMode?: 'single' | 'multiple';
  exportable?: boolean;
  columnToggle?: boolean;
  lazy?: boolean;
  striped?: boolean;
  scrollHeight?: string;
  emptyMessage?: string;
}

export type DetailPanelMode = 'sidebar' | 'overlay' | 'below';

export interface DetailPanelConfig {
  mode?: DetailPanelMode;
  width?: string;
  position?: 'right' | 'left';
  closable?: boolean;
  closeOnEscape?: boolean;
  blockScroll?: boolean;
  modal?: boolean;
  header?: string;
}

export interface ListDetailConfig<T = any> {
  list: ListConfig<T>;
  detail?: DetailPanelConfig;
}

export interface ListDetailRowSelectEvent<T = any> {
  data: T;
  index: number;
  originalEvent?: Event;
}

export interface ListDetailLazyLoadEvent {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: number;
  filters?: Record<string, any>;
  globalFilter?: string;
}
