import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AiAdvisorService, AiAdviceResponse } from './ai-advisor.service';
import { environment } from '../../environments/environment';

describe('AiAdvisorService', () => {
  let service: AiAdvisorService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/ai/advice`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AiAdvisorService]
    });
    service = TestBed.inject(AiAdvisorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request AI advice successfully', (done) => {
    const mockResponse: AiAdviceResponse = {
      message: 'Great job! Keep studying consistently.',
      sessionCount: 5,
      totalMinutes: 300
    };

    service.requestAdvice('Mathematics', 85).subscribe({
      next: (response) => {
        expect(response).toEqual(mockResponse);
        expect(response.sessionCount).toBe(5);
        expect(response.totalMinutes).toBe(300);
        done();
      }
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ subject: 'Mathematics', mark: 85 });
    req.flush(mockResponse);
  });

  it('should trim subject whitespace', (done) => {
    const mockResponse: AiAdviceResponse = {
      message: 'Test advice',
      sessionCount: 0,
      totalMinutes: 0
    };

    service.requestAdvice('  Physics  ', 75).subscribe({
      next: () => done()
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.body.subject).toBe('Physics');
    req.flush(mockResponse);
  });

  it('should handle 429 rate limit error', (done) => {
    service.requestAdvice('Chemistry', 90).subscribe({
      error: (error) => {
        expect(error.message).toContain('Too many requests');
        done();
      }
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush('Rate limit exceeded', { status: 429, statusText: 'Too Many Requests' });
  });

  it('should handle 401 authentication error', (done) => {
    service.requestAdvice('Biology', 80).subscribe({
      error: (error) => {
        expect(error.message).toContain('session has expired');
        done();
      }
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle 500 server error', (done) => {
    service.requestAdvice('English', 70).subscribe({
      error: (error) => {
        expect(error.message).toContain('Server error');
        done();
      }
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
  });
});
