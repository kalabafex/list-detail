import {
  Component, Input, Output, EventEmitter,
  ContentChild, TemplateRef, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataListComponent } from '../data-list/data-list.component';
import { DetailPanelComponent } from '../detail-panel/detail-panel.component';
import {
  ListDetailConfig, ListConfig, DetailPanelConfig,
  ListDetailRowSelectEvent, ListDetailLazyLoadEvent,
} from '../../models/list-detail.models';
import { ListDetailStateService } from '../../services/list-detail-state.service';

@Component({
  selector: 'lib-list-detail',
  standalone: true,
  imports: [CommonModule, DataListComponent, DetailPanelComponent],
  providers: [ListDetailStateService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list-detail-container">
      <lib-data-list
        [config]="listConfig"
        [data]="data"
        [totalRecords]="totalRecords"
        (rowSelect)="rowSelect.emit($event)"
        (rowUnselect)="rowUnselect.emit()"
        (lazyLoad)="lazyLoad.emit($event)"
      />

      @if (detailTemplate) {
        <lib-detail-panel
          [config]="detailConfig"
          [detailTemplate]="detailTemplate"
          (closed)="detailClosed.emit()"
        />
      }
    </div>
  `,
  styles: [`.list-detail-container { width: 100%; }`],
})
export class ListDetailContainerComponent<T = any> {
  // Combined config
  @Input() config?: ListDetailConfig<T>;

  // Split config (alternative)
  @Input() columns?: ListConfig<T>['columns'];
  @Input() listOptions?: Partial<ListConfig<T>>;
  @Input() detailOptions?: DetailPanelConfig;

  // Data
  @Input({ required: true }) data: T[] = [];
  @Input() totalRecords = 0;

  // Template projections
  @ContentChild('detailTpl') detailTemplate!: TemplateRef<any>;
  @ContentChild('headerTpl') headerTemplate?: TemplateRef<any>;

  // Outputs
  @Output() rowSelect = new EventEmitter<ListDetailRowSelectEvent<T>>();
  @Output() rowUnselect = new EventEmitter<void>();
  @Output() lazyLoad = new EventEmitter<ListDetailLazyLoadEvent>();
  @Output() detailClosed = new EventEmitter<void>();

  get listConfig(): ListConfig<T> {
    if (this.config) return this.config.list;
    return { columns: this.columns ?? [], ...this.listOptions };
  }

  get detailConfig(): DetailPanelConfig | undefined {
    return this.config?.detail ?? this.detailOptions;
  }
}
