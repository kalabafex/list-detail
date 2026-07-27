import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListDetailContainerComponent } from './lib/components/list-detail-container/list-detail-container.component';
import { ColumnConfig, ListDetailConfig, ListDetailRowSelectEvent } from './lib/models/list-detail.models';

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  hireDate: string;
  salary: number;
  remote: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ListDetailContainerComponent],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <h1>
          <i class="pi pi-objects-column"></i>
          List &middot; Detail Component
        </h1>
        <p>Config-driven reusable table with slide-out detail panel</p>
      </header>

      <main class="app-content">
        <lib-list-detail
          [config]="config"
          [data]="employees"
          (rowSelect)="onSelect($event)"
          (detailClosed)="onDetailClosed()"
        >
          <!-- Detail body template -->
          <ng-template #detailTpl let-emp>
            <div class="detail-card">
              <div class="detail-avatar">
                {{ getInitials(emp.name) }}
              </div>
              <h2 class="detail-name">{{ emp.name }}</h2>
              <p class="detail-role">{{ emp.role }}</p>

              <div class="detail-section">
                <div class="detail-row">
                  <span class="detail-label"><i class="pi pi-envelope"></i> Email</span>
                  <span class="detail-value">{{ emp.email }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label"><i class="pi pi-building"></i> Department</span>
                  <span class="detail-value">{{ emp.department }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label"><i class="pi pi-calendar"></i> Hire Date</span>
                  <span class="detail-value">{{ emp.hireDate | date:'longDate' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label"><i class="pi pi-dollar"></i> Salary</span>
                  <span class="detail-value">{{ emp.salary | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label"><i class="pi pi-globe"></i> Remote</span>
                  <span class="detail-value">{{ emp.remote ? 'Yes' : 'No' }}</span>
                </div>
              </div>
            </div>
          </ng-template>
        </lib-list-detail>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .app-header {
      margin-bottom: 2rem;
    }
    .app-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .app-header p {
      margin: 0;
      opacity: 0.6;
      font-size: 0.95rem;
    }
    .app-content {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    }

    /* Detail panel content */
    .detail-card { text-align: center; padding: 1rem 0; }
    .detail-avatar {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 700;
      margin: 0 auto 1rem;
    }
    .detail-name { margin: 0; font-size: 1.35rem; font-weight: 700; }
    .detail-role { margin: 0.25rem 0 1.5rem; opacity: 0.55; font-size: 0.9rem; }
    .detail-section { text-align: left; }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-label {
      font-size: 0.875rem;
      color: #64748b;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .detail-label i { font-size: 0.875rem; }
    .detail-value {
      font-weight: 500;
      font-size: 0.9rem;
    }
  `],
})
export class AppComponent {

  config: ListDetailConfig<Employee> = {
    list: {
      columns: [
        { field: 'name',       header: 'Name',       sortable: true, filterable: true,  width: '180px' },
        { field: 'email',      header: 'Email',      sortable: true, filterable: true },
        { field: 'department', header: 'Department', sortable: true, filterable: true },
        { field: 'role',       header: 'Role',       sortable: true, filterable: true },
        {
          field: 'status', header: 'Status', sortable: true, filterable: true,
          type: 'tag',
          tagSeverityMap: { Active: 'success', Inactive: 'danger', 'On Leave': 'warn' },
        },
        { field: 'hireDate', header: 'Hired',  sortable: true, type: 'date' },
        { field: 'remote',   header: 'Remote', sortable: true, type: 'boolean', align: 'center', width: '90px' },
      ],
      dataKey: 'id',
      globalFilter: true,
      globalFilterPlaceholder: 'Search employees...',
      exportable: true,
      striped: true,
      pagination: { pageSize: 10, pageSizeOptions: [5, 10, 25] },
      emptyMessage: 'No employees match your search.',
    },
    detail: {
      mode: 'sidebar',
      width: '400px',
      position: 'right',
      closable: true,
      closeOnEscape: true,
      modal: true,
      header: 'Employee Detail',
    },
  };

  employees: Employee[] = [
    { id: 1,  name: 'Marcus Johnson',    email: 'mjohnson@acme.co',    role: 'Senior Engineer',     department: 'Engineering', status: 'Active',   hireDate: '2021-03-15', salary: 142000, remote: true },
    { id: 2,  name: 'Sarah Chen',        email: 'schen@acme.co',       role: 'Design Lead',         department: 'Design',      status: 'Active',   hireDate: '2022-07-01', salary: 128000, remote: false },
    { id: 3,  name: 'David Okonkwo',     email: 'dokonkwo@acme.co',    role: 'Staff Engineer',      department: 'Engineering', status: 'On Leave', hireDate: '2020-11-20', salary: 158000, remote: true },
    { id: 4,  name: 'Emily Rodriguez',   email: 'erodriguez@acme.co',  role: 'Product Manager',     department: 'Product',     status: 'Active',   hireDate: '2023-01-10', salary: 135000, remote: false },
    { id: 5,  name: 'James Park',        email: 'jpark@acme.co',       role: 'DevOps Engineer',     department: 'Engineering', status: 'Inactive', hireDate: '2019-06-05', salary: 118000, remote: true },
    { id: 6,  name: 'Aisha Patel',       email: 'apatel@acme.co',      role: 'UX Researcher',       department: 'Design',      status: 'Active',   hireDate: '2023-04-22', salary: 105000, remote: false },
    { id: 7,  name: 'Carlos Mendez',     email: 'cmendez@acme.co',     role: 'Engineering Manager', department: 'Engineering', status: 'Active',   hireDate: '2018-09-12', salary: 172000, remote: true },
    { id: 8,  name: 'Priya Sharma',      email: 'psharma@acme.co',     role: 'Frontend Engineer',   department: 'Engineering', status: 'Active',   hireDate: '2022-10-03', salary: 125000, remote: true },
    { id: 9,  name: 'Michael Torres',    email: 'mtorres@acme.co',     role: 'Data Analyst',        department: 'Analytics',   status: 'Active',   hireDate: '2021-08-18', salary: 98000,  remote: false },
    { id: 10, name: 'Fatima Al-Hassan',  email: 'falhassan@acme.co',   role: 'QA Lead',             department: 'Engineering', status: 'Active',   hireDate: '2020-02-14', salary: 112000, remote: true },
    { id: 11, name: "Ryan O'Brien",      email: 'robrien@acme.co',     role: 'Tech Writer',         department: 'Product',     status: 'Active',   hireDate: '2023-06-30', salary: 88000,  remote: true },
    { id: 12, name: 'Yuki Tanaka',       email: 'ytanaka@acme.co',     role: 'Backend Engineer',    department: 'Engineering', status: 'On Leave', hireDate: '2021-12-01', salary: 138000, remote: false },
  ];

  onSelect(event: ListDetailRowSelectEvent<Employee>): void {
    console.log('Row selected:', event.data.name);
  }

  onDetailClosed(): void {
    console.log('Detail panel closed');
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
