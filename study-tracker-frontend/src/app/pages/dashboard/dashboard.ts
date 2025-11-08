import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalyticsService, DailyStats, SubjectStats, OverallStats } from '../../services/analytics.service';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    BaseChartDirective,
    MatIconModule,
    MatProgressSpinnerModule,
    SidebarComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  loading = true;
  overallStats: OverallStats | null = null;
  weeklyStats: DailyStats[] = [];
  subjectStats: SubjectStats[] = [];

  // Weekly Chart Configuration
  weeklyChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Study Hours',
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(124, 58, 237, 0.9)',
      }
    ]
  };

  weeklyChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context) => {
            return `${context.parsed.y} hours`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 12
          },
          callback: (value) => `${value}h`
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  weeklyChartType: ChartType = 'bar';

  // Subject Chart Configuration
  subjectChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(217, 70, 239, 0.8)',
          'rgba(124, 58, 237, 0.8)',
          'rgba(192, 38, 211, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(233, 213, 255, 0.8)',
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(217, 70, 239, 1)',
          'rgba(124, 58, 237, 1)',
          'rgba(192, 38, 211, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(233, 213, 255, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  subjectChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = this.subjectStats.find(s => s.subject === label)?.percentage || 0;
            return `${label}: ${value}h (${percentage}%)`;
          }
        }
      }
    }
  };

  subjectChartType: ChartType = 'doughnut';

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Load overall stats
    this.analyticsService.getOverallStats().subscribe({
      next: (stats) => {
        this.overallStats = stats;
      },
      error: (error) => {
        console.error('Error loading overall stats:', error);
      }
    });

    // Load weekly stats
    this.analyticsService.getWeeklyStats().subscribe({
      next: (stats) => {
        this.weeklyStats = stats;
        this.updateWeeklyChart(stats);
      },
      error: (error) => {
        console.error('Error loading weekly stats:', error);
      }
    });

    // Load subject stats
    this.analyticsService.getSubjectStats().subscribe({
      next: (stats) => {
        this.subjectStats = stats;
        this.updateSubjectChart(stats);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading subject stats:', error);
        this.loading = false;
      }
    });
  }

  updateWeeklyChart(stats: DailyStats[]): void {
    this.weeklyChartData.labels = stats.map(s => this.analyticsService.getDayName(s.date));
    this.weeklyChartData.datasets[0].data = stats.map(s => s.hours);
    this.chart?.update();
  }

  updateSubjectChart(stats: SubjectStats[]): void {
    // Limit to top 6 subjects
    const topSubjects = stats.slice(0, 6);
    this.subjectChartData.labels = topSubjects.map(s => s.subject);
    this.subjectChartData.datasets[0].data = topSubjects.map(s => s.hours);
    this.chart?.update();
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  // Helper methods for template calculations
  getTotalWeeklyHours(): number {
    return this.weeklyStats.reduce((sum, s) => sum + s.hours, 0);
  }

  getTotalWeeklySessions(): number {
    return this.weeklyStats.reduce((sum, s) => sum + s.sessions, 0);
  }

  getAverageDailyHours(): number {
    const total = this.getTotalWeeklyHours();
    return total / 7;
  }
}
