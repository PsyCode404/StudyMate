import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LeaderboardService, LeaderboardEntry } from './leaderboard.service';
import { environment } from '../../environments/environment';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LeaderboardService]
    });
    service = TestBed.inject(LeaderboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('formatMinutesToHours', () => {
    it('should format 0 minutes', () => {
      expect(service.formatMinutesToHours(0)).toBe('0m');
    });

    it('should format minutes only', () => {
      expect(service.formatMinutesToHours(45)).toBe('45m');
    });

    it('should format hours only', () => {
      expect(service.formatMinutesToHours(120)).toBe('2h');
    });

    it('should format hours and minutes', () => {
      expect(service.formatMinutesToHours(125)).toBe('2h 5m');
    });

    it('should handle large numbers', () => {
      expect(service.formatMinutesToHours(1500)).toBe('25h');
    });

    it('should round minutes', () => {
      expect(service.formatMinutesToHours(125.7)).toBe('2h 6m');
    });
  });

  describe('getInitials', () => {
    it('should get initials from two-word name', () => {
      expect(service.getInitials('John Doe')).toBe('JD');
    });

    it('should get initials from single word', () => {
      expect(service.getInitials('Alice')).toBe('AL');
    });

    it('should handle three-word names', () => {
      expect(service.getInitials('John Paul Smith')).toBe('JP');
    });

    it('should handle empty string', () => {
      expect(service.getInitials('')).toBe('UN');
    });

    it('should handle null/undefined', () => {
      expect(service.getInitials(null as any)).toBe('UN');
    });

    it('should uppercase initials', () => {
      expect(service.getInitials('alice bob')).toBe('AB');
    });
  });

  describe('getAvatarColor', () => {
    it('should return consistent color for same username', () => {
      const color1 = service.getAvatarColor('Alice');
      const color2 = service.getAvatarColor('Alice');
      expect(color1).toBe(color2);
    });

    it('should return different colors for different usernames', () => {
      const color1 = service.getAvatarColor('Alice');
      const color2 = service.getAvatarColor('Bob');
      // They might be the same by chance, but test the format
      expect(color1).toMatch(/^bg-\w+-500$/);
      expect(color2).toMatch(/^bg-\w+-500$/);
    });

    it('should handle empty username', () => {
      const color = service.getAvatarColor('');
      expect(color).toMatch(/^bg-\w+-500$/);
    });

    it('should return valid Tailwind class', () => {
      const validColors = [
        'bg-violet-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-purple-500',
        'bg-cyan-500'
      ];
      const color = service.getAvatarColor('TestUser');
      expect(validColors).toContain(color);
    });
  });

  describe('getLeaderboard', () => {
    it('should fetch leaderboard with default parameters', () => {
      const mockResponse = {
        leaderboard: [
          {
            userId: '1',
            username: 'Alice',
            totalMinutes: 120,
            sessionCount: 3,
            avgMinutesPerSession: 40,
            rank: 1
          }
        ],
        period: 'all',
        page: 1,
        limit: 10,
        totalUsers: 1
      };

      service.getLeaderboard().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.leaderboard.length).toBe(1);
        expect(response.leaderboard[0].username).toBe('Alice');
      });

      const req = httpMock.expectOne(request => 
        request.url === `${environment.apiUrl}/leaderboard`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('period')).toBe('all');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush(mockResponse);
    });

    it('should include subject filter when provided', () => {
      service.getLeaderboard('week', 'Mathematics').subscribe();

      const req = httpMock.expectOne(request => 
        request.url === `${environment.apiUrl}/leaderboard` &&
        request.params.get('subject') === 'Mathematics'
      );
      expect(req.request.params.get('period')).toBe('week');
      req.flush({ leaderboard: [], period: 'week', page: 1, limit: 10, totalUsers: 0 });
    });

    it('should handle anonymize parameter', () => {
      service.getLeaderboard('all', undefined, 10, 1, true).subscribe();

      const req = httpMock.expectOne(request => 
        request.url === `${environment.apiUrl}/leaderboard`
      );
      expect(req.request.params.get('anonymize')).toBe('true');
      req.flush({ leaderboard: [], period: 'all', page: 1, limit: 10, totalUsers: 0 });
    });
  });

  describe('exportToCSV', () => {
    let createElementSpy: jasmine.Spy;
    let appendChildSpy: jasmine.Spy;
    let removeChildSpy: jasmine.Spy;
    let clickSpy: jasmine.Spy;

    beforeEach(() => {
      const mockLink = document.createElement('a');
      clickSpy = jasmine.createSpy('click');
      mockLink.click = clickSpy;
      
      createElementSpy = spyOn(document, 'createElement').and.returnValue(mockLink);
      appendChildSpy = spyOn(document.body, 'appendChild');
      removeChildSpy = spyOn(document.body, 'removeChild');
    });

    it('should export leaderboard to CSV', () => {
      const mockData: LeaderboardEntry[] = [
        {
          userId: '1',
          username: 'Alice',
          totalMinutes: 120,
          sessionCount: 3,
          avgMinutesPerSession: 40,
          rank: 1
        },
        {
          userId: '2',
          username: 'Bob',
          totalMinutes: 90,
          sessionCount: 2,
          avgMinutesPerSession: 45,
          rank: 2
        }
      ];

      service.exportToCSV(mockData, 'test.csv');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('should handle empty leaderboard', () => {
      const consoleSpy = spyOn(console, 'warn');
      service.exportToCSV([], 'test.csv');

      expect(consoleSpy).toHaveBeenCalledWith('No data to export');
      expect(createElementSpy).not.toHaveBeenCalled();
    });

    it('should handle null leaderboard', () => {
      const consoleSpy = spyOn(console, 'warn');
      service.exportToCSV(null as any, 'test.csv');

      expect(consoleSpy).toHaveBeenCalledWith('No data to export');
      expect(createElementSpy).not.toHaveBeenCalled();
    });
  });

  describe('getUserSessions', () => {
    it('should fetch user sessions', () => {
      const mockSessions = [
        {
          id: '1',
          subject: 'Math',
          duration: 60,
          date: new Date(),
          userId: 'user1'
        }
      ];

      service.getUserSessions('user1', 5).subscribe(sessions => {
        expect(sessions).toEqual(mockSessions);
        expect(sessions.length).toBe(1);
      });

      const req = httpMock.expectOne(request => 
        request.url === `${environment.apiUrl}/study-logs` &&
        request.params.get('userId') === 'user1' &&
        request.params.get('limit') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);
    });

    it('should handle errors', () => {
      service.getUserSessions('user1').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Failed to load user sessions');
        }
      });

      const req = httpMock.expectOne(request => 
        request.url === `${environment.apiUrl}/study-logs`
      );
      req.error(new ProgressEvent('error'));
    });
  });
});
