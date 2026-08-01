import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { HealthService } from '../../core/services/health';

@Component({
  selector: 'gv-health-check',
  templateUrl: './health-check.html',
  styleUrl: './health-check.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class HealthCheck implements OnInit {
  readonly status = signal<'loading' | 'Ok' | 'error'>('loading');
  readonly errorMessage = signal<string | null>(null);

  private readonly healthService = inject(HealthService);

  ngOnInit(): void {
    this.checkHealth();
  }

  checkHealth(): void {
    this.status.set('loading');
    this.errorMessage.set(null);

    this.healthService.check().subscribe({
      next: (response) => {
        if (response.status === 'Ok') {
          this.status.set('Ok');
        } else {
          console.log(response.status)
          this.status.set('error');
          this.errorMessage.set('Servidor está com problemas.');
        }
      },
      error: (err) => {
        console.error(err);
        this.status.set('error');
        this.errorMessage.set('Não foi possível conectar ao servidor.');
      },
    });
  }
}
