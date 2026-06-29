import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <nav class="mt-4">
      <ul class="pagination justify-content-center mb-0">
        <li class="page-item" [class.disabled]="desactivePrecedent">
          <a class="page-link" role="button" (click)="onPageChange(currentPage - 1)">
            Précédent
          </a>
        </li>
        @for (page of pages; track page) {
          <li class="page-item" [class.active]="page === currentPage">
            <a class="page-link" role="button" (click)="onPageChange(page)">
              {{ page }}
            </a>
          </li>
        }
        <li class="page-item" [class.disabled]="desactiveSuivant">
          <a class="page-link" role="button" (click)="onPageChange(currentPage + 1)">
            Suivant
          </a>
        </li>
      </ul>
    </nav>
  `,
})
export class PaginationComponent {
  @Input({ required: true }) pages: number[] = [];
  @Input({ required: true }) currentPage = 1;
  @Output() pageChange = new EventEmitter<number>();

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pages.length && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  get desactivePrecedent(): boolean {
    return !(this.currentPage > 1);
  }

  get desactiveSuivant(): boolean {
    return !(this.currentPage < this.pages.length);
  }
}
