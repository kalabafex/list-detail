import {
  Component, Input, Output, EventEmitter, ViewChild,
  ChangeDetectionStrategy, inject, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import {
  ColumnConfig, ListConfig, PaginationConfig,
  ListDetailRowSelectEvent, ListDetailLazyLoadEvent,
} from '../../models/list-detail.models';
import { ListDetailStateService } from '../../services/list-detail-state.service';
import { ResolveFieldPipe } from '../../pipes/resolve-field.pipe';

const DEFAULT_PAGINATION: PaginationConfig = {
  pageSize: 10,
  pageSizeOptions: [5, 10, 25, 50],
  showPageSizeSelector: true,
  showCurrentPageReport: true,
};

@Component({
  selector: 'lib-data-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, InputTextModule, TagModule, ButtonModule,
    MultiSelectModule, SelectModule, IconFieldModule, InputIconModule,
    ResolveFieldPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Toolbar -->
    <div class="list-toolbar">
      <div *ngIf="config.globalFilter !== false" class="list-toolbar__search">
        <p-iconfield iconPosition="left">
          <p-inputicon styleClass="pi pi-search" />
          <input
            pInputText
            type="text"
            [placeholder]="config.globalFilterPlaceholder ?? 'Search across all fields...'"
            (input)="onGlobalFilter($event)"
            class="search-input"
          />
        </p-iconfield>
      </div>

      <div class="list-toolbar__actions">
        <p-multiselect
          *ngIf="config.columnToggle"
          [options]="toggleableColumns"
          [(ngModel)]="visibleColumns"
          optionLabel="header"
          placeholder="Columns"
          [showHeader]="false"
          [style]="{ 'min-width': '160px' }"
          (onChange)="onColumnToggle()"
        />
        <button
          *ngIf="config.exportable"
          pButton
          icon="pi pi-download"
          label="Export"
          class="p-button-outlined p-button-sm"
          (click)="exportCsv()"
        ></button>
      </div>
    </div>

    <!-- Table -->
    <p-table
      #dt
      [value]="data"
      [columns]="activeColumns"
      [dataKey]="config.dataKey ?? 'id'"
      [rows]="paginationConfig.pageSize!"
      [rowsPerPageOptions]="paginationConfig.pageSizeOptions!"
      [paginator]="true"
      [showCurrentPageReport]="paginationConfig.showCurrentPageReport!"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
      [globalFilterFields]="globalFilterFields"
      [sortMode]="config.multiSort ? 'multiple' : 'single'"
      [selectionMode]="config.selectionMode ?? 'single'"
      [(selection)]="selection"
      (onRowSelect)="onRowSelect($event)"
      (onRowUnselect)="onRowUnselect()"
      [lazy]="config.lazy ?? false"
      (onLazyLoad)="onLazyLoad($event)"
      [loading]="state.loading()"
      [totalRecords]="totalRecords"
      [stripedRows]="config.striped ?? true"
      [scrollable]="!!config.scrollHeight"
      [scrollHeight]="config.scrollHeight ?? ''"
      [rowHover]="true"
      [tableStyle]="{ 'min-width': '50rem' }"
    >
      <!-- Header -->
      <ng-template pTemplate="header" let-columns>
        <tr>
          <th
            *ngFor="let col of columns"
            [pSortableColumn]="col.sortable ? col.field : undefined"
            [style.width]="col.width ?? 'auto'"
            [style.text-align]="col.align ?? 'left'"
          >
            {{ col.header }}
            <p-sortIcon *ngIf="col.sortable" [field]="col.field" />
          </th>
        </tr>

        <!-- Column filters row -->
        <tr *ngIf="hasFilterableColumns">
          <th *ngFor="let col of columns" class="filter-cell">
            <ng-container *ngIf="col.filterable">
              <ng-container [ngSwitch]="col.type">
                <p-select
                  *ngSwitchCase="'tag'"
                  [options]="getTagOptions(col)"
                  [placeholder]="'All'"
                  (onChange)="dt.filter($event.value, col.field, 'equals')"
                  [showClear]="true"
                  [style]="{ width: '100%' }"
                />
                <input
                  *ngSwitchDefault
                  pInputText
                  type="text"
                  [placeholder]="'Filter...'"
                  (input)="dt.filter(getInputValue($event), col.field, col.filterMatchMode ?? 'contains')"
                  class="filter-input"
                />
              </ng-container>
            </ng-container>
          </th>
        </tr>
      </ng-template>

      <!-- Body -->
      <ng-template pTemplate="body" let-rowData let-columns="columns" let-rowIndex="rowIndex">
        <tr [pSelectableRow]="rowData" [pSelectableRowIndex]="rowIndex">
          <td *ngFor="let col of columns" [style.text-align]="col.align ?? 'left'">
            <ng-container [ngSwitch]="col.type">
              <ng-container *ngSwitchCase="'tag'">
                <p-tag
                  [value]="rowData | resolveField:col.field"
                  [severity]="getTagSeverity(col, rowData | resolveField:col.field)"
                />
              </ng-container>
              <ng-container *ngSwitchCase="'date'">
                {{ (rowData | resolveField:col.field) | date:(col.dateFormat ?? 'mediumDate') }}
              </ng-container>
              <ng-container *ngSwitchCase="'boolean'">
                <i class="pi" [ngClass]="{
                  'pi-check-circle text-green-500': (rowData | resolveField:col.field),
                  'pi-times-circle text-red-400': !(rowData | resolveField:col.field)
                }"></i>
              </ng-container>
              <ng-container *ngSwitchCase="'numeric'">
                {{ (rowData | resolveField:col.field) | number }}
              </ng-container>
              <ng-container *ngSwitchCase="'custom'">
                <ng-container *ngTemplateOutlet="col.cellTemplate!; context: { $implicit: rowData, field: col.field }" />
              </ng-container>
              <ng-container *ngSwitchDefault>
                {{ rowData | resolveField:col.field }}
              </ng-container>
            </ng-container>
          </td>
        </tr>
      </ng-template>

      <!-- Empty state -->
      <ng-template pTemplate="emptymessage" let-columns>
        <tr>
          <td [attr.colspan]="columns.length" class="list-empty-state">
            <div class="empty-content">
              <i class="pi pi-inbox"></i>
              <p>{{ config.emptyMessage ?? 'No records found.' }}</p>
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: [`
    .list-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .list-toolbar__search { flex: 1 1 280px; max-width: 400px; }
    .list-toolbar__actions { display: flex; gap: 0.5rem; align-items: center; }
    .search-input { width: 100%; }
    .filter-cell { padding: 0.25rem 0.5rem !important; }
    .filter-input { width: 100%; font-size: 0.875rem; }
    .list-empty-state { text-align: center; padding: 3rem 1rem !important; }
    .empty-content i { font-size: 2.5rem; opacity: 0.4; margin-bottom: 0.5rem; display: block; }
    .empty-content p { margin: 0; opacity: 0.6; }
  `],
})
export class DataListComponent<T = any> implements OnInit {
  @ViewChild('dt') table!: Table;

  @Input({ required: true }) config!: ListConfig<T>;
  @Input() data: T[] = [];
  @Input() totalRecords = 0;

  @Output() rowSelect = new EventEmitter<ListDetailRowSelectEvent<T>>();
  @Output() rowUnselect = new EventEmitter<void>();
  @Output() lazyLoad = new EventEmitter<ListDetailLazyLoadEvent>();

  readonly state = inject(ListDetailStateService);

  selection: T | T[] | null = null;
  visibleColumns: ColumnConfig<T>[] = [];
  paginationConfig: PaginationConfig = DEFAULT_PAGINATION;

  get activeColumns(): ColumnConfig<T>[] {
    return this.config.columnToggle
      ? this.visibleColumns
      : this.config.columns.filter(c => c.visible !== false);
  }

  get toggleableColumns(): ColumnConfig<T>[] {
    return this.config.columns.filter(c => !c.frozen);
  }

  get globalFilterFields(): string[] {
    return this.config.columns
      .filter(c => c.filterable || c.type === 'text' || !c.type)
      .map(c => c.field);
  }

  get hasFilterableColumns(): boolean {
    return this.config.columns.some(c => c.filterable);
  }

  ngOnInit(): void {
    this.paginationConfig = { ...DEFAULT_PAGINATION, ...this.config.pagination };
    this.visibleColumns = this.config.columns.filter(c => c.visible !== false);
  }

  onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.state.setGlobalFilter(value);
    this.table.filterGlobal(value, 'contains');
  }

  onRowSelect(event: any): void {
    this.state.openDetail(event.data);
    this.rowSelect.emit({
      data: event.data,
      index: event.index ?? 0,
      originalEvent: event.originalEvent,
    });
  }

  onRowUnselect(): void {
    this.state.closeDetail();
    this.rowUnselect.emit();
  }

  onLazyLoad(event: any): void {
    this.lazyLoad.emit({
      first: event.first,
      rows: event.rows,
      sortField: event.sortField,
      sortOrder: event.sortOrder,
      filters: event.filters,
      globalFilter: event.globalFilter,
    });
  }

  onColumnToggle(): void {}

  exportCsv(): void {
    this.table.exportCSV();
  }

  getTagSeverity(col: ColumnConfig, value: any): any {
    return col.tagSeverityMap?.[value] ?? 'info';
  }

  getTagOptions(col: ColumnConfig): any[] {
    return col.tagSeverityMap
      ? Object.keys(col.tagSeverityMap).map(k => ({ label: k, value: k }))
      : [];
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
