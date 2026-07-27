import {
  Component, Input, Output, EventEmitter,
  TemplateRef, ChangeDetectionStrategy, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

import { DetailPanelConfig } from '../../models/list-detail.models';
import { ListDetailStateService } from '../../services/list-detail-state.service';

const DEFAULTS: DetailPanelConfig = {
  mode: 'sidebar',
  width: '420px',
  position: 'right',
  closable: true,
  closeOnEscape: true,
  blockScroll: false,
  modal: false,
};

@Component({
  selector: 'lib-detail-panel',
  standalone: true,
  imports: [CommonModule, DrawerModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Sidebar / Overlay mode → p-drawer -->
    @if (cfg.mode === 'sidebar' || cfg.mode === 'overlay') {
      <p-drawer
        [(visible)]="drawerVisible"
        [position]="cfg.position ?? 'right'"
        [style]="{ width: cfg.width ?? '420px' }"
        [modal]="cfg.mode === 'overlay' || cfg.modal!"
        [blockScroll]="cfg.blockScroll!"
        [closeOnEscape]="cfg.closeOnEscape!"
        [showCloseIcon]="cfg.closable!"
        [header]="cfg.header ?? 'Detail'"
        (onHide)="onClose()"
        styleClass="detail-drawer"
      >
        <ng-template pTemplate="content">
          @if (state.selectedItem(); as item) {
            <div class="detail-body">
              <ng-container *ngTemplateOutlet="detailTemplate; context: { $implicit: item }" />
            </div>
          }
        </ng-template>
      </p-drawer>
    }

    <!-- Below mode → inline panel under the table -->
    @if (cfg.mode === 'below' && state.detailOpen()) {
      @if (state.selectedItem(); as item) {
        <div class="detail-below">
          <div class="detail-below__header">
            <h3>{{ cfg.header ?? 'Detail' }}</h3>
            @if (cfg.closable !== false) {
              <button
                pButton
                icon="pi pi-times"
                class="p-button-text p-button-rounded p-button-sm"
                (click)="onClose()"
              ></button>
            }
          </div>
          <div class="detail-body">
            <ng-container *ngTemplateOutlet="detailTemplate; context: { $implicit: item }" />
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .detail-body { padding: 0.5rem 0; }
    .detail-below {
      border: 1px solid var(--p-surface-border, #e2e8f0);
      border-radius: 8px;
      margin-top: 1rem;
      overflow: hidden;
    }
    .detail-below__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid var(--p-surface-border, #e2e8f0);
      background: var(--p-surface-ground, #f8fafc);
    }
    .detail-below__header h3 { margin: 0; font-size: 1.1rem; font-weight: 600; }
  `],
})
export class DetailPanelComponent {
  @Input() config?: DetailPanelConfig;
  @Input() detailTemplate!: TemplateRef<any>;

  @Output() closed = new EventEmitter<void>();

  readonly state = inject(ListDetailStateService);

  get cfg(): DetailPanelConfig {
    return { ...DEFAULTS, ...this.config };
  }

  get drawerVisible(): boolean {
    return this.state.detailOpen();
  }

  set drawerVisible(value: boolean) {
    value ? this.state.openDetail() : this.state.closeDetail();
  }

  onClose(): void {
    this.state.closeDetail();
    this.closed.emit();
  }
}
